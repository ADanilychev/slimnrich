import asyncio

from database.objects import Base, engine
from telegram.core import start_bot

if __name__ == "__main__":
    Base.metadata.create_all(engine)
    asyncio.run(start_bot())
