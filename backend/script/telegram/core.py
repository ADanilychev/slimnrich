import asyncio
import sys
from datetime import datetime

from aiogram import Bot, exceptions, Dispatcher, types
from aiogram.client.default import DefaultBotProperties
from aiogram.filters import Command, ChatMemberUpdatedFilter, IS_NOT_MEMBER, IS_MEMBER
from aiogram.types import ErrorEvent, CallbackQuery, ChatMemberUpdated

sys.path.append("..")
from script.configuration.module import (
    BOT_TOKEN,
    START_LINK,
    ADMIN_IDS,
    ADMIN_LINK,
    PAYMENTS_CHAT,
    MODERATOR_LINK, PREMIUM_CHAT
)
from script.database.objects import Users, Referrals, Withdrawals, Moderators
from script.localization import messages
from script.telegram.keyboards import web_app_keyboard


bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode="Markdown"))
dp = Dispatcher()

BASIC_EXCEPTIONS = (
    exceptions.TelegramBadRequest,
    exceptions.TelegramNotFound,
    exceptions.TelegramRetryAfter,
    exceptions.TelegramNetworkError,
    exceptions.TelegramServerError,
    exceptions.TelegramForbiddenError,
    exceptions.TelegramUnauthorizedError
)


@dp.errors()
async def handle_exception(event: ErrorEvent, bot: Bot) -> None:
    """
    Асинхронная функция, обрабатывает ошибки, которые не были обработаны ботом.

    Параметры:
    event (ErrorEvent): Тело ошибки
    _ (Bot): Текущая сессия бота
    """
    print(f"Обработана ошибка {event.exception}.")


async def send_message(chat_id: int, text_key: str, language: str, retries: int = 0) -> None:
    """
    Асинхронная функция, используется для тихой отправки сообщений пользователям.

    Параметры:
    chat_id (int): ID пользователя, которому нужно отправить сообщение
    text_key (str): Ключ отправляемого текста из локализации
    """
    try:
        if retries < 3:
            text = messages[text_key].get(language, messages[text_key]["en"])
            if text_key == "admin_start":
                needed_link = ADMIN_LINK
            elif text_key == "moderator_start":
                needed_link = MODERATOR_LINK
            else:
                needed_link = START_LINK
            keyboard = web_app_keyboard(needed_link, "join", language)
            if (f"{text_key}_image" in messages.keys()) and (retries < 2):
                await bot.send_photo(
                    chat_id=chat_id,
                    photo=messages[f"{text_key}_image"],
                    caption=text,
                    reply_markup=keyboard
                )
            else:
                await bot.send_message(
                    chat_id=chat_id,
                    text=text,
                    reply_markup=keyboard
                )
    except BASIC_EXCEPTIONS:
        await asyncio.sleep(2)
        return await send_message(chat_id, text_key, language, retries + 1)


async def delete_keyboard(chat_id: int, message_id: int, retries: int = 0) -> None:
    """
    Асинхронная функция, используется для тихого удаления инлайн-клавиатуры.

    Параметры:
    chat_id (int): ID чата, где находится сообщение
    message_id (int): ID сообщения
    """
    try:
        if retries < 3:
            await bot.edit_message_reply_markup(chat_id=chat_id, message_id=message_id, reply_markup=None)
    except BASIC_EXCEPTIONS:
        await asyncio.sleep(2)
        return await delete_keyboard(chat_id, message_id, retries + 1)


@dp.chat_member(ChatMemberUpdatedFilter(IS_NOT_MEMBER >> IS_MEMBER))
async def new_member(event: ChatMemberUpdated):
    """
    Обработчик, проверяет вступивших пользователей в премиум группу.

    Параметры:
    event (types.ChatMemberUpdated): Объект произошедшего события
    """
    from_group_id = int(f'-100{str(event.chat.id).replace("-100", "").replace("-", "")}')
    if from_group_id == PREMIUM_CHAT:
        user_id = event.new_chat_member.user.id
        user = await Users.user_balances_info(user_id)
        if (not isinstance(user, dict)) or (user.get("is_premium", False) is not True):
            until_date = int(datetime.now().timestamp())
            await bot.ban_chat_member(
                chat_id=PREMIUM_CHAT,
                user_id=user_id,
                until_date=until_date + 600
            )


@dp.message(Command(commands=["start"]))
async def command_start(message: types.Message) -> None:
    """
    Функция, вызывается при использовании команды /start в боте.

    Параметры:
    message (types.Message): Объект сообщения от пользователя
    """
    sender_id = message.from_user.id
    chat_id = message.chat.id
    if 0 < chat_id == sender_id:
        user = await Users.get_user(sender_id)
        if isinstance(user, dict):
            countdown = user["data"].get("countdown", 0)
            current_timestamp = int(datetime.now().timestamp())
            if (isinstance(countdown, int)) and (current_timestamp > countdown):
                await send_message(sender_id, "start", user["data"].get("language", "en"))
                message_data = message.text.split()
                if (len(message_data) == 2) and (user["data"].get("action", 0) in [0, 1]):
                    inviter = str(message_data[-1]).lower()
                    if inviter != str(sender_id):
                        await Referrals.add_referral(user, inviter)
                await Users.update_data(sender_id, {"countdown": current_timestamp + 30})


@dp.message(Command(commands=["admin"]))
async def command_admin(message: types.Message) -> None:
    """
    Функция, вызывается при использовании команды /admin в боте.

    Параметры:
    message (types.Message): Объект сообщения от пользователя
    """
    sender_id = message.from_user.id
    chat_id = message.chat.id
    if 0 < chat_id == sender_id in ADMIN_IDS:
        user = await Users.get_user(sender_id)
        if isinstance(user, dict):
            return await send_message(sender_id, "admin_start", user["data"].get("language", "en"))


@dp.message(Command(commands=["moderator"]))
async def command_moderator(message: types.Message) -> None:
    """
    Функция, вызывается при использовании команды /moderator в боте.

    Параметры:
    message (types.Message): Объект сообщения от пользователя
    """
    sender_id = message.from_user.id
    chat_id = message.chat.id
    if 0 < chat_id == sender_id:
        user = await Users.get_user(sender_id)
        if isinstance(user, dict):
            if sender_id not in ADMIN_IDS:
                moderator = await Moderators.get_moderator(sender_id)
                if not isinstance(moderator, dict):
                    return None
            return await send_message(sender_id, "moderator_start", user["data"].get("language", "en"))


@dp.callback_query()
async def callback_query_func(information: CallbackQuery) -> None:
    """
    Асинхронная функция-обработчик входящих callback-данных.

    Параметры:
    information (CallbackQuery): Тело callback-запроса
    """
    callback_data = str(information.data)
    callback_list = callback_data.split(":")
    chat_id = information.message.chat.id
    user = information.from_user
    message_id = information.message.message_id
    if (chat_id == PAYMENTS_CHAT) and (len(callback_list) == 3) and (user and user.id in ADMIN_IDS):
        if "withdraw" in callback_data:
            row_id = int(callback_list[-1])
            result = False
            if "accept" in callback_data:
                result = await Withdrawals.update_withdrawal(row_id, {"status": True})
            elif "decline" in callback_data:
                result = await Withdrawals.update_withdrawal(row_id, {"status": False})
            await delete_keyboard(chat_id, message_id)
            if result is True:
                text = messages[f"{callback_list[1]}_withdraw"]["en"]
            else:
                text = messages["withdrawal_not_found"]["en"]
            await bot.answer_callback_query(information.id, text)


async def start_bot() -> None:
    """
    Асинхронная функция, запускает бота.
    """
    await dp.start_polling(bot)
