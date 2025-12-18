import sys
from enum import IntEnum, Enum
from json import JSONEncoder
from typing import Literal, Optional, Union, Dict, List

from fastapi import HTTPException
from pydantic import BaseModel, Field, constr

sys.path.append("..")
from script.localization import questions


class ReportsData(BaseModel):
    id: int = Field(..., description="Report ID")
    sender: int = Field(..., description="Telegram user id who sent the report")
    receiver: Union[int, None] = Field(None, description="Telegram user id who received the report")
    status: Literal["consideration", "approved", "declined"] = Field(..., description="Report status")
    text: str = Field("", description="Report text available only for moderators")
    date: str = Field(..., description="Report date in YYYY/MM/DD format UTC")


class ReportSending(BaseModel):
    user_id: int = Field(..., description="Telegram user id to whom the complaint is sent")
    text: constr(min_length=1, max_length=256) = Field(..., description="Text of the report")


class NutritionOptions(Enum):
    protein = "protein"
    bca = "bca"
    vitamins = "vitamins"
    burners = "burners"
    nothing = "nothing"
    another = "another"


class MotivationOptions(Enum):
    books = "books"
    music = "music"
    podcasts = "podcasts"
    bloggers = "bloggers"
    films = "films"
    nothing = "nothing"
    other = "other"


class InterestsOptions(Enum):
    sports = "sports"
    music = "music"
    networks = "networks"
    books = "books"
    cinema = "cinema"
    art = "art"
    growth = "growth"
    pc = "pc"
    board = "board"
    history = "history"
    another = "another"


class TimezoneOptions(Enum):
    minus_12 = -12
    minus_11 = -11
    minus_10 = -10
    minus_9 = -9
    minus_8 = -8
    minus_7 = -7
    minus_6 = -6
    minus_5 = -5
    minus_4 = -4
    minus_3 = -3
    minus_2 = -2
    minus_1 = -1
    utc = 0
    plus_1 = 1
    plus_2 = 2
    plus_3 = 3
    plus_4 = 4
    plus_5 = 5
    plus_5_5 = 5.5
    plus_6 = 6
    plus_7 = 7
    plus_8 = 8
    plus_9 = 9
    plus_10 = 10
    plus_11 = 11
    plus_12 = 12


class Settings(BaseModel):
    numbers: Optional[Literal["lb/in", "kg/cm"]] = Field(None, description="User calculation system")
    timezone: Optional[TimezoneOptions] = Field(None, description="User timezone")
    language: Optional[Literal["en", "es"]] = Field(None, description="User language")
    notifications: Optional[bool] = Field(None, description="Should notifications be sent to the user?")
    charity: Optional[Literal["cats", "dogs", "children", "developers"]] \
        = Field(None, description="Where does the user donate?")


class Registration(BaseModel):
    gender: Literal["male", "female", "other"] = Field(description="User gender")
    age: Literal["18", "20", "30", "40", "50", "60"] = Field(description="User age")
    numbers: Literal["lb/in", "kg/cm"] = Field(description="User calculation system")
    timezone: TimezoneOptions = Field(description="User timezone")
    weight: Union[int, float, str] = Field(description="User weight (kg)")
    height: Union[int] = Field(ge=55, le=280, description="User height (cm)")
    physical: Literal["low", "medium", "high", "another"] = Field(description="User's physical activity")
    physical_description: constr(max_length=128) \
        = Field(default="", description="Other physical activity of the user (required if physical contains 'another')")
    sport: Literal["3+", "1-2", "irregularly", "another"] = Field(description="User's sports activity")
    sport_description: constr(max_length=128) \
        = Field(default="", description="Other sports activity of the user (required if sport contains 'another')")
    nutrition: List[NutritionOptions] = Field(min_items=1, max_items=6, description="User's nutrition")
    nutrition_description: constr(max_length=128) \
        = Field(default="", description="Other nutritional information (required if nutrition contains 'another')")
    body_type: Literal["narrow-wide", "broad-narrow", "same", "pumped", "thin", "other", "skip"] \
        = Field(description="User body")
    allergies: Literal["medicines", "fruits", "fish", "nuts", "nothing", "other", "skip"] \
        = Field(description="User allergies")
    chronic_diseases: Literal["lung", "heart", "urogenital", "endocrine", "digestive", "nothing", "other", "skip"] \
        = Field(description="User diseases")
    bad_habits: Literal["drugs", "smoking", "alcohol", "nothing", "other", "skip"] \
        = Field(description="Bad user habits")
    motivation: List[MotivationOptions] = Field(min_items=1, max_items=7, description="User motivations")
    interests: List[InterestsOptions] = Field(min_items=1, max_items=11, description="User interests")
    interests_description: constr(max_length=128) \
        = Field(default="", description="Other interests information (required if interests contains 'another')")
    family: Literal["married", "divorced", "available", "relationship", "other"] \
        = Field(description="User's marital status")


class RegisterEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Enum):
            return obj.value
        elif isinstance(obj, list) and obj and isinstance(obj[0], Enum):
            return [o.value for o in obj]
        return super().default(obj)


async def registration_validator(data: dict) -> Dict:
    for key in ["physical", "sport", "nutrition", "interests"]:
        key_desc = f"{key}_description"
        val_length = len(str(data[key_desc]))
        if "another" in data[key]:
            if val_length <= 0:
                raise HTTPException(400, f"{key_desc} must be at least 1 character long.")
        elif val_length > 0:
            data[f"{key}_description"] = ""
    return data


class GiftRating(BaseModel):
    user_id: int = Field(..., description="ID of the requested user in telegram")
    name: str = Field(..., description="User name", example=f"User123456")
    avatar: str = Field(..., description="User avatar", example="https://slimnrich.com/avatar1")
    amount: int = Field(..., description="Amount of received bonuses from user")


class MetaDataEdition(BaseModel):
    file_id: int = Field(..., description="File id")
    title: Optional[str] \
        = Field(..., min_length=1, max_length=150, description="Photo title. Available only for life file_type")
    about: Optional[str] \
        = Field(..., min_length=0, max_length=300, description="Photo description")


class SelfText(BaseModel):
    text: Optional[str] \
        = Field("", min_length=0, max_length=1024, description="Post description")


class UploadResultResponse(BaseModel):
    file_type: Literal["weight", "food", "life"] = Field(description="Uploaded photo type")
    change: Optional[Union[int, float]] = Field(0, description="Weight change in kg")
    bonus: int = Field(0, description="Amount of uploading bonus")
    numbers: str = Field(..., description="User calculation system")


class SuccessResponse(BaseModel):
    result: bool = Field(True, description="Result of the request")


class AlertsReading(BaseModel):
    alert_ids: List[int] = Field(..., description="List of alert IDs to read")
    all_condition: bool = Field(..., description="True if you want to read every notification")


class AnotherAlert(BaseModel):
    id: Optional[int] = Field(None, description="Alert id")
    user_id: Optional[int] = Field(None, description="User id in telegram")
    file: Optional[str] = Field(None, description="Link for photo file")
    amount: int = Field(..., description="Received amount")
    avatar: Optional[str] = Field(None, description="Avatar of alert")
    name: str = Field(..., description="Name of user")
    achievements_count: Optional[int] = Field(None, description="Achievements count")
    timestamp: int = Field(..., description="Timestamp in seconds")


class AlertsResponse(BaseModel):
    total_size: Union[str, int] = Field(..., description="Number of all notifications to display in the header")
    like_size: Union[str, int] = Field(..., description="Number of gift notifications to display in section")
    referral_size: Union[str, int] = Field(..., description="Number of referral notifications to display in section")
    battle_size: Union[str, int] = Field(..., description="Number of battle notifications to display in the section")
    like: List[AnotherAlert] = Field(..., description="List with notifications about likes")
    referral: List[AnotherAlert] = Field(..., description="List of referral notifications")
    battle: List[AnotherAlert] = Field(..., description="List of battle notifications")


class AchievementData(BaseModel):
    favicon: str = Field(None, description="Link to achievement image")
    title: str = Field(..., description="Achievement title")
    subtitle: str = Field(None, description="Achievement subtitle")


