import hashlib
import hmac
import json
import sys
import uuid
from datetime import datetime, timedelta
from typing import Any
from urllib.parse import parse_qs, unquote_plus

import aiohttp
from fastapi import HTTPException
from loguru import logger

sys.path.append("..")
from script.configuration.module import BOT_TOKEN, C_KEY, C_ID
from script.localization import errors, messages
from script.database.objects import Users, Transactions

logger.add(
    "logs/errors.log",
    rotation="7 day",
    compression="zip",
    level="INFO",
    format="{level} - {time} - {message}",
)


async def check_session(user_session: str, user_id_only: bool = False) -> Any:
    """
    Функция, используется для проверки сессии пользователя.

    Параметры:
    user_session (str): ключ доступа пользователя из телеграм
    user_id_only (bool): Булево-значение, если нужно вернуть только ID

    Возвращает:
    Словарь с информацией о пользователе.
    """
    try:
        data = parse_qs(user_session, keep_blank_values=True)
        data = {k: unquote_plus(v[0]) for k, v in data.items()}
        user_data = json.loads(data["user"])
        data_check_string = "\n".join(f"{k}={data[k]}" for k in sorted(data) if k != "hash")
        secret_key = hmac.new("WebAppData".encode(), msg=BOT_TOKEN.encode(), digestmod=hashlib.sha256).digest()
        signature = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
        if data["hash"] == signature:
            user_id = int(user_data["id"])
            if user_id_only is True:
                return user_id
            user = await Users.get_user(user_id)
            return user
    except Exception as _:
        pass
    raise HTTPException(status_code=401, detail=errors["invalid_session"]["en"])


async def check_for_ban(user: dict, only_ban: bool = False) -> None:
    """
    Функция, проверяет пользователя на блокировку или прохождение опроса.

    Параметры:
    user (dict): Информация о пользователе
    only_ban (bool): Булево-значение, true, если нужна проверка только на бан

    Возвращает:
    Ничего или исключение.
    """
    language = user["data"].get("language", "en")
    current_timestamp = int(datetime.now().timestamp())
    banned_timestamp = user["data"].get("banned", 0)
    if banned_timestamp > current_timestamp:
        timezone = user["data"].get("timezone", 0)
        until_date = datetime.fromtimestamp(banned_timestamp)
        until_date = until_date + timedelta(hours=timezone)
        until_date = until_date.strftime("%B %d")
        raise HTTPException(status_code=400, detail=errors["user_banned"][language].format(until_date=until_date))
    elif (not user.get("about_data")) and (not only_ban):
        raise HTTPException(status_code=400, detail=errors["pass_test"][language])


async def send_message(chat_id: int, text: str, keyboard: Any = None, retries: int = 0) -> Any:
    """
    Функция, используется для отправки сообщения пользователю в телеграм.

    Параметры:
    chat_id (int): ID пользователя в телеграм
    text (str): Отправляемый текст
    keyboard (Any): Данные о прилагаемой клавиатуре
    retries (int): Использованое кол-во попыток отправки сообщения (из трёх)

    Возвращает:
    True, если сообщение успешно отправлено
    """
    try:
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        payload = {"chat_id": chat_id, "text": text}
        if keyboard is not None:
            payload["reply_markup"] = keyboard
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload) as response:
                response.raise_for_status()
                await response.json()
                return True
    except Exception as _:
        if retries < 3:
            return await send_message(chat_id, text, keyboard, retries + 1)


