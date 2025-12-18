import asyncio
import json
import random

import aiohttp

from database.objects import Base, engine, Notifications
from configuration.module import START_LINK, BOT_TOKEN
from localization import buttons, notifications_messages, messages


async def main() -> None:
    photo = messages["notification_image"]
    while True:
        await asyncio.sleep(3)
        notifications = await Notifications.get_notifications()
        for notification in notifications:
            user_id = notification["user_id"]
            notification_type = notification["notification_type"]
            language = await Notifications.validate_notification(user_id, notification_type, notification["timestamp"])
            if isinstance(language, str):
                try:
                    if notification_type == "weight":
                        text = random.choice(notifications_messages.get(language, notifications_messages["en"]))
                    else:
                        text = messages["inactive_notification"].get(language, messages["inactive_notification"]["en"])
                    button_text = buttons["join"].get(language, buttons["join"]["en"])
                    kb_line = [{"text": button_text, "web_app": {"url": START_LINK}}]
                    keyboard = json.dumps({"inline_keyboard": [kb_line]})
                    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendPhoto"
                    payload = {"chat_id": user_id, "caption": text, "photo": photo, "reply_markup": keyboard}
                    async with aiohttp.ClientSession() as session:
                        async with session.post(url, json=payload) as response:
                            response.raise_for_status()
                            await response.json()
                except Exception as _:
                    pass


if __name__ == "__main__":
    Base.metadata.create_all(engine)
    asyncio.run(main())