class BasicDataResponse(BaseModel):
    name: str = Field(..., description="User name", example=f"User123456")
    new_alerts: str = Field(..., description="Count of new alerts for header")
    avatar: str = Field(..., description="User avatar", example="https://slimnrich.com/avatar1")
    user_id: int = Field(..., description="User id in telegram")
    achievements_count: int = Field(0, description="Achievements count")
    action: int = Field(0, description="User action")
    is_banned: bool = Field(False, description="Is the user blocked?")
    banned: Union[int, None] = Field(None, description="Unban time (timestamp in seconds)")
    is_premium: bool = Field(..., description="Is your premium subscription active?")
    premium: int = Field(..., description="Premium subscription end time (timestamp in seconds)")
    balance: int = Field(0, description="User balance")
    bonus_balance: int = Field(0, description="Bonus balance")
    frozen_balance: int = Field(0, description="Frozen balance")
    frozen_bonus_balance: int = Field(0, description="Frozen bonus balance")
    frozen_total_balance: int = Field(0, description="Total frozen balance")
    numbers_system: Literal["lb/in", "kg/cm"] = Field("kg/cm", description="Measurement system")
    language: str = Field("en", description="User language")
    timezone: Union[int, float] = Field(0, description="Time zone")
    notifications: bool = Field(True, description="Are notifications enabled?")
    weight_kg: Union[int, float] = Field(0.0, description="Weight in kg")
    height_cm: int = Field(0, description="Height in cm")
    start_weight_kg: Union[int, float] = Field(0.0, description="Initial weight in kg")
    start_height_cm: int = Field(0, description="Initial height in cm")
    month_weight: Union[int, float] = Field(0.0, description="Weight change per month")
    new_achievements: List[AchievementData] = Field(..., description="List of newly obtained achievements")
    timestamp: int = Field(..., description="Response time (timestamp in seconds)")


class BalancesDataResponse(BaseModel):
    is_premium: bool = Field(..., description="Is your premium subscription active?")
    balance: int = Field(0, description="User balance")
    bonus_balance: int = Field(0, description="Bonus balance")
    frozen_total_balance: int = Field(0, description="Total frozen balance")
    timestamp: int = Field(..., description="Response time (timestamp in seconds)")


class ReferralsDataResponse(BaseModel):
    invite_link: str = Field(..., description="Invitation link to the application")
    promo_code: Optional[str] = Field(None, description="Blogger promo code")
    invited_count: int = Field(0, description="Invited referrals")
    earned_money: int = Field(0, description="Earned money")
    earned_bonuses: int = Field(0, description="Earned bonuses")
    timestamp: int = Field(..., description="Response time (timestamp in seconds)")


class StatsPeriod(BaseModel):
    stats: List[Union[int, float]] = Field(..., description="List with 7 kg-values for the graph", min_items=7, max_items=7)
    change: Union[int, float] = Field(0.0, description="Weight change per month in kg")
    current: Union[int, float] = Field(..., description="Current weight in kg")
    average: Union[int, float] = Field(0.0, description="Average weight change in kg")
    numbers_system: Literal["lb/in", "kg/cm"] = Field("kg/cm", description="Measurement system")


class StatsDataResponse(BaseModel):
    result: Dict[Literal["7", "30", "365", "all"], StatsPeriod]


class AnotherBattleInfo(BaseModel):
    participants: int = Field(0, description="Current participants count")
    status: Literal["won", "lost", "continue", "new", "waiting"] = Field(..., description="Battle status")
    reached: Union[int, float] = Field(..., description="The number of kilograms lost is indicated.")
    goal: Union[int, float] = Field(..., description="Final desired weight in kilograms")
    start_date: str = Field(..., description="The month and day the battle started (timezone is in use)")
    end_date: str = Field(..., description="The month and day the battle ended (timezone is in use)")


class AnotherBattleAdminInfo(BaseModel):
    id: Union[int, None] = Field(..., description="ID of the current battle")
    participants: int = Field(0, description="Current participants count")
    status: Literal["won", "lost", "continue", "new", "waiting"] = Field(..., description="Battle status")
    reached: Union[int, float] = Field(..., description="The number of kilograms lost is indicated.")
    goal: Union[int, float] = Field(..., description="Final desired weight in kilograms")
    start_date: str = Field(..., description="The month and day the battle started (timezone is in use)")
    end_date: str = Field(..., description="The month and day the battle ended (timezone is in use)")