async def prepare_inline_message(
        chat_id: int,
        language: str,
        message: str = None,
        photo_url: str = None,
        parse_mode: Any = "HTML"
) -> Any:
    """
    Функция, используется для подготовки сообщения на отправку для пользователя из мини-приложения.
    Например, для репоста статистики.

    Параметры:
    chat_id (int): ID пользователя в телеграм
    language (str): Язык пользователя
    message (str): Текст примечания
    photo_url (str): Ссылка на прилагаемую фотографию
    parse_mode (str): Тип парсинга сообщения для телеграм

    Возвращает:
    ID подготовленного сообщения, если не возникло проблем при создании.
    """
    try:
        if photo_url is None:
            photo_url = "https://webapp.slim-n-rich.com/api/static/slimnrich.jpg"
        if message is None:
            stats = await Users.user_stats_info(chat_id)
            message = messages["stats_sharing"][language].format(
                user_id=str(chat_id),
                lost_weight=str(stats["result"]["30"]["change"]),
                numbers_system=str(stats["result"]["30"]["numbers_system"].split("/")[0]).upper()
            )
        json_data = {
            "type": "photo",
            "id": str(uuid.uuid4()),
            "photo_url": photo_url,
            "thumb_url": photo_url,
            "caption": message
        }
        if isinstance(parse_mode, str):
            json_data["parse_mode"] = parse_mode
        inline_message = {
            "user_id": chat_id,
            "result": json_data,
            "allow_user_chats": True,
            "allow_group_chats": True
        }
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/savePreparedInlineMessage"
        headers = {"Content-Type": "application/json"}
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=inline_message) as response:
                data = await response.json()
                if data["ok"]:
                    return data["result"]["id"]
    except Exception as _:
        return None


async def crypto_invoice(user_id: int, amount: int, method: str) -> Any:
    """
    Функция, используется для создания инвойса в cryptocloud.plus

    Параметры:
    user_id (int): ID пользователя в телеграм
    amount (int): Сумма к пополнению
    method (str): Тип оплаты, crypto или card (card тип не поддерживается)

    Возвращает:
    Данные о кошельке, или об инвойсе, если он был сгенерирован.
    """
    # https://docs.cryptocloud.plus/en/api-reference-v2/create-invoice
    response_data = payment_uuid = None
    pre_create = await Transactions.pre_create_invoice(user_id)
    if pre_create is not True:
        return False
    url = "https://api.cryptocloud.plus/v2/invoice/create"
    headers = {"Authorization": f"Token {C_KEY}", "Content-Type": "application/json"}
    data = {"amount": 10 if method == "card" else amount, "shop_id": C_ID, "currency": "USD"}
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(url, data=json.dumps(data), headers=headers) as response:
                if response.status == 200:
                    response = await response.json()
                    payment_uuid = response["result"]["uuid"]
                    if method != "card":
                        response_data = response["result"]["link"]
            if (isinstance(payment_uuid, str)) and (method == "card"):
                url = "https://api.cryptocloud.plus/v2/invoice/checkout/confirm"
                headers = {"Content-Type": "application/json"}
                data = {"invoice_uuid": payment_uuid.split("-")[-1], "currency_code": "USDT_BSC", "phone_number": "", "customer_invoice_email": ""}
                async with session.post(url, data=json.dumps(data), headers=headers) as response:
                    if response.status == 200:
                        response = await response.json()
                        response_data = method = response["result"]["address"]
                        _ = response["result"]["amount_to_pay"]
        except Exception as exc:
            logger.error(exc)
    if isinstance(response_data, str):
        await Transactions.create_invoice(user_id, method, payment_uuid)
    return response_data


async def check_invoice(payment_uuid: str) -> None:
    """
    Функция, используется для проверки конкретного инвойса в cryptocloud.

    Параметры:
    payment_uuid (str): Идентификатор платежа
    """
    # https://docs.cryptocloud.plus/ru/api-reference-v2/invoice-information
    url = "https://api.cryptocloud.plus/v2/invoice/merchant/info"
    headers = {"Authorization": f"Token {C_KEY}", "Content-Type": "application/json"}
    data = {"uuids": [payment_uuid]}
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(url, data=json.dumps(data), headers=headers) as response:
                if response.status == 200:
                    response = await response.json()
                    amount = float(response["result"][0]["received_usd"])
                    if (response["result"][0]["status"] in ["overpaid", "paid"]) and (amount > 0) and (response["result"][0]["test_mode"] is False):
                        payment_uuid = f"INV-{payment_uuid.replace('INV-', '')}"
                        await Transactions.confirm_invoice(payment_uuid, amount)
        except Exception as exc:
            logger.exception(exc)
