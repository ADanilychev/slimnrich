import json
import random
import re
import sys
import time
import uuid
from datetime import datetime
from io import BytesIO
from urllib.parse import parse_qs

import aiofiles
import jwt
from fastapi import FastAPI, Header, UploadFile, File, Query, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import filetype

sys.path.append("..")
from script.database.objects import (
    Users,
    BalanceHistory,
    QueueDeletion,
    Moderators,
    Messages,
    ByMyself,
    Reports,
    ReferralsRevenue,
    OneVsFriend,
    Withdrawals,
    WithYourGroup,
    OneVsOne,
    GroupForTime,
    GroupByWeight,
    PaymentMethods,
    Bloggers,
    Files,
    Likes,
    UserAlerts
)
from script.configuration.module import PAYMENTS_CHAT, ADMIN_IDS, C_PASS, MALE_AVATARS, FEMALE_AVATARS
from script.localization import available_languages, errors, prices, messages
from script.web.url_docs import *
from script.web.models import (
    check_session,
    crypto_invoice,
    send_message,
    check_for_ban,
    check_invoice,
    prepare_inline_message
)

app = FastAPI(
    title="SlimNRich API",
    description="API documentation for the application in telegram mini app.",
    version="1.0.0",
    docs_url=None,
    redoc_url=None
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://webapp.slim-n-rich.com",
        "webapp.slim-n-rich.com"
    ],
    allow_credentials=True,
    allow_methods=["POST", "GET", "DELETE", "PUT"],
    allow_headers=["*"],
)
app.mount("/api/static", StaticFiles(directory="static"), name="static")

AVAILABLE_AMOUNTS = Literal[
    "100", "300", "500", "700", "1000", "1200", "1500", "1800", "2100", "2500", "3000", "3500",
    "4000", "5000", "6000", "7000", "8000", "9000", "10000", "15000", "20000", "30000", "50000"
]

FREE_AVAILABLE_AMOUNTS = Literal[
    "0", "100", "300", "500", "700", "1000", "1200", "1500", "1800", "2100", "2500", "3000", "3500",
    "4000", "5000", "6000", "7000", "8000", "9000", "10000", "15000", "20000", "30000", "50000"
]