class BattlesInfo(BaseModel):
    bymyself: Union[AnotherBattleInfo, AnotherBattleAdminInfo] = Field(..., description="Information about battle")
    onevsfriend: Union[AnotherBattleInfo, AnotherBattleAdminInfo] = Field(..., description="Information about battle")
    onevsone: Union[AnotherBattleInfo, AnotherBattleAdminInfo] = Field(..., description="Information about battle")
    groupfortime: Union[AnotherBattleInfo, AnotherBattleAdminInfo] = Field(..., description="Information about battle")
    withyourgroup: Union[AnotherBattleInfo, AnotherBattleAdminInfo] = Field(..., description="Information about battle")
    groupbyweight: Union[AnotherBattleInfo, AnotherBattleAdminInfo] = Field(..., description="Information about battle")


class BattlesDataResponse(BaseModel):
    max_kg: List[Union[int, float]] \
        = Field(..., min_items=10, max_items=10, description="Maximum expected weight from 1 to 10 weeks")
    max_lb: List[Union[int, float]] \
        = Field(..., min_items=10, max_items=10, description="Maximum expected weight from 1 to 10 weeks")
    battles_data: BattlesInfo = Field(..., description="Information about battles")
    timestamp: int = Field(..., description="Response time (timestamp in seconds)")


class AnotherResult(BaseModel):
    id: int = Field(..., minimum=0, description="Unique identifier of the result")
    gifts: int = Field(0, minimum=0, description="Number of bonus slims received")
    weight: Union[int, float] = Field(0.0, ge=0.0, le=635, description="Weight in kg in the photo")
    calories: int = Field(0, minimum=0, maximum=10000, description="Number of calories in the photo")
    title: str = Field(..., min_length=3, max_length=150, description="Photo title")
    description: str = Field("", min_length=0, max_length=300, description="Photo description")
    photo: str = Field(..., description="Current photo")
    date: str = Field(..., description="The date the result was uploaded in YYYY/MM/DD format UTC")


class PrePageAchievementData(AchievementData):
    has_achievement: bool = Field(False, description="Indicates whether the user has the achievement")


class PageData(BaseModel):
    has: List[AchievementData] = Field(..., description="List of achievements received")
    available: List[AchievementData] = Field(..., description="List of available achievements")


class AchievementsResponse(BaseModel):
    pre_page: List[PrePageAchievementData] = Field(..., description="List with preview of 5 achievements")
    pages: List[PageData] = Field(..., description="List of dictionaries containing information about achievements")
    total_count: int = Field(..., description="Total count of achievements")
    timestamp: int = Field(..., description="Response time (timestamp in seconds)")


class BalanceChanges(BaseModel):
    balance_type: Literal["real", "bonus"] = Field(..., description="Balance type")
    subtitle: str = Field(..., description="Text content of the transaction")
    amount: int = Field(..., description="Amount of the transaction")


class BalanceHistoryResponse(BaseModel):
    result: BalanceChanges = Field(..., description="Balance history")
    total_pages: int = Field(0, description="Total pages in the balance history")


class ReferralsRevenueData(BaseModel):
    name: str = Field(..., description="User name", example=f"User123456")
    user_id: int = Field(..., description="ID of the referral in telegram")
    amount: int = Field(..., description="Amount of the revenue")
    date: str = Field(..., description="Revenue date in YYYY/MM/DD format UTC")


class ReferralsRevenueResponse(BaseModel):
    result: List[ReferralsRevenueData] = Field(..., description="Referrals revenue history")
    total_pages: int = Field(0, description="Total pages in the referrals revenue history")


class TopUpResponse(BaseModel):
    method: str = Field(..., description="Payment method")
    result: str = Field(..., description="Generated data")


class BattlesByMyselfData(BaseModel):
    amount: int = Field(..., description="Battle bet size")
    progress: List[Union[bool, None]] = Field(..., description="Progress weekly, whether the norm has been met")
    money_progress: List[Union[int, None]] = Field(..., description="Inflow and outflow of slims weekly")
    reached: Union[int, float] = Field(..., description="The number of kilograms lost is indicated.")
    goal: Union[int, float] = Field(..., description="Final desired weight in kilograms")
    status: Literal["won", "lost", "continue", "new"] = Field(..., description="Battle status")
    results: List[int] = Field(..., description="Timestamps in seconds when results were loaded")
    needed_results: int = Field(..., description="Possible number of loaded results")
    alerts: List[Literal["charity", "motivation"]] = Field(..., description="New alerts")
    start_date: str = Field(..., description="The month and day the battle started (timezone is in use)")
    end_date: str = Field(..., description="The month and day the battle ended (timezone is in use)")
    start_timestamp: int = Field(..., description="Timestamp when the battle will be started")
    end_timestamp: int = Field(..., description="Timestamp when the battle will be ended")


