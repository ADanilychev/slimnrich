import sys

from aiogram.types import InlineKeyboardMarkup, WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder

sys.path.append("..")
from script.localization import buttons


def web_app_keyboard(link: str, title_key: str, language: str) -> InlineKeyboardMarkup:
    """
    Инлайн-клавиатура, используется для входа в веб-апп приложение.

    Параметры:
    link (str): Ссылка на web-app приложение
    title_key (str): Ключ для заголовка кнопки
    language (str): Язык пользователя

    Возвращает:
    Готовую инлайн-клавиатуру.
    """
    builder = InlineKeyboardBuilder()
    button_text = buttons[title_key].get(language, buttons[title_key]["en"])
    builder.button(text=button_text, web_app=WebAppInfo(url=link))
    return builder.as_markup()