@app.get("/api/current-action", response_model=ActionResponse, tags=["User"])
async def current_action(
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        return {"result": user["data"].get("action", 0)}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/is_moderator", response_model=Dict, tags=["Moderator"])
async def check_role(
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        result = await Moderators.get_moderator(user["user_id"])
        if not isinstance(result, dict):
            if user["user_id"] in ADMIN_IDS:
                result = False
            else:
                result = None
        else:
            result = True
        return {"result": result}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/is_admin", response_model=Dict, tags=["Moderator"])
async def check_if_admin(
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user_id = await check_session(user_session, True)
    if isinstance(user_id, int):
        return {"result": bool(user_id in ADMIN_IDS)}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/user-data/language", response_model=Dict, tags=["User"])
async def user_language(
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        return {"result": user["data"].get("language", "en")}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/questions", response_model=List[QuestionsResponse], tags=["Register"])
async def questions_list(
    user_session: str = Header(description="Authorization Token")
) -> List:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user, True)
        language = user["data"].get("language", "en")
        if language not in available_languages:
            language = "en"
        return await get_current(language)
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/timezones", response_model=List[Dict], tags=["Register"])
async def timezones(
    user_session: str = Header(description="Authorization Token")
) -> List[Dict]:
    user = await check_session(user_session)
    if isinstance(user, dict):
        language = user["data"].get("language", "en")
        return questions["timezone"][language]["answers"][0]["answers"]
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/number_systems", response_model=List[Dict], tags=["Register"])
async def number_systems(
    user_session: str = Header(description="Authorization Token")
) -> List[Dict]:
    user = await check_session(user_session)
    if isinstance(user, dict):
        language = user["data"].get("language", "en")
        return [
            {"text": data.get("text", ""), "value": data.get("value", "")}
            for data in questions["numbers"][language]["answers"]
        ]
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/registration", response_model=SuccessResponse, tags=["Register"])
async def registration(
    data: Registration,
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        language = user["data"].get("language", "en")
        if not isinstance(user["data"].get("terms_accepted"), dict):
            raise HTTPException(status_code=400, detail=errors["terms_not_accepted"][language])
        if not user["about_data"]:
            data = json.loads(json.dumps(data.model_dump(), cls=RegisterEncoder))
            data = await registration_validator(data)
            try:
                weight = data["weight"]
                if isinstance(weight, str):
                    weight = float(weight)
                if (weight < 4.8) or (weight > 635):
                    raise ValueError
                data["weight"] = weight
            except ValueError:
                raise HTTPException(status_code=400, detail=errors["invalid_weight"][language])
            else:
                update_data = {"action": 2, "numbers": data.get("numbers", "kg/cm")}
                for key in ["timezone", "weight", "height"]:
                    value = data.pop(key)
                    if key == "weight":
                        value = round(value, 1)
                    update_data[key] = value
                    if key in ["weight", "height"]:
                        update_data[f"start_{key}"] = value
                if str(data.get("gender", "male")) == "male":
                    update_data["avatar"] = random.choice(MALE_AVATARS)
                elif str(data.get("gender", "male")) == "female":
                    update_data["avatar"] = random.choice(FEMALE_AVATARS)
                await Users.update_data(user["user_id"], update_data)
                await Users.update_user(user["user_id"], {"about_data": data})
                return {"result": True}
        else:
            raise HTTPException(status_code=400, detail=errors["retake_test"][language])
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/change-settings", response_model=SuccessResponse, tags=["User"])
async def change_settings(
    data: Settings,
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user, True)
        language = user["data"].get("language", "en")
        data = json.loads(json.dumps(data.model_dump(), cls=RegisterEncoder))
        update_data = {}
        for key, value in data.items():
            if value is not None:
                update_data[key] = value
        if not update_data:
            raise HTTPException(status_code=400, detail=errors["null_value"][language])
        await Users.update_data(user["user_id"], data)
        return {"result": True}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/user-data/basic", response_model=BasicDataResponse, tags=["User"])
async def basic_data(
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        return await Users.user_basic_info(user["user_id"])
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/user-data/balances", response_model=BalancesDataResponse, tags=["User"])
async def balances_data(
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        return await Users.user_balances_info(user["user_id"])
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/user-data/referrals", response_model=ReferralsDataResponse, tags=["User"])
async def referrals_data(
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        return await Users.user_referrals_info(user["user_id"])
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/user-data/stats", response_model=StatsDataResponse, tags=["User"])
async def stats_data(
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        return await Users.user_stats_info(user["user_id"])
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/user-data/stats/share", response_model=Dict, tags=["User"])
async def stats_share(
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        language = user["data"].get("language", "en")
        result = await prepare_inline_message(user["user_id"], language)
        if not isinstance(result, str):
            raise HTTPException(status_code=400, detail=errors["cannot_share_stats"][language])
        return {"result": result}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/user-data/battles", response_model=BattlesDataResponse, tags=["User"])
async def battles_data(
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        return await Users.user_battles_info(user)
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/terms/status", response_model=SuccessResponse, tags=["Terms"])
async def terms_data(
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        data = user["data"]
        if not isinstance(data.get("terms_accepted"), dict):
            return {"result": False}
        return {"result": True}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/terms/accept", response_model=SuccessResponse, tags=["Terms"])
async def terms_accept(
    request: Request,
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        data = user["data"]
        if not isinstance(data.get("terms_accepted"), dict):
            x_forwarded_for = request.headers.get("X-Forwarded-For")
            if x_forwarded_for:
                client_ip = x_forwarded_for.split(",")[0]
            else:
                client_ip = request.client.host
            current_timestamp = int(datetime.now().timestamp())
            accept_data = {"date": current_timestamp, "client_ip": client_ip}
            await Users.update_data(user["user_id"], {"terms_accepted": accept_data, "action": 1})
        return {"result": True}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/achievements", response_model=AchievementsResponse, tags=["User"])
async def achievements_data(
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        return await Users.user_achievements_info(user["user_id"])
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/buy_premium", response_model=SuccessResponse, tags=["User"])
async def buy_premium(
    period: Literal["monthly", "yearly"] = Query(..., description="Premium purchase period"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        language = user["data"].get("language", "en")
        balance_changed = await Users.change_balance(
            user["user_id"],
            prices[f"premium_{period}"] * -1,
            "both",
            "buy_premium"
        )
        if balance_changed is not True:
            raise HTTPException(status_code=400, detail=errors["small_balance"][language])
        premium_period = user["data"].get("premium", 0)
        current_timestamp = int(datetime.now().timestamp())
        premium_period = current_timestamp if premium_period < current_timestamp else premium_period
        new_purchase = 30 if period == "monthly" else 365
        premium_period += 86400 * new_purchase
        await Users.update_data(user["user_id"], {"premium": premium_period})
        await send_message(user["user_id"], messages["premium_chat"][language])
        return {"result": True}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/change-profile", response_model=SuccessResponse, tags=["User"])
async def change_profile(
    user_session: str = Header(description="Authorization Token"),
    nickname: str = Query(None, max_length=16, description="New user nickname"),
    file: Optional[UploadFile] = File(None, description="New user avatar", max_size=1024*1024*5),
    premium_only: bool = Query(True, description="If true is passed, then no attempt is made to write off the balance")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        language = user["data"].get("language", "en")
        update_data, kind, file_content = {}, None, None
        if (file in ["", None]) and (not isinstance(nickname, str)):
            raise HTTPException(status_code=400, detail=errors["data_required"][language])
        if isinstance(nickname, str):
            if not nickname.isalnum():
                raise HTTPException(status_code=400, detail=errors["only_alnum"][language])
            elif len(nickname) > 16:
                raise HTTPException(status_code=400, detail=errors["long_nickname"][language])
            update_data["name"] = nickname
        elif not file:
            raise HTTPException(status_code=400, detail=errors["data_required"][language])
        if file:
            try:
                content = await file.read()
                file_content = BytesIO(content)
                kind = filetype.guess(file_content)
                if (kind is None) or (kind.mime not in ["image/jpeg", "image/png", "image/webp", "image/heif"]):
                    raise Exception(errors["unknown_format"][language])
            except Exception as exc:
                raise HTTPException(status_code=400, detail=str(exc))
        current_timestamp = int(datetime.now().timestamp())
        is_premium = user["data"].get("premium", 0) > current_timestamp
        if (not is_premium) and (premium_only is True):
            raise HTTPException(status_code=400, detail=errors["premium_required"][language])
        elif not is_premium:
            balance_change = await Users.change_balance(
                user["user_id"],
                prices["change_profile"] * -1,
                "both",
                "profile_update",
                False
            )
            if balance_change is not True:
                raise HTTPException(status_code=400, detail=errors["small_balance"][language])
        if file and kind and file_content:
            try:
                extension = kind.mime.rsplit("/", 1)[-1].lower()
                filename = f"static/{str(uuid.uuid4())}.{extension}"
                async with aiofiles.open(filename, "wb") as f:
                    await f.write(file_content.getvalue())
                update_data["avatar"] = filename
                await QueueDeletion.add_file(user["data"].get("avatar", None))
            except Exception as _:
                pass
        if update_data:
            await Users.update_data(user["user_id"], update_data)
        return {"result": True}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/balance-history", response_model=Union[Dict, BalanceHistoryResponse], tags=["User"])
async def user_balance_history(
    start_timestamp: int = Query(0, ge=1, le=3000000000, description="Start of period (timestamp in seconds)"),
    end_timestamp: int = Query(0, ge=1, le=3000000000, description="End of period (timestamp in seconds)"),
    history_type: Literal["all", "real", "bonus"] = Query("all", description="Balance type"),
    page: int = Query(1, ge=1, le=100, description="Required results page number"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        language = user["data"].get("language", "en")
        if end_timestamp <= start_timestamp:
            raise HTTPException(status_code=400, detail=errors["small_timestamp"][language])
        return await BalanceHistory.get_history(
            user["user_id"],
            language,
            start_timestamp,
            end_timestamp,
            page,
            history_type
        )
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/alerts", tags=["User"], response_model=AlertsResponse)
async def user_alerts(
    group: Literal["all", "like", "referral", "battle"] = Query("all", description="Alerts group type"),
    page: int = Query(1, ge=1, le=1000, description="Required alerts page number"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        page = 1 if group.lower() == "all" else page
        group = None if str(group).lower() == "all" else str(group).lower()
        return await UserAlerts.get_alerts(user["user_id"], group, page)
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/alerts", tags=["User"], response_model=SuccessResponse)
async def user_reading_alerts(
    data: AlertsReading,
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        data = data.model_dump()
        await UserAlerts.read_alerts(user["user_id"], data["alert_ids"], data["all_condition"])
        return {"result": True}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.delete("/api/delete-account", tags=["User"], response_model=SuccessResponse)
async def delete_account(
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        update_data = {
            "banned": 5999999999,
            "last_ban_by": user["user_id"]
        }
        await Users.update_data(user["user_id"], update_data)
        return {"result": True}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/upload-photo", tags=["Upload"], response_model=UploadResultResponse)
async def upload_photo(
    user_session: str = Header(description="Authorization Token"),
    form_data: str = Form(description="Photo meta data"),
    file: UploadFile = File(description="Uploading photo", max_size=1024*1024*5)
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        try:
            form_data_dict = json.loads(form_data)
            photo_metadata = PhotoMetaData(**form_data_dict)
            form_data_dict = photo_metadata.dict()
            data = await photo_validation(form_data_dict)
            language = user["data"].get("language", "en")
            content = await file.read()
            file_content = BytesIO(content)
            kind = filetype.guess(file_content)
            if (kind is None) or (kind.mime not in ["image/jpeg", "image/png", "image/webp", "image/heif"]):
                raise Exception(errors["unknown_format"][language])
            extension = kind.mime.rsplit("/", 1)[-1].lower()
            filename = f"static/{str(uuid.uuid4())}.{extension}"
            result = await Files.add_file(
                user["user_id"],
                data["file_type"],
                filename,
                data["about"],
                data["title"],
                data.get("calories", 0),
                data.get("weight", 0)
            )
            if isinstance(result, dict):
                async with aiofiles.open(filename, "wb") as f:
                    await f.write(file_content.getvalue())
                return result
            else:
                raise Exception(errors["cannot_add_photo"][language])
        except Exception as exc:
            raise HTTPException(status_code=400, detail=str(exc))
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/gifts", tags=["Gifts"], response_model=BalancesDataResponse)
async def send_gift(
    user_session: str = Header(description="Authorization Token"),
    file_id: int = Query(description="File id")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        language = user["data"].get("language", "en")
        result = await Likes.add_like(file_id, user)
        if result is None:
            raise HTTPException(status_code=400, detail=errors["cannot_send_gift"][language])
        elif result is not True:
            raise HTTPException(status_code=400, detail=errors["small_balance"][language])
        else:
            return await Users.user_balances_info(user["user_id"])
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/gifts", tags=["Gifts"], response_model=List[GiftRating])
async def get_gifts(
    user_session: str = Header(description="Authorization Token"),
    file_id: int = Query(description="File id")
) -> List[Dict]:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        return await Likes.get_ratings(user["user_id"], file_id)
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/photos", tags=["Photos"], response_model=SuccessResponse)
async def edit_meta(
    data: MetaDataEdition,
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        data = data.model_dump()
        result = await Files.update_meta_data(
            user["user_id"],
            data["file_id"],
            data.get("title", ""),
            data.get("about", "")
        )
        if result is True:
            return {"result": True}
        else:
            language = user["data"].get("language", "en")
            raise HTTPException(status_code=400, detail=errors["file_not_found"][language])
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.put("/api/photos", tags=["Photos"], response_model=Dict)
async def share_photo(
    data: SelfText = None,
    user_session: str = Header(description="Authorization Token"),
    file_id: int = Query(description="File id")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        if not data:
            data = {}
        else:
            data = data.model_dump()
        language = user["data"].get("language", "en")
        photo = await Files.get_file(file_id)
        if not isinstance(photo, dict):
            raise HTTPException(status_code=400, detail=errors["file_not_found"][language])
        elif not isinstance(photo["photo"], str):
            raise HTTPException(status_code=400, detail=errors["file_out"][language])
        countdown = user["data"].get("countdown", 0)
        current_timestamp = int(datetime.now().timestamp())
        if (isinstance(countdown, int)) and (current_timestamp > countdown):
            await Users.update_data(user["user_id"], {"countdown": current_timestamp + 30})
            if str(photo["file_type"]) == "weight":
                title = f'{photo["weight"]} kg 🏋️'
            else:
                title = photo["meta_data"].get("title", "")
            if (user["user_id"] in ADMIN_IDS) and (len(data.get("text", "")) > 1):
                msg_text = data.get("text", "").replace("\n\n\n\n", "\n\n")
            else:
                msg_text = messages["photo_sharing"][language].format(
                    title=str(title).title(),
                    description=str(photo["meta_data"].get("description", "")),
                    user_id=str(photo["user_id"])
                ).replace("\n\n\n\n", "\n\n")
            photo_url = photo["photo"]
            if photo_url.startswith("static"):
                photo_url = f"https://webapp.slim-n-rich.com/api/{photo_url}"
            result = await prepare_inline_message(user["user_id"], language, msg_text, photo_url, None)
            if not isinstance(result, str):
                raise HTTPException(status_code=400, detail=errors["cannot_share_photo"][language])
            return {"result": result}
        elif not isinstance(countdown, int):
            await Users.update_data(user["user_id"], {"countdown": current_timestamp + 30})
        else:
            raise HTTPException(status_code=400, detail=errors["just_chill"][language])
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/chat", response_model=List[ChatHistoryResponse], tags=["Chat"])
async def chat_history(
    chat_id: int = Query(None, description="User id in telegram"),
    page: int = Query(1, ge=1, le=100, description="Required results page number"),
    user_session: str = Header(description="Authorization Token")
) -> List:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        language = user["data"].get("language", "en")
        response = await Messages.get_messages(chat_id, user["user_id"], page)
        if not isinstance(response, list):
            raise HTTPException(status_code=400, detail=errors["without_perms"][language])
        return response
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/chat", response_model=SuccessResponse, tags=["Chat"])
async def chat_message(
    data: MessageData,
    chat_id: Optional[int] = Query(None, description="User id in telegram"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        data = json.loads(json.dumps(data.model_dump()))
        language = user["data"].get("language", "en")
        text = data.get("text", None)
        if not text:
            raise HTTPException(status_code=400, detail=errors["empty_message"][language])
        if not isinstance(chat_id, int):
            chat_id = user["user_id"]
        response = await Messages.send_message(chat_id, user["user_id"], text, None)
        if response is False:
            raise HTTPException(status_code=400, detail=errors["waiting_countdown"][language])
        return {"result": True}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.put("/api/chat", response_model=SuccessResponse, tags=["Chat"])
async def chat_photo_message(
    chat_id: Optional[int] = Query(None, description="User id in telegram"),
    file: UploadFile = File(description="Photo as a message", max_size=1024*1024*5),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        language = user["data"].get("language", "en")
        if not file:
            raise HTTPException(status_code=400, detail=errors["empty_message"][language])
        if not isinstance(chat_id, int):
            chat_id = user["user_id"]
        try:
            content = await file.read()
            file_content = BytesIO(content)
            kind = filetype.guess(file_content)
            if (kind is None) or (kind.mime not in ["image/jpeg", "image/png", "image/webp", "image/heif"]):
                raise Exception(errors["unknown_format"][language])
            extension = kind.mime.rsplit("/", 1)[-1].lower()
            filename = f"static/{str(uuid.uuid4())}.{extension}"
            file_url = f"https://webapp.slim-n-rich.com/api/{filename}"
            response = await Messages.send_message(chat_id, user["user_id"], None, file_url)
            if response is True:
                async with aiofiles.open(filename, "wb") as f:
                    await f.write(file_content.getvalue())
            else:
                await QueueDeletion.add_file(filename)
                raise Exception(errors["waiting_countdown"][language])
        except Exception as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        return {"result": True}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/battles/get-plan", response_model=Dict, tags=["Battles"])
async def battles_get_plan(
    start_weight: Union[int, float] = Query(ge=4.8, le=635, description="User start weight"),
    final_weight: Optional[str] = Query(None, description="User final weight (4.8-635)"),
    period: int = Query(ge=1, le=10, description="Duration of the battle being created"),
    battle_type: Literal["bymyself", "onevsfriend", "onevsone", "groupfortime", "withyourgroup", "groupbyweight"] = Query(..., description="Selected battle type"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        battle_info = await Users.user_battles_info(user, True, True, battle_type, True)
        battle_info = {} if not isinstance(battle_info, dict) else battle_info
        battle_info = battle_info.get(battle_type, {})
        response = {
            "graph": [],
            "amount": battle_info.get("amount", 0),
            "goal": battle_info.get("goal", 0),
            "period": battle_info.get("period", 0),
            "numbers": user["data"].get("numbers", "kg/cm")
        }
        start_weight = temp_weight = round(start_weight, 1)
        try:
            final_weight = float(final_weight)
        except (ValueError, TypeError):
            max_lost_kg = []
            for _ in range(11):
                max_lost_kg.append(round(temp_weight, 1))
                temp_weight *= 0.99
            response["graph"] = max_lost_kg[:period+1]
            return response
        final_weight = round(final_weight, 1)
        if (final_weight >= start_weight) or (final_weight < 4.8):
            response["graph"] = [start_weight]
            return response
        if period <= 1:
            step = start_weight - final_weight
        else:
            step = (start_weight - final_weight) / period
        response["graph"] = [
            round(x, 1) if x >= final_weight else final_weight
            for x in [start_weight - step * i for i in range(period + 1)]
        ]
        return response
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/battles/bymyself", response_model=BattlesByMyselfData, tags=["Battles"])
async def battles_myself_info(
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        return await ByMyself.get_info(user)
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/battles/bymyself", response_model=BattlesByMyselfData, tags=["Battles"])
async def battles_myself_creation(
    amount: AVAILABLE_AMOUNTS = Query(..., description="Bet size"),
    period: Literal["4", "5", "6", "7", "8", "9", "10"] = Query(..., description="Duration of the battle being created"),
    goal: Union[int, float] = Query(ge=4.8, le=635, description="User weight (kg)"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        amount, period = int(amount), int(period)
        language = user["data"].get("language", "en")
        goal = round(goal, 1)
        user_data = user["data"]
        current_timestamp = int(datetime.now().timestamp())
        if user_data.get("balance", 0) < amount:
            raise HTTPException(status_code=400, detail=errors["small_balance"][language])
        current_weight = temp_weight = user["data"]["weight"]
        if current_weight <= 0:
            raise HTTPException(status_code=400, detail=errors["zero_weight"][language])
        if user["auth_date"] + (86400 * 14) < current_timestamp:
            latest_result = await Files.get_latest(user["user_id"])
            if latest_result is not True:
                raise HTTPException(status_code=400, detail=errors["update_weight"][language])
        max_lost_kg = []
        for _ in range(11):
            max_lost_kg.append(round(temp_weight, 1))
            temp_weight *= 0.99
        max_lost_kg = max_lost_kg[1:]
        current_weight = round(current_weight, 1)
        if goal >= current_weight:
            user_numbers = user["data"].get("numbers", "kg/cm")
            if str(user_numbers) == "lb/in":
                current_weight = f"{round((current_weight * 2.20462 * 10) / 10, 1)} lb"
            else:
                current_weight = f"{current_weight} kg"
            raise HTTPException(status_code=400, detail=errors["big_goal"][language].format(current=current_weight))
        elif goal < max_lost_kg[period - 1]:
            raise HTTPException(status_code=400, detail=errors["big_weight_change"][language])
        response = await ByMyself.create_battle(user, amount, period, goal)
        if response is None:
            raise HTTPException(status_code=400, detail=errors["small_balance"][language])
        elif response is False:
            raise HTTPException(status_code=400, detail=errors["has_active_battle"][language])
        elif isinstance(response, dict):
            return response
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/open-other-profile", response_model=ProfileDataResponse, tags=["Battles"])
async def other_profile(
    user_id: int = Query(..., description="ID of the required user in telegram"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        return await Users.get_profile(user["user_id"], user_id)
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/reports", response_model=List[ReportsData], tags=["Reports"])
async def reports_data(
    moderation_mode: bool = Query(False, description="Moderator mode"),
    status: Literal["all", "ended", "consideration"] = Query(..., description="Type of reports"),
    user_session: str = Header(description="Authorization Token")
) -> List[Dict]:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        return await Reports.get_reports(user, moderation_mode, status)
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/reports", response_model=SuccessResponse, tags=["Reports"])
async def report_sending(
    data: ReportSending,
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        language = user["data"].get("language", "en")
        data = json.loads(json.dumps(data.model_dump()))
        result = await Reports.add_report(user["user_id"], data["user_id"], data["text"])
        if result is not True:
            raise HTTPException(status_code=400, detail=errors["twice_report"][language])
        return {"result": True}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.put("/api/reports", response_model=SuccessResponse, tags=["Reports"])
async def report_moderate(
    report_id: int = Query(..., description="Report id"),
    status: bool = Query(..., description="Result of moderation"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        language = user["data"].get("language", "en")
        result = await Reports.moderate_report(user["user_id"], report_id, status)
        if result is not True:
            raise HTTPException(status_code=400, detail=errors["without_perms"][language])
        return {"result": True}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/referrals-revenue", response_model=ReferralsRevenueResponse, tags=["User"])
async def referrals_revenue(
    balance_type: Literal["real", "bonus"] = Query(..., description="Balance type (real used by bloggers)"),
    start_timestamp: int = Query(0, ge=1, le=2000000000, description="Start of period (timestamp in seconds)"),
    end_timestamp: int = Query(0, ge=1, le=2000000000, description="End of period (timestamp in seconds)"),
    page: int = Query(1, ge=1, le=100, description="Required results page number"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        return await ReferralsRevenue.get_referrals_revenue(
            user["user_id"],
            balance_type,
            start_timestamp,
            end_timestamp,
            page
        )
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/balance/top_up", response_model=TopUpResponse, tags=["Balance"])
async def top_up_balance(
    amount: int = Query(..., ge=1, le=5000, description="Replenishment amount in usdt"),
    method: Literal["card", "crypto"] = Query(..., description="Payment method"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        language = user["data"].get("language", "en")
        if (amount < 18) and (method == "card"):
            raise HTTPException(status_code=400, detail=errors["small_amount_for_cards"][language])
        response = await crypto_invoice(user["user_id"], amount, method)
        if response is False:
            raise HTTPException(status_code=400, detail=errors["just_chill"][language])
        elif response is None:
            raise HTTPException(status_code=400, detail=errors["cannot_create_invoice"][language])
        elif isinstance(response, str):
            return {"method": method, "result": response}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/balance/validate", response_model=Dict, tags=["Balance"], include_in_schema=False)
async def validate_transaction(
    request: Request
) -> Dict:
    try:
        data_bytes = await request.body()
        data_str = data_bytes.decode("utf-8")
        parsed_data = parse_qs(data_str)
        json_data = {}
        for key, value in parsed_data.items():
            json_data[key] = value[0] if len(value) == 1 else value
        payload = jwt.decode(json_data["token"], C_PASS, algorithms=["HS256"])
        if payload["exp"] < time.time():
            return {"result": False}
        await check_invoice(json_data["invoice_id"])
        return {"result": True}
    except jwt.ExpiredSignatureError:
        return {"result": False}
    except jwt.InvalidTokenError:
        return {"result": False}
    except Exception as _:
        return {"result": False}


@app.post("/api/balance/withdraw", response_model=SuccessResponse, tags=["Balance"])
async def withdraw_balance(
    amount: int = Query(..., ge=1100, le=100000, description="Withdrawal amount in slims"),
    method: Literal["card", "crypto"] = Query(..., description="Payment method"),
    wallet: str = Query(None, description="Wallet details for withdrawal"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        amount = amount // 100 * 100
        user_data = user["data"]
        language = user_data.get("language", "en")
        if wallet is None:
            raise HTTPException(status_code=400, detail=errors["enter_wallet"][language])
        elif (amount < 35) and (method == "card"):
            raise HTTPException(status_code=400, detail=errors["small_withdrawal_for_cards"][language])
        else:
            bsc_pattern = r"^0x[a-fA-F0-9]{40}$"
            if (not wallet.startswith("0x")) or (len(wallet) != 42) or (not re.fullmatch(bsc_pattern, wallet)):
                raise HTTPException(status_code=400, detail=errors["unsupported_wallet"][language])
        if user_data.get("balance", 0) >= amount:
            balance_changed = await Users.change_balance(user["user_id"], amount * -1, "real", "withdraw")
            if balance_changed is True:
                withdraw_id = await Withdrawals.add_withdrawal(user["user_id"], method, amount, wallet)
                user_text = messages["withdrawal_request"][language].format(
                    wallet=str(wallet),
                    system=method.title(),
                    slims_count=str(amount - 100)
                )
                month_top_ups, all_top_ups, withdrawn = await BalanceHistory.get_user_info(user["user_id"])
                text = messages["withdrawal_notification"]["en"].format(
                    user_id=str(user["user_id"]),
                    payment_id=str(withdraw_id),
                    wallet=str(wallet),
                    system=method.title(),
                    usdt_amount=str(amount // 100 - 1),
                    slims_count=str(amount),
                    month_top_ups=str(month_top_ups),
                    all_top_ups=str(all_top_ups),
                    withdrawn=str(withdrawn)
                )
                kb_line = []
                for button_text, button_data in {"✅": "accept", "🚫": "decline"}.items():
                    kb_line.append({"text": button_text, "callback_data": f"withdraw:{button_data}:{withdraw_id}"})
                keyboard = json.dumps({"inline_keyboard": [kb_line]})
                await send_message(PAYMENTS_CHAT, text, keyboard)
                await send_message(user["user_id"], user_text)
                return {"result": True}
        raise HTTPException(status_code=400, detail=errors["small_balance"][language])
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/battles/vsfriend", response_model=BattlesData, tags=["Battles"])
async def battles_vsfriend_info(
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        return await OneVsFriend.get_info(user)
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/battles/vsfriend", response_model=BattlesData, tags=["Battles"])
async def battles_vsfriend_creation(
    amount: FREE_AVAILABLE_AMOUNTS = Query(..., description="Bet size"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        amount = int(amount)
        user_data = user["data"]
        language = user_data.get("language", "en")
        current_weight = user_data["weight"]
        if current_weight <= 0:
            raise HTTPException(status_code=400, detail=errors["zero_weight"][language])
        if user_data.get("balance", 0) < amount:
            raise HTTPException(status_code=400, detail=errors["small_balance"][language])
        current_timestamp = int(datetime.now().timestamp())
        if user["auth_date"] + (86400 * 14) < current_timestamp:
            latest_result = await Files.get_latest(user["user_id"])
            if latest_result is not True:
                raise HTTPException(status_code=400, detail=errors["update_weight"][language])
        response = await OneVsFriend.create_battle(user, amount)
        if response is None:
            raise HTTPException(status_code=400, detail=errors["small_balance"][language])
        elif response is False:
            raise HTTPException(status_code=400, detail=errors["has_active_battle"][language])
        elif isinstance(response, dict):
            return response
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.delete("/api/battles/vsfriend", response_model=SuccessResponse, tags=["Battles"])
async def battles_vsfriend_delete(
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        await OneVsFriend.delete_battle(user)
        return {"result": True}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/battles/vsfriend/join", response_model=BattlesData, tags=["Battles"])
async def battles_vsfriend_pre_join(
    code: str = Query(..., min_length=12, max_length=16, description="Invitation code"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        user_data = user["data"]
        language = user_data.get("language", "en")
        response = await OneVsFriend.pre_join_battle(user, code)
        if response is None:
            raise HTTPException(status_code=400, detail=errors["battle_not_found"][language])
        elif response is False:
            raise HTTPException(status_code=400, detail=errors["has_active_battle"][language])
        elif isinstance(response, dict):
            return response
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/battles/vsfriend/join", response_model=BattlesData, tags=["Battles"])
async def battles_vsfriend_join(
    code: str = Query(..., min_length=12, max_length=16, description="Invitation code"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        user_data = user["data"]
        language = user_data.get("language", "en")
        current_timestamp = int(datetime.now().timestamp())
        current_weight = user_data["weight"]
        if current_weight <= 0:
            raise HTTPException(status_code=400, detail=errors["zero_weight"][language])
        if user["auth_date"] + (86400 * 14) < current_timestamp:
            latest_result = await Files.get_latest(user["user_id"])
            if latest_result is not True:
                raise HTTPException(status_code=400, detail=errors["update_weight"][language])
        response = await OneVsFriend.join_battle(user, code)
        if response is None:
            raise HTTPException(status_code=400, detail=errors["small_balance"][language])
        elif response is False:
            raise HTTPException(status_code=400, detail=errors["has_active_battle"][language])
        elif response is True:
            raise HTTPException(status_code=400, detail=errors["battle_join"][language])
        elif isinstance(response, dict):
            return response
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/admin/metrics", response_model=Dict, tags=["Admin"])
async def admin_metrics(
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        user_data = user["data"]
        language = user_data.get("language", "en")
        if user["user_id"] not in ADMIN_IDS:
            raise HTTPException(status_code=400, detail=errors["without_perms"][language])
        return await Users.about_datas(language)
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/admin/moderators", response_model=List[ModeratorData], tags=["Admin"])
async def admin_get_moderators(
    user_session: str = Header(description="Authorization Token")
) -> List[Dict]:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        user_data = user["data"]
        language = user_data.get("language", "en")
        if user["user_id"] not in ADMIN_IDS:
            raise HTTPException(status_code=400, detail=errors["without_perms"][language])
        return await Moderators.get_moderators()
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/admin/moderators", response_model=List[ModeratorData], tags=["Admin"])
async def admin_add_moderators(
    new_moderator: int = Query(..., description="New telegram moderator user id"),
    full_name: str = Query(..., min_length=4, max_length=16, description="Full name of the new moderator"),
    user_session: str = Header(description="Authorization Token")
) -> List[Dict]:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        user_data = user["data"]
        language = user_data.get("language", "en")
        name_list = full_name.split()
        if (len(name_list) > 2) or (any(not x.isalnum() for x in name_list)):
            raise HTTPException(status_code=400, detail=errors["incorrect_name"][language])
        nm_obj = await Users.get_user(new_moderator)
        if not isinstance(nm_obj, dict):
            raise HTTPException(status_code=400, detail=errors["user_not_found"][language])
        if user["user_id"] not in ADMIN_IDS:
            raise HTTPException(status_code=400, detail=errors["without_perms"][language])
        response = await Moderators.add_moderator(new_moderator, full_name, user["user_id"])
        if response is False:
            raise HTTPException(status_code=400, detail=errors["moderator_exists"][language])
        return await Moderators.get_moderators()
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.delete("/api/admin/moderators", response_model=List[ModeratorData], tags=["Admin"])
async def admin_delete_moderators(
    moderator_id: int = Query(..., description="Moderator id"),
    user_session: str = Header(description="Authorization Token")
) -> List[Dict]:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        user_data = user["data"]
        language = user_data.get("language", "en")
        if user["user_id"] not in ADMIN_IDS:
            raise HTTPException(status_code=400, detail=errors["without_perms"][language])
        response = await Moderators.delete_moderator(moderator_id)
        if response is False:
            raise HTTPException(status_code=400, detail=errors["moderator_not_found"][language])
        return await Moderators.get_moderators()
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/moderator/ban", response_model=SuccessResponse, tags=["Moderator"])
async def admin_ban(
    violator_id: int = Query(..., description="User id in telegram who needs to be banned"),
    period: int = Query(..., ge=1, le=365, description="Ban duration in days"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        user_data = user["data"]
        language = user_data.get("language", "en")
        if user["user_id"] not in ADMIN_IDS:
            moderator = await Moderators.get_moderator(user["user_id"])
            if not isinstance(moderator, dict):
                raise HTTPException(status_code=400, detail=errors["without_perms"][language])
        violator = await Users.get_user(violator_id)
        if isinstance(violator, dict):
            current_timestamp = int(datetime.now().timestamp())
            ban_until = current_timestamp + (86400 * period)
            bans_count = violator["data"].get("bans_count", 0)
            if violator["data"].get("banned", 0) < current_timestamp:
                bans_count += 1
            update_data = {
                "banned": ban_until,
                "bans_count": bans_count,
                "last_ban_by": user["user_id"]
            }
            await Users.update_data(violator_id, update_data)
        return {"result": True}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.delete("/api/moderator/ban", response_model=SuccessResponse, tags=["Moderator"])
async def admin_unban(
    user_id: int = Query(..., description="User id in telegram who needs to be unbanned"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        user_data = user["data"]
        language = user_data.get("language", "en")
        if user["user_id"] not in ADMIN_IDS:
            moderator = await Moderators.get_moderator(user["user_id"])
            if not isinstance(moderator, dict):
                raise HTTPException(status_code=400, detail=errors["without_perms"][language])
        current_timestamp = int(datetime.now().timestamp())
        await Users.update_data(user_id, {"banned": current_timestamp})
        return {"result": True}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/battles/withyourgroup", response_model=Dict, tags=["Battles"])
async def battles_withyourgroup_info(
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        return await WithYourGroup.get_info(user)
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/battles/withyourgroup", response_model=BattlesData, tags=["Battles"])
async def battles_withyourgroup_creation(
    amount: AVAILABLE_AMOUNTS = Query(..., description="Bet size"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        amount = int(amount)
        user_data = user["data"]
        language = user_data.get("language", "en")
        current_timestamp = int(datetime.now().timestamp())
        if user_data.get("premium", 0) < current_timestamp:
            raise HTTPException(status_code=400, detail=errors["premium_required"][language])
        current_weight = user_data["weight"]
        if current_weight <= 0:
            raise HTTPException(status_code=400, detail=errors["zero_weight"][language])
        if user_data.get("balance", 0) < amount:
            raise HTTPException(status_code=400, detail=errors["small_balance"][language])
        current_timestamp = int(datetime.now().timestamp())
        if user["auth_date"] + (86400 * 14) < current_timestamp:
            latest_result = await Files.get_latest(user["user_id"])
            if latest_result is not True:
                raise HTTPException(status_code=400, detail=errors["update_weight"][language])
        response = await WithYourGroup.create_battle(user, amount)
        if response is None:
            raise HTTPException(status_code=400, detail=errors["small_balance"][language])
        elif response is False:
            raise HTTPException(status_code=400, detail=errors["has_active_battle"][language])
        elif isinstance(response, dict):
            return response
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.delete("/api/battles/withyourgroup/control", response_model=SuccessResponse, tags=["Battles"])
async def battles_withyourgroup_delete(
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        await WithYourGroup.delete_battle(user)
        return {"result": True}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.put("/api/battles/withyourgroup/control", response_model=SuccessResponse, tags=["Battles"])
async def battles_withyourgroup_start(
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        language = user["data"].get("language", "en")
        response = await WithYourGroup.start_battle(user)
        if response is None:
            raise HTTPException(status_code=400, detail=errors["not_enough_players"][language])
        elif response is False:
            raise HTTPException(status_code=400, detail=errors["not_owner"][language])
        return {"result": True}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/battles/withyourgroup/join", response_model=Dict, tags=["Battles"])
async def battles_withyourgroup_pre_join(
    code: str = Query(..., min_length=12, max_length=16, description="Invitation code"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        user_data = user["data"]
        language = user_data.get("language", "en")
        current_timestamp = int(datetime.now().timestamp())
        if user_data.get("premium", 0) < current_timestamp:
            raise HTTPException(status_code=400, detail=errors["premium_required"][language])
        response = await WithYourGroup.pre_join_battle(user, code)
        if response is None:
            raise HTTPException(status_code=400, detail=errors["battle_not_found"][language])
        elif response is False:
            raise HTTPException(status_code=400, detail=errors["has_active_battle"][language])
        elif isinstance(response, dict):
            return response
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/battles/withyourgroup/join", response_model=BattlesData, tags=["Battles"])
async def battles_withyourgroup_join(
    code: str = Query(..., min_length=12, max_length=16, description="Invitation code"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        user_data = user["data"]
        language = user_data.get("language", "en")
        current_timestamp = int(datetime.now().timestamp())
        if user_data.get("premium", 0) < current_timestamp:
            raise HTTPException(status_code=400, detail=errors["premium_required"][language])
        current_weight = user_data["weight"]
        if current_weight <= 0:
            raise HTTPException(status_code=400, detail=errors["zero_weight"][language])
        if user["auth_date"] + (86400 * 14) < current_timestamp:
            latest_result = await Files.get_latest(user["user_id"])
            if latest_result is not True:
                raise HTTPException(status_code=400, detail=errors["update_weight"][language])
        response = await WithYourGroup.join_battle(user, code)
        if response is None:
            raise HTTPException(status_code=400, detail=errors["small_balance"][language])
        elif response is False:
            raise HTTPException(status_code=400, detail=errors["has_active_battle"][language])
        elif response is True:
            raise HTTPException(status_code=400, detail=errors["battle_join"][language])
        elif isinstance(response, dict):
            return response
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/admin/basic-info", response_model=AdminInfoResponse, tags=["Admin"])
async def admin_basic_info(
    start_timestamp: int = Query(0, ge=1600000000, le=2000000000, description="Start of period (timestamp in seconds)"),
    end_timestamp: int = Query(0, ge=1600000000, le=2000000000, description="End of period (timestamp in seconds)"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        user_data = user["data"]
        language = user_data.get("language", "en")
        if user["user_id"] not in ADMIN_IDS:
            raise HTTPException(status_code=400, detail=errors["without_perms"][language])
        return await Users.admin_info(start_timestamp, end_timestamp)
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/battles/vsrandom", response_model=BattlesData, tags=["Battles"])
async def battles_vsrandom_info(
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        return await OneVsOne.get_info(user)
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/battles/vsrandom", response_model=BattlesData, tags=["Battles"])
async def battles_vsrandom_creation(
    amount: AVAILABLE_AMOUNTS = Query(..., description="Bet size"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        amount = int(amount)
        user_data = user["data"]
        language = user_data.get("language", "en")
        current_timestamp = int(datetime.now().timestamp())
        if user_data.get("premium", 0) < current_timestamp:
            raise HTTPException(status_code=400, detail=errors["premium_required"][language])
        current_weight = user_data["weight"]
        if current_weight <= 0:
            raise HTTPException(status_code=400, detail=errors["zero_weight"][language])
        if user_data.get("balance", 0) < amount:
            raise HTTPException(status_code=400, detail=errors["small_balance"][language])
        current_timestamp = int(datetime.now().timestamp())
        if user["auth_date"] + (86400 * 14) < current_timestamp:
            latest_result = await Files.get_latest(user["user_id"])
            if latest_result is not True:
                raise HTTPException(status_code=400, detail=errors["update_weight"][language])
        response = await OneVsOne.create_battle(user, amount)
        if response is None:
            raise HTTPException(status_code=400, detail=errors["small_balance"][language])
        elif response is False:
            raise HTTPException(status_code=400, detail=errors["has_active_battle"][language])
        elif isinstance(response, dict):
            return response
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/battles/groupfortime", response_model=BattlesData, tags=["Battles"])
async def battles_groupfortime_info(
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        return await GroupForTime.get_info(user)
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/battles/groupfortime", response_model=BattlesData, tags=["Battles"])
async def battles_groupfortime_creation(
    amount: AVAILABLE_AMOUNTS = Query(..., description="Bet size"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        amount = int(amount)
        user_data = user["data"]
        language = user_data.get("language", "en")
        current_timestamp = int(datetime.now().timestamp())
        if user_data.get("premium", 0) < current_timestamp:
            raise HTTPException(status_code=400, detail=errors["premium_required"][language])
        current_weight = user_data["weight"]
        if current_weight <= 0:
            raise HTTPException(status_code=400, detail=errors["zero_weight"][language])
        if user_data.get("balance", 0) < amount:
            raise HTTPException(status_code=400, detail=errors["small_balance"][language])
        current_timestamp = int(datetime.now().timestamp())
        if user["auth_date"] + (86400 * 14) < current_timestamp:
            latest_result = await Files.get_latest(user["user_id"])
            if latest_result is not True:
                raise HTTPException(status_code=400, detail=errors["update_weight"][language])
        response = await GroupForTime.create_battle(user, amount)
        if response is None:
            raise HTTPException(status_code=400, detail=errors["small_balance"][language])
        elif response is False:
            raise HTTPException(status_code=400, detail=errors["has_active_battle"][language])
        elif isinstance(response, dict):
            return response
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/battles/groupbyweight", response_model=BattlesData, tags=["Battles"])
async def battles_groupbyweight_info(
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        return await GroupByWeight.get_info(user)
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/battles/groupbyweight", response_model=BattlesData, tags=["Battles"])
async def battles_groupbyweight_creation(
    amount: AVAILABLE_AMOUNTS = Query(..., description="Bet size"),
    goal_size: Literal["0.5", "1", "1.5", "2"] = Query(..., description="Weight loss goal in battle"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        amount = int(amount)
        user_data = user["data"]
        language = user_data.get("language", "en")
        current_timestamp = int(datetime.now().timestamp())
        if user_data.get("premium", 0) < current_timestamp:
            raise HTTPException(status_code=400, detail=errors["premium_required"][language])
        current_weight = user_data["weight"]
        if current_weight <= 0:
            raise HTTPException(status_code=400, detail=errors["zero_weight"][language])
        if user_data.get("balance", 0) < amount:
            raise HTTPException(status_code=400, detail=errors["small_balance"][language])
        current_timestamp = int(datetime.now().timestamp())
        if user["auth_date"] + (86400 * 14) < current_timestamp:
            latest_result = await Files.get_latest(user["user_id"])
            if latest_result is not True:
                raise HTTPException(status_code=400, detail=errors["update_weight"][language])
        response = await GroupByWeight.create_battle(user, amount, float(goal_size))
        if response is None:
            raise HTTPException(status_code=400, detail=errors["small_balance"][language])
        elif response is False:
            raise HTTPException(status_code=400, detail=errors["has_active_battle"][language])
        elif isinstance(response, dict):
            return response
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/admin/wallets", response_model=List[AdminWalletData], tags=["Admin"])
async def admin_wallets_info(
    user_session: str = Header(description="Authorization Token")
) -> List[Dict]:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        user_data = user["data"]
        language = user_data.get("language", "en")
        if user["user_id"] not in ADMIN_IDS:
            raise HTTPException(status_code=400, detail=errors["without_perms"][language])
        return await PaymentMethods.get_balances()
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.put("/api/admin/wallets", response_model=SuccessResponse, tags=["Admin"])
async def admin_wallets_withdraw(
    method: str = Query(..., description="Wallet type"),
    amount: int = Query(..., ge=1, description="Withdrawal amount"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    if method not in ["card", "stars", "crypto", "cats", "dogs", "children", "developers"]:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        user_data = user["data"]
        language = user_data.get("language", "en")
        if user["user_id"] not in ADMIN_IDS:
            raise HTTPException(status_code=400, detail=errors["without_perms"][language])
        response = await PaymentMethods.working_with_balance(method, amount * -1)
        if response is not True:
            raise HTTPException(status_code=400, detail=errors["small_balance"][language])
        return {"result": True}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/moderator/chats", response_model=List[ModeratorChatData], tags=["Chat"])
async def moderator_chats_list(
    sort_type: Literal["all", "waiting", "answered"] = Query(..., description="Action type"),
    user_session: str = Header(description="Authorization Token")
) -> List[Dict]:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        user_data = user["data"]
        language = user_data.get("language", "en")
        if user["user_id"] not in ADMIN_IDS:
            moderator = await Moderators.get_moderator(user["user_id"])
            if not isinstance(moderator, dict):
                raise HTTPException(status_code=400, detail=errors["without_perms"][language])
        return await Messages.get_chats(sort_type)
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/moderator/get-user", response_model=ModeratorUserDataResponse, tags=["Moderator"])
async def moderator_get_user(
    user_id: int = Query(..., description="User id in telegram"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        user_data = user["data"]
        language = user_data.get("language", "en")
        if user["user_id"] not in ADMIN_IDS:
            moderator = await Moderators.get_moderator(user["user_id"])
            if not isinstance(moderator, dict):
                raise HTTPException(status_code=400, detail=errors["without_perms"][language])
        return await Users.get_private_profile(user["user_id"], user_id, language)
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/admin/bloggers", response_model=List[BloggerData], tags=["Admin"])
async def admin_get_bloggers(
    user_session: str = Header(description="Authorization Token")
) -> List[Dict]:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        user_data = user["data"]
        language = user_data.get("language", "en")
        if user["user_id"] not in ADMIN_IDS:
            raise HTTPException(status_code=400, detail=errors["without_perms"][language])
        return await Bloggers.get_bloggers()
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.post("/api/admin/bloggers", response_model=SuccessResponse, tags=["Admin"])
async def admin_add_bloggers(
    user_id: int = Query(..., description="Blogger user id in telegram"),
    promo_code: str = Query(..., min_length=4, max_length=16, description="Blogger promo code"),
    revenue_percent: int = Query(..., ge=1, le=50, description="Blogger revenue percent"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        user_data = user["data"]
        language = user_data.get("language", "en")
        if user["user_id"] not in ADMIN_IDS:
            raise HTTPException(status_code=400, detail=errors["without_perms"][language])
        elif (revenue_percent <= 0) or (revenue_percent >= 50):
            raise HTTPException(status_code=400, detail=errors["bad_revenue_percent"]["en"])
        elif not str(promo_code).isalnum():
            raise HTTPException(status_code=400, detail=errors["only_alnum"]["en"])
        response = await Bloggers.add_blogger(user["user_id"], user_id, promo_code, revenue_percent)
        if response is False:
            raise HTTPException(status_code=400, detail=errors["blogger_exists"]["en"])
        elif response is None:
            raise HTTPException(status_code=400, detail=errors["user_not_found"]["en"])
        return {"result": True}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.delete("/api/admin/bloggers", response_model=SuccessResponse, tags=["Admin"])
async def admin_delete_bloggers(
    user_id: int = Query(..., description="Blogger user id in telegram"),
    user_session: str = Header(description="Authorization Token")
) -> Dict:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        user_data = user["data"]
        language = user_data.get("language", "en")
        if user["user_id"] not in ADMIN_IDS:
            raise HTTPException(status_code=400, detail=errors["without_perms"][language])
        await Bloggers.delete_blogger(user_id)
        return {"result": True}
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])


@app.get("/api/admin/battles", response_model=List[AdminBattlesData], tags=["Admin"])
async def admin_get_battles(
    battle_id: Optional[int] = Query(None, description="Battle id"),
    battle_type: Optional[Literal[
        "bymyself", "onevsfriend", "onevsone", "groupfortime", "withyourgroup", "groupbyweight"
    ]] = Query(None, description="Battle type"),
    user_session: str = Header(description="Authorization Token")
) -> List[Dict]:
    user = await check_session(user_session)
    if isinstance(user, dict):
        await check_for_ban(user)
        user_data = user["data"]
        language = user_data.get("language", "en")
        if user["user_id"] not in ADMIN_IDS:
            moderator = await Moderators.get_moderator(user["user_id"])
            if not isinstance(moderator, dict):
                raise HTTPException(status_code=400, detail=errors["without_perms"][language])
        return await Users.get_admin_battles(battle_id, battle_type)
    else:
        raise HTTPException(status_code=400, detail=errors["validation_error"]["en"])