class ParticipantData(BaseModel):
    name: str = Field(..., description="Participant name", example=f"User123456")
    avatar: str = Field(..., description="Participant avatar", example="https://slimnrich.com/avatar1")
    user_id: int = Field(..., description="Participant user id in telegram")
    achievements_count: int = Field(0, description="Participant achievements count")
    weight_kg: float = Field(0.0, description="Participant weight in kg")
    its_you: bool = Field(False, description="Is the current member the same user who submitted the request?")


class BattlesData(BaseModel):
    amount: int = Field(..., description="Battle bet size")
    is_owner: bool = Field(False, description="Is the user the creator of the battle?")
    battle_code: str = Field("", max_length=16, description="Invitation code for the battle"),
    participants: List[ParticipantData] = Field(..., description="Information about participants")
    progress: List[Union[bool, None]] = Field(..., description="Progress weekly, whether the norm has been met")
    money_progress: List[Union[int, None]] = Field(..., description="Inflow and outflow of slims weekly")
    reached: Union[int, float] = Field(..., description="The number of kilograms lost is indicated.")
    goal: Union[int, float] = Field(..., description="Final desired weight in kilograms")
    status: Literal["won", "lost", "continue", "new", "waiting"] = Field(..., description="Battle status")
    results: List[int] = Field(..., description="Timestamps in seconds when results were loaded")
    needed_results: int = Field(..., description="Possible number of loaded results")
    alerts: List[Literal["charity", "motivation"]] = Field(..., description="New alerts")
    start_date: str = Field(..., description="The month and day the battle started (timezone is in use)")
    end_date: str = Field(..., description="The month and day the battle ended (timezone is in use)")
    start_timestamp: int = Field(..., description="Timestamp when the battle will be started")
    end_timestamp: int = Field(..., description="Timestamp when the battle will be ended")


class AdminBattlesData(BaseModel):
    id: Union[int, None] = Field(..., description="ID of the current battle")
    amount: int = Field(0, description="Battle bet size")
    title: Literal["bymyself", "onevsfriend", "onevsone", "groupfortime", "withyourgroup", "groupbyweight"] \
        = Field(..., description="Battle type")
    is_owner: bool = Field(False, description="Is the user the creator of the battle?")
    battle_code: str = Field("", max_length=16, description="Invitation code for the battle"),
    participants: List[ParticipantData] = Field(..., description="Information about participants")
    progress: List[None] = Field(..., description="Progress weekly, whether the norm has been met")
    money_progress: List[None] = Field(..., description="Inflow and outflow of slims weekly")
    reached: int = Field(0, description="The number of kilograms lost is indicated.")
    goal: int = Field(0, description="Final desired weight in kilograms")
    status: Literal["won", "lost", "continue", "new", "waiting"] = Field(..., description="Battle status")
    results: List[int] = Field(..., description="Timestamps in seconds when results were loaded")
    needed_results: int = Field(..., description="Possible number of loaded results")
    alerts: List[Literal["charity", "motivation"]] = Field(..., description="New alerts")
    start_date: str = Field(..., description="The month and day the battle started (timezone is in use)")
    end_date: str = Field(..., description="The month and day the battle ended (timezone is in use)")
    start_timestamp: int = Field(..., description="Timestamp when the battle will be started")
    end_timestamp: int = Field(..., description="Timestamp when the battle will be ended")


class ChatHistoryResponse(BaseModel):
    id: int = Field(..., description="Message ID in the system")
    chat_id: int = Field(..., description="Telegram user id, who owns the chat")
    sender: int = Field(..., description="The user id of the telegram user who sent the message")
    name: str = Field(..., description="Sender name")
    avatar: str = Field(..., description="Sender avatar")
    text: Optional[str] = Field(None, description="Message text")
    file: Optional[str] = Field(None, description="Link to the file attached to the message")
    timestamp: int = Field(..., description="Response time (timestamp in seconds)")


class MessageData(BaseModel):
    text: str = Field(None, description="Message text", min_length=3, max_length=512)


class ModeratorChatData(BaseModel):
    chat_id: int = Field(..., description="Telegram user id, who owns the chat")
    status: Literal["waiting", "answered"] = Field(..., description="Last message status")
    date: str = Field(..., description="Revenue date in YYYY/MM/DD format UTC")


class ActionEnum(IntEnum):
    stories_launch = 0
    survey_launch = 1
    profile_launch = 2


class ActionResponse(BaseModel):
    result: ActionEnum = Field(
        description="""
        Current user step.

        * *0*: Launching Stories (First entrance)
        * *1*: Launching the questionnaire (Secondary entrance)
        * *2*: Launching profile (The questionnaire has been completed)
        """
    )


class Answer(BaseModel):
    is_slider: Optional[bool] = None
    answers: Optional[List[dict]] = None
    value: Optional[Union[str, int, float]] = None
    text: Optional[str] = None
    another_button: Optional[bool] = None
    icon: Optional[str] = None


class QuestionsResponse(BaseModel):
    key: str = Field(..., description="Key of the question")
    title: str = Field(..., description="Question Title")
    subtitle: Optional[str] = Field(None, description="Description of the question")
    required: bool = Field(..., description="Mandatory response")
    answers: List[Answer] = Field(..., description="Answer options")
    max_select: int = Field(..., description="Maximum number of selected answers")
    free_input: bool = Field(..., description="Availability of free input")
    lang: str = Field(..., description="Language of the question")


async def get_current(language: str) -> List[Dict]:
    response = []
    for k in questions.keys():
        data = questions[k].get(language, questions[k]["en"])
        if isinstance(data, dict):
            default_schema = {
                "key": k,
                "title": None,
                "subtitle": None,
                "answers": [],
                "required": True,
                "max_select": 1,
                "free_input": False,
                "lang": language
            }
            for s_key, s_value in data.items():
                default_schema[s_key] = s_value
            response.append(default_schema)
    return response


class ProfileResults(BaseModel):
    weight: List[AnotherResult] = Field(..., description="Photos of scales")
    food: List[AnotherResult] = Field(..., description="Food photos")
    life: List[AnotherResult] = Field(..., description="Lifestyle photos")


class ProfileDataResponse(BaseModel):
    its_you: bool = Field(False, description="Is the current member the same user who submitted the request?")
    name: str = Field(..., description="User name", example=f"User123456")
    avatar: str = Field(..., description="User avatar", example="https://slimnrich.com/avatar1")
    user_id: int = Field(..., description="ID of the requested user in telegram")
    results: ProfileResults = Field(..., description="Dictionary of user photos")
    weight_kg: Union[int, float] = Field(0.0, description="Weight in kg")
    weight_lost: Union[int, float] = Field(0.0, description="User weight change over time in kg")
    reg_date: str = Field(..., description="User registration date in YYYY/MM/DD format UTC")
    achievements_count: int = Field(0, description="Achievements count")
    is_premium: bool = Field(..., description="Is premium subscription active?")


class ModeratorUserDataResponse(BaseModel):
    its_you: bool = Field(False, description="Is the current member the same user who submitted the request?")
    name: str = Field(..., description="User name", example=f"User123456")
    avatar: str = Field(..., description="User avatar", example="https://slimnrich.com/avatar1")
    user_id: int = Field(..., description="ID of the requested user in telegram")
    is_banned: bool = Field(..., description="Is user banned now?")
    ban_until: str = Field(..., description="The date until user has ban in YYYY/MM/DD format UTC")
    achievements_count: int = Field(0, description="Achievements count")
    results: ProfileResults = Field(..., description="Dictionary of user photos")
    reports_by_user: int = Field(..., description="Number of reports made by the user")
    reports_for_user: int = Field(..., description="Number of reports about this user")
    approved_reports_for_user: int = Field(..., description="Number of approved reports about this user")
    balance_history: Dict = Field(..., description="User's latest transactions")
    battles_info: List[Dict] = Field(..., description="Basic information about user battles with id")
    approved_terms_date: str = Field(..., description="Date of acceptance by the user of terms, YYYY/MM/DD format UTC")
    approved_terms_ip: str = Field(..., description="IP from which the user accepted the terms")
    reg_date: str = Field(..., description="User registration date in YYYY/MM/DD format UTC")
    premium_date: str = Field(..., description="The date until which the user has premium in YYYY/MM/DD format UTC")
    is_premium: bool = Field(..., description="Is user premium subscription active?")
    weight_kg: Union[int, float] = Field(0.0, description="Weight in kg")
    weight_lost: Union[int, float] = Field(0.0, description="User weight change over time")
    about_data: Dict = Field(..., description="Data from the user questionnaire")


class ModeratorData(BaseModel):
    id: int = Field(..., description="Moderator id")
    user_id: int = Field(..., description="Moderator user id in telegram")
    full_name: str = Field(..., description="Moderator full name")


class AdminBattleRating(BaseModel):
    current_battles: int = Field(..., description="Number of current active battles")
    rating: int = Field(..., description="The rating of this mode in percentage in relation to others")


class AdminBattles(BaseModel):
    bymyself: AdminBattleRating = Field(..., description="Information about battle")
    onevsfriend: AdminBattleRating = Field(..., description="Information about battle")
    onevsone: AdminBattleRating = Field(..., description="Information about battle")
    groupfortime: AdminBattleRating = Field(..., description="Information about battle")
    withyourgroup: AdminBattleRating = Field(..., description="Information about battle")
    groupbyweight: AdminBattleRating = Field(..., description="Information about battle")


class AdminInfoResponse(BaseModel):
    bloggers_earned: int = Field(..., description="Bloggers earned over time (real balance)")
    bloggers_invited: int = Field(..., description="Bloggers invited referrals for all time")
    total_lost: int = Field(..., description="Total lost by users")
    users_real_balance: int = Field(..., description="Current real balance of users")
    users_bonus_balance: int = Field(..., description="Current bonus balance of users")
    period_users: int = Field(..., description="Number of new users for the selected period")
    period_free_users: int = Field(..., description="Number of users without premium for the period")
    period_premium_users: int = Field(..., description="Number of users with premium for the period")
    total_users: int = Field(..., description="Users for all time in the application")
    active_battles: int = Field(..., description="Active battles at the moment")
    total_frozen_money: int = Field(..., description="Current frozen balance of users")
    total_battles: int = Field(..., description="Total battles for all time")
    battles_rating: AdminBattles = Field(..., description="Rating of modes")


class AdminWalletData(BaseModel):
    id: int = Field(..., description="Wallet id in database")
    method: str = Field(..., description="Wallet type")
    balance: int = Field(..., description="Wallet balance")


class BloggerData(BaseModel):
    user_id: int = Field(..., description="Blogger user id in telegram")
    referrals_count: int = Field(..., description="Number of blogger referrals")
    promo_code: str = Field(..., min_length=4, max_length=16, description="Blogger promo code")
    name: str = Field(..., description="User name", example=f"User123456")
    balance: int = Field(0, description="User balance")
    revenue_percent: int = Field(0, description="Blogger revenue percent")


class PhotoMetaData(BaseModel):
    file_type: Literal["weight", "food", "life"] = Field(description="Uploading photo type")
    title: Optional[str] \
        = Field("My photo", min_length=1, max_length=150, description="Photo title. Required for file_type life")
    about: str \
        = Field("", min_length=0, max_length=300, description="Photo description. Required for any uploads, can be ''")
    weight: Optional[Union[int, float]] \
        = Field(None, ge=4.8, le=635, description="New weight in kg. Required for file_type weight")
    food_time: Optional[Literal["breakfast", "lunch", "dinner", "snack"]] \
        = Field("breakfast", description="Meal time type. Required for file_type food")
    calories: Optional[int] \
        = Field(0, ge=0, le=10000, description="Caloric content of food. Optional for file_type food")


async def photo_validation(form_data: dict) -> Dict:
    file_type = form_data["file_type"]
    data = {
        "file_type": file_type,
        "title": " ".join(str(form_data.get("title", "My photo")).split()),
        "about": str(form_data.get("about", ""))
    }
    if file_type == "weight":
        weight = form_data.get("weight")
        if not isinstance(weight, (int, float)):
            raise HTTPException(400, "Weight in kg is required.")
        data["weight"] = round(weight, 1)
    elif file_type == "food":
        food_time = form_data.get("food_time", "breakfast")
        if str(food_time) not in ["breakfast", "lunch", "dinner", "snack"]:
            food_time = "breakfast"
        data["title"] = food_time
        data["calories"] = form_data.get("calories", 0)
    return data
