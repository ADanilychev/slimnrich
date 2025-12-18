import math
import random
import string
import sys
from collections import defaultdict
from contextlib import contextmanager
from datetime import datetime, timedelta
from typing import Any, Dict, List

import numpy as np
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Boolean,
    BigInteger,
    func,
    and_,
    or_,
    desc,
    Float,
    Index,
    cast,
    text,
    case
)
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import declarative_base, scoped_session, sessionmaker
from sqlalchemy.orm.attributes import flag_modified

sys.path.append("..")
from script.configuration.module import DB_USER, DB_PASSWORD, DB_HOST, DB_TABLE, ADMIN_IDS, BASIC_AVATARS
from script.localization import achievements, achievements_annotations, transaction_types, questions

DB_PATH = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_TABLE}"
engine = create_engine(DB_PATH, pool_size=80, max_overflow=10, pool_timeout=30, pool_recycle=3600, pool_pre_ping=True)
session_factory = sessionmaker(bind=engine)
Session = scoped_session(session_factory)
Base = declarative_base()


@contextmanager
def create_session() -> Session:
    session = Session()
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()


class Users(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, nullable=False, unique=True, index=True)
    data = Column(JSONB, nullable=False, default={})
    about_data = Column(JSONB, nullable=False, default={})
    auth_date = Column(Integer, nullable=False, default=0, index=True)

    def to_json(self) -> Dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    async def get_user(user_id: int) -> Dict:
        timestamp = int(datetime.now().timestamp())
        user_data = {
            "user_id": user_id,
            "data": {
                "action": 0,
                "name": f"User{random.randint(1, 99999)}",
                "avatar": random.choice(BASIC_AVATARS)
            },
            "about_data": {},
            "auth_date": timestamp
        }
        with create_session() as session:
            user = session.query(Users).filter(Users.user_id == user_id).first()
            if user:
                return user.to_json()
            session.add(Users(**user_data))
        return user_data

    @staticmethod
    async def user_basic_info(user_id: int) -> Dict:
        user_data, new_achievements = {}, []
        current_timestamp = int(datetime.now().timestamp())
        with create_session() as session:
            new_alerts = session.query(UserAlerts).filter(UserAlerts.user_id == user_id).count()
            new_alerts = str(new_alerts) if new_alerts <= 99 else "99+"
            user = session.query(Users).filter(Users.user_id == user_id).first()
            if user:
                user = user.to_json()
                user_data = user.get("data", {})
                has_achievements = [
                    achievement[0] for achievement in
                    session.query(Achievements.code).filter(
                        Achievements.user_id == user_id
                    ).all()
                ]
                results = [
                    timestamp[0] for timestamp in
                    session.query(Files.timestamp).filter(Files.user_id == user_id, Files.file_type == "weight").all()
                ]
                active_weeks = None
                for key in ["weight", "participation", "battle"]:
                    available_achievements = achievements[key]
                    for needed_result, achievement_data in available_achievements.items():
                        achievement_code = achievement_data.get("code")
                        if achievement_code not in has_achievements:
                            if key == "weight":
                                if needed_result > user_data.get("start_weight", 0) - user_data.get("weight", 0):
                                    continue
                            elif key == "participation":
                                if not results:
                                    continue
                                if active_weeks is None:
                                    weeks = set()
                                    for timestamp in results:
                                        try:
                                            dt = datetime.fromtimestamp(timestamp)
                                            week_number = dt.isocalendar()[1]
                                            weeks.add(week_number)
                                        except (TypeError, ValueError):
                                            continue
                                    active_weeks = len(weeks)
                                if needed_result > active_weeks:
                                    continue
                            elif key == "battle":
                                if needed_result > user_data.get("won_weeks", 0):
                                    continue
                            session.add(Achievements(
                                user_id=user_id,
                                code=achievement_code,
                                timestamp=current_timestamp
                            ))
                            subtitle = ""
                            if key in achievements_annotations.keys():
                                subtitle = achievements_annotations[key].get(
                                    user_data.get("language", "en"), achievements_annotations[key]["en"]
                                ).format(placeholder=str(needed_result))
                            new_achievements.append({
                                "favicon": achievement_data.get("favicon"),
                                "title": achievement_data.get("title", {}).get(user_data.get("language", "en")),
                                "subtitle": subtitle
                            })
        available_timestamp = current_timestamp - (86400 * 30)
        month_weight = session.query(Files).filter(
            Files.user_id == user_id,
            Files.file_type == "weight",
            Files.timestamp > available_timestamp
        ).order_by(
            Files.timestamp
        ).first()
        weight = user_data.get("weight", 0)
        if month_weight:
            month_weight = month_weight.weight - weight
        else:
            month_weight = 0
        avatar = user_data.get("avatar", random.choice(BASIC_AVATARS))
        if avatar.startswith("static"):
            avatar = f"https://webapp.slim-n-rich.com/api/{avatar}"
        achievements_count = session.query(Achievements).filter(
            Achievements.user_id == user_id
        ).count()
        banned = user_data.get("banned", 0)
        is_banned = banned > current_timestamp
        return {
            "name": user_data.get("name", f"User{random.randint(1, 99999)}"),
            "new_alerts": new_alerts,
            "avatar": avatar,
            "user_id": user_id,
            "achievements_count": achievements_count,
            "action": user_data.get("action", 0),
            "is_banned": is_banned,
            "banned": banned if is_banned else None,
            "is_premium": user_data.get("premium", 0) > current_timestamp,
            "premium": user_data.get("premium", 0),
            "balance": user_data.get("balance", 0),
            "bonus_balance": user_data.get("bonus_balance", 0),
            "frozen_balance": user_data.get("frozen_balance", 0),
            "frozen_bonus_balance": user_data.get("frozen_bonus_balance", 0),
            "frozen_total_balance": user_data.get("frozen_total_balance", 0),
            "numbers_system": user_data.get("numbers", "kg/cm"),
            "language": user_data.get("language", "en"),
            "timezone": user_data.get("timezone", 0),
            "notifications": user_data.get("notifications", True),
            "weight_kg": user_data.get("weight", 0),
            "height_cm": user_data.get("height", 0),
            "start_weight_kg": user_data.get("start_weight", 0),
            "start_height_cm": user_data.get("start_height", 0),
            "month_weight": month_weight,
            "new_achievements": new_achievements,
            "timestamp": current_timestamp
        }

    @staticmethod
    async def get_profile(sender_id: int, user_id: int) -> Dict:
        current_timestamp = int(datetime.now().timestamp())
        user_data, reg_date = {}, current_timestamp
        user_results = await Files.get_files(sender_id, user_id, True, "%m/%d")
        with create_session() as session:
            achievements_count = session.query(Achievements).filter(
                Achievements.user_id == user_id
            ).count()
            user = session.query(Users).filter(Users.user_id == user_id).first()
            if user:
                user = user.to_json()
                user_data = user.get("data", {})
                reg_date = user["auth_date"]
            dt_object = datetime.fromtimestamp(reg_date)
            weight_kg = user_data.get("weight", 0)
            start_weight = user_data.get("start_weight", 0)
            if user_data.get("banned", 0) < current_timestamp:
                name = user_data.get("name", f"User{random.randint(1, 99999)}")
                avatar = user_data.get("avatar", random.choice(BASIC_AVATARS))
            else:
                name = f"User{random.randint(1, 99999)}"
                avatar = random.choice(BASIC_AVATARS)
                user_results = {key: [] for key in ["weight", "food", "life"]}
            if avatar.startswith("static"):
                avatar = f"https://webapp.slim-n-rich.com/api/{avatar}"
            return {
                "its_you": user_id == sender_id,
                "name": name,
                "avatar": avatar,
                "user_id": user_id,
                "results": user_results,
                "weight_kg": weight_kg,
                "weight_lost": round(start_weight - weight_kg, 1),
                "reg_date": dt_object.strftime("%Y/%m/%d"),
                "is_premium": user_data.get("premium", 0) > current_timestamp,
                "achievements_count": achievements_count
            }

    @staticmethod
    async def user_stats_info(user_id: int) -> Dict:
        response = {}
        with create_session() as session:
            user = session.query(Users).filter(Users.user_id == user_id).first()
            now = datetime.now()
            current_weight, numbers_system, end_period = 0, "kg/cm", int(now.timestamp())
            if user:
                timezone = user.data.get("timezone", 0)
                today_midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
                time_difference = timedelta(hours=timezone)
                end_period = today_midnight + time_difference
                end_period = int(end_period.timestamp())
                current_weight = user.data.get("weight", 0)
                numbers_system = user.data.get("numbers", "kg/cm")
            for period in ["7", "30", "365", "all"]:
                response.setdefault(period, {
                    "stats": [current_weight for _ in range(7)],
                    "change": 0.0,
                    "current": current_weight,
                    "average": 0.0,
                    "numbers_system": numbers_system
                })
                needed_time = end_period if not str(period).isdigit() else 86400 * int(period)
                stats = [
                    stat[0] for stat in
                    session.query(Files.weight).filter(
                        Files.user_id == user_id,
                        Files.file_type == "weight",
                        Files.timestamp > end_period - needed_time
                    ).order_by(Files.timestamp).all()
                ]
                if stats:
                    results = np.array(stats)
                    chunk_size = len(results) // 7
                    remainder = len(results) % 7
                    averages = []
                    start_index = last_average = 0
                    for i in range(7):
                        end_index = start_index + chunk_size
                        if i < remainder:
                            end_index += 1
                        if start_index == end_index:
                            averages.append(last_average)
                        else:
                            average = np.mean(results[start_index:end_index])
                            averages.append(average)
                            last_average = average
                        start_index = end_index
                    try:
                        averages = list(map(float, averages))
                    except ValueError as _:
                        pass
                    response[period]["stats"] = [round(avg, 1) for avg in averages[:6]] + [current_weight]
                    response[period]["change"] = round(averages[0] - current_weight, 2)
                    response[period]["average"] = round(sum(averages) / len(averages), 2)
        return {"result": response}

    @staticmethod
    async def user_balances_info(user_id: int) -> Dict:
        user_data = {}
        with create_session() as session:
            user = session.query(Users).filter(Users.user_id == user_id).first()
            if user:
                user = user.to_json()
                user_data = user.get("data", {})
        current_timestamp = int(datetime.now().timestamp())
        return {
            "is_premium": user_data.get("premium", 0) > current_timestamp,
            "balance": user_data.get("balance", 0),
            "bonus_balance": user_data.get("bonus_balance", 0),
            "frozen_total_balance": user_data.get("frozen_total_balance", 0),
            "timestamp": current_timestamp
        }

    @staticmethod
    async def user_referrals_info(user_id: int) -> Dict:
        with create_session() as session:
            invited = session.query(Referrals).filter(Referrals.inviter == user_id).count()
            earned_bonuses = session.query(func.sum(ReferralsRevenue.amount)).filter(
                ReferralsRevenue.inviter == user_id,
                ReferralsRevenue.balance_type == "bonus"
            ).scalar()
            earned_money = session.query(func.sum(ReferralsRevenue.amount)).filter(
                ReferralsRevenue.inviter == user_id,
                ReferralsRevenue.balance_type == "real"
            ).scalar()
            blogger = session.query(Bloggers).filter(Bloggers.user_id == user_id).first()
            promo_code = None
            if blogger:
                promo_code = blogger.promo_code
        current_timestamp = int(datetime.now().timestamp())
        suffix = str(user_id) if not promo_code else promo_code
        return {
            "invite_link": f"https://t.me/SlimNRichBot?start={suffix}",
            "promo_code": promo_code,
            "invited_count": invited,
            "earned_money": earned_money if earned_money else 0.0,
            "earned_bonuses": earned_bonuses if earned_bonuses else 0.0,
            "timestamp": current_timestamp
        }

    @staticmethod
    async def user_achievements_info(user_id: int) -> Dict:
        user_data = {}
        with create_session() as session:
            user = session.query(Users).filter(Users.user_id == user_id).first()
            if user:
                user = user.to_json()
                user_data = user.get("data", {})
        language = user_data.get("language", "en")
        current_timestamp = int(datetime.now().timestamp())
        has_achievements = await Achievements.get_achievements(user_id)
        pages, t_has_list, t_available_list = [], [], []
        total_count = 0
        for key, value in achievements.items():
            has_list, available_list = [], []
            for placeholder, data in value.items():
                subtitle = ""
                if key in achievements_annotations.keys():
                    subtitle = achievements_annotations[key].get(
                        language, achievements_annotations[key]["en"]
                    ).format(placeholder=str(placeholder))
                achievement = {
                    "favicon": data.get("favicon"),
                    "title": data.get("title", {}).get(language, "en"),
                    "subtitle": subtitle
                }
                if data.get("code") in has_achievements:
                    has_list.append(achievement)
                    achievement["has_achievement"] = True
                    t_has_list.append(achievement)
                else:
                    available_list.append(achievement)
                    achievement["has_achievement"] = False
                    t_available_list.append(achievement)
            pages.append({"has": has_list, "available": available_list})
            total_count += len(has_list) + len(available_list)
        random.shuffle(t_has_list)
        pre_page = t_has_list + t_available_list
        return {
            "pre_page": pre_page[:5],
            "pages": pages,
            "total_count": total_count,
            "timestamp": current_timestamp
        }

    @staticmethod
    async def user_battles_info(
            user: dict,
            only_battles: bool = False,
            amount_needed: bool = False,
            another_battle: str = None,
            period_needed: bool = False,
            timestamps_needed: bool = False,
            participants_needed: bool = False
    ) -> Any:
        current_weight = temp_weight = user["data"]["weight"]
        if current_weight <= 0:
            return False
        max_lost_kg = []
        for _ in range(11):
            max_lost_kg.append(round(temp_weight, 1))
            temp_weight *= 0.99
        max_lost_kg = max_lost_kg[1:]
        current_timestamp = int(datetime.now().timestamp())
        battles_info = {}
        user_id = user["user_id"]
        battle_titles = ["bymyself", "onevsfriend", "onevsone", "groupfortime", "withyourgroup", "groupbyweight"]
        if isinstance(another_battle, str):
            battle_titles = [another_battle]
        with create_session() as session:
            for title in battle_titles:
                battle_data, battle = {}, None
                if title == "bymyself":
                    battle = session.query(ByMyself).filter(
                        ByMyself.data["user_id"].cast(BigInteger) == user_id
                    ).order_by(desc(ByMyself.id)).first()
                elif title == "onevsfriend":
                    battle = session.query(OneVsFriend).filter(
                        OneVsFriend.participants.contains(cast([user_id], JSONB))
                    ).order_by(desc(OneVsFriend.id)).first()
                elif title == "onevsone":
                    battle = session.query(OneVsOne).filter(
                        OneVsOne.participants.contains(cast([user_id], JSONB))
                    ).order_by(desc(OneVsOne.id)).first()
                elif title == "groupfortime":
                    battle = session.query(GroupForTime).filter(
                        GroupForTime.participants.contains(cast([user_id], JSONB))
                    ).order_by(desc(GroupForTime.id)).first()
                elif title == "withyourgroup":
                    battle = session.query(WithYourGroup).filter(
                        WithYourGroup.participants.contains(cast([user_id], JSONB))
                    ).order_by(desc(WithYourGroup.id)).first()
                elif title == "groupbyweight":
                    battle = session.query(GroupByWeight).filter(
                        GroupByWeight.participants.contains(cast([user_id], JSONB))
                    ).order_by(desc(GroupByWeight.id)).first()
                else:
                    continue
                battle_id, amount = None, 0
                if battle:
                    battle_data = battle.to_json()
                    battle_id = battle_data["id"]
                    amount = battle_data["data"].get("amount", 0)
                global_data = battle_data.get("data", {})
                if "participants" in battle_data.keys():
                    participants_data = battle_data["participants_data"]
                    p_data = participants_data.get(str(user_id), {})
                else:
                    p_data = global_data
                timezone = p_data.get("timezone", 0)
                start_timestamp = battle_data.get("start_date", current_timestamp)
                start_date = datetime.fromtimestamp(start_timestamp)
                start_date = start_date + timedelta(hours=timezone)
                end_timestamp = battle_data.get("end_date", current_timestamp)
                end_date = datetime.fromtimestamp(end_timestamp)
                end_date = end_date + timedelta(hours=timezone)
                start_result = session.query(Files).filter(
                    Files.user_id == user_id,
                    Files.file_type == "weight",
                    Files.timestamp < start_timestamp
                ).order_by(desc(Files.timestamp)).first()
                if start_result:
                    start_weight = start_result.weight
                else:
                    start_weight = user["data"].get("start_weight", 0)
                final_weight = p_data.get("goal", 0)
                reached = 0
                if final_weight > 0:
                    goal = round(start_weight - final_weight, 1)
                    final_result = session.query(Files).filter(
                        Files.user_id == user_id,
                        Files.file_type == "weight",
                        Files.timestamp < end_timestamp,
                        Files.timestamp > start_timestamp
                    ).order_by(desc(Files.timestamp)).first()
                    if final_result:
                        reached_weight = final_result.weight
                        if reached_weight <= final_weight:
                            reached = goal
                        else:
                            reached = round(goal - abs(reached_weight - final_weight), 1)
                else:
                    goal = 0
                if end_timestamp < current_timestamp:
                    if reached < goal:
                        status = "lost"
                    else:
                        status = "won"
                elif end_timestamp == start_timestamp:
                    status = "new"
                elif (battle_data.get("status", True) is None) or (start_timestamp > current_timestamp):
                    status = "waiting"
                else:
                    status = "continue"
                current_info = {
                    "participants": len(battle_data.get("participants", [])),
                    "status": status,
                    "reached": reached,
                    "goal": goal,
                    "start_date": start_date.strftime("%B %d"),
                    "end_date": end_date.strftime("%B %d")
                }
                if only_battles is True:
                    current_info["id"] = battle_id
                    if amount_needed is True:
                        current_info["amount"] = amount
                    if period_needed is True:
                        current_info["period"] = (end_timestamp - start_timestamp + 1) // (86400 * 7)
                    if timestamps_needed is True:
                        current_info["start_timestamp"] = start_timestamp
                        current_info["end_timestamp"] = end_timestamp
                    if participants_needed:
                        if "participants_data" not in battle_data.keys():
                            current_info["participants"] = [battle_data.get("data", {}).get("user_id", user_id)]
                        else:
                            current_info["participants"] = battle_data.get("participants", [])
                battles_info[title] = current_info
        if only_battles is True:
            return battles_info
        return {
            "max_kg": max_lost_kg,
            "max_lb": [
                math.floor(temp_weight * 2.20462 * 10) / 10
                for temp_weight in max_lost_kg
            ],
            "battles_data": battles_info,
            "timestamp": current_timestamp
        }

    @staticmethod
    async def update_user(user_id: int, update_data: dict) -> None:
        with create_session() as session:
            session.query(Users).filter(Users.user_id == user_id).update(update_data)

    @staticmethod
    async def update_data(user_id: int, update_data: dict) -> None:
        with create_session() as session:
            user = session.query(Users).filter(Users.user_id == user_id).first()
            if user:
                for key, value in update_data.items():
                    if value is not None:
                        user.data[key] = value
                flag_modified(user, "data")

    @staticmethod
    async def admin_info(start_timestamp: int, end_timestamp: int) -> Dict:
        current_timestamp = int(datetime.now().timestamp())
        start_timestamp = 0 if start_timestamp > end_timestamp else start_timestamp
        end_timestamp = current_timestamp if end_timestamp < current_timestamp else end_timestamp
        with create_session() as session:
            bloggers_earned = session.query(func.sum(ReferralsRevenue.amount)).filter(
                ReferralsRevenue.balance_type == "real"
            ).scalar()
            bloggers_earned = bloggers_earned if isinstance(bloggers_earned, int) else 0
            bloggers_invited = session.query(Referrals).filter(Referrals.is_blogger.is_(True)).count()
            total_users = session.query(Users).count()
            period_new_users = session.query(Users).filter(
                Users.auth_date > start_timestamp,
                Users.auth_date < end_timestamp
            ).count()
            period_premium_users = session.query(Users).join(
                BalanceHistory, BalanceHistory.user_id == Users.user_id
            ).filter(
                BalanceHistory.type == "buy_premium",
                BalanceHistory.timestamp > start_timestamp,
                BalanceHistory.timestamp < end_timestamp,
                Users.auth_date > start_timestamp,
                Users.auth_date < end_timestamp
            ).count()
            active_bymyself = session.query(ByMyself).filter(ByMyself.end_date > current_timestamp).count()
            total_bymyself = session.query(ByMyself).count()
            active_onevsfriend = session.query(OneVsFriend).filter(OneVsFriend.end_date > current_timestamp).count()
            total_onevsfriend = session.query(OneVsFriend).count()
            active_onevsone = session.query(OneVsOne).filter(OneVsOne.end_date > current_timestamp).count()
            total_onevsone = session.query(OneVsOne).count()
            active_yourgroup = session.query(WithYourGroup).filter(WithYourGroup.end_date > current_timestamp).count()
            total_yourgroup = session.query(WithYourGroup).count()
            active_groupweight = session.query(GroupByWeight).filter(GroupByWeight.end_date > current_timestamp).count()
            total_groupweight = session.query(GroupByWeight).count()
            active_grouptime = session.query(GroupForTime).filter(GroupForTime.end_date > current_timestamp).count()
            total_grouptime = session.query(GroupForTime).count()
            active_battles = active_bymyself + active_onevsfriend + active_onevsone + active_yourgroup + active_grouptime + active_groupweight
            total_battles = total_bymyself + total_onevsfriend + total_onevsone + total_yourgroup + total_groupweight + total_grouptime
            battles_rating = {
                "bymyself": {
                    "current_battles": active_bymyself,
                    "rating": 100 if active_battles <= 0 else int(round((active_bymyself / active_battles) * 100))
                },
                "onevsfriend": {
                    "current_battles": active_onevsfriend,
                    "rating": 100 if active_battles <= 0 else int(round((active_onevsfriend / active_battles) * 100))
                },
                "onevsone": {
                    "current_battles": active_onevsone,
                    "rating": 100 if active_battles <= 0 else int(round((active_onevsone / active_battles) * 100))
                },
                "groupfortime": {
                    "current_battles": active_grouptime,
                    "rating": 100 if active_battles <= 0 else int(round((active_grouptime / active_battles) * 100))
                },
                "withyourgroup": {
                    "current_battles": active_yourgroup,
                    "rating": 100 if active_battles <= 0 else int(round((active_yourgroup / active_battles) * 100))
                },
                "groupbyweight": {
                    "current_battles": active_groupweight,
                    "rating": 100 if active_battles <= 0 else int(round((active_groupweight / active_battles) * 100))
                }
            }
            total_fees = await PaymentMethods.get_another_balance("fees")
            total_lost = await PaymentMethods.get_another_balance("lost")
            total_frozen_money = current_users_bonuses = current_users_balance = 0
            for user in [user.to_json() for user in session.query(Users).all()]:
                user_data = user["data"]
                total_frozen_money += user_data.get("frozen_balance", 0)
                current_users_balance += user_data.get("balance", 0)
                current_users_bonuses += user_data.get("bonus_balance", 0)
        return {
            "bloggers_earned": bloggers_earned,
            "bloggers_invited": bloggers_invited,
            "total_users": total_users,
            "period_users": period_new_users,
            "period_premium_users": period_premium_users,
            "period_free_users": period_new_users - period_premium_users,
            "active_battles": active_battles,
            "total_battles": total_battles,
            "battles_rating": battles_rating,
            "total_fees": total_fees,
            "total_lost": total_lost,
            "users_real_balance": current_users_balance,
            "users_bonus_balance": current_users_bonuses,
            "total_frozen_money": total_frozen_money
        }

    @staticmethod
    async def about_datas(language: str = "en") -> Dict:
        with create_session() as session:
            data = [data[0] for data in session.query(Users.about_data).all()]
        key_value_counts = defaultdict(lambda: defaultdict(int))
        for item in data:
            for key, value in item.items():
                if ((isinstance(value, str)) and ("description" not in str(key))) or (key == "timezone"):
                    key_value_counts[key][str(value)] += 1
        percentage_results = {}
        for key, value_counts in key_value_counts.items():
            key_data = questions.get(key, {}).get(language, {})
            total_count = sum(value_counts.values())
            percentage_results.setdefault(key, {"bar_type": "stack"})
            for value, count in value_counts.items():
                available_answers = key_data.get("answers", [])
                for a_data in available_answers:
                    if isinstance(a_data, dict):
                        if (str(a_data.get("value", "")) == str(value)) or (str(value) == "skip"):
                            title = str(a_data.get("text", ""))
                            if str(value) == "skip":
                                title = "Skip"
                            elif len(title) > 8:
                                percentage_results[key]["bar_type"] = "horizontal"
                            percentage_results[key].setdefault("question", {})
                            percentage_results[key]["question"].setdefault(key_data.get("title", ""), [])
                            current_metric = {
                                "title": title,
                                "score": round((count / total_count) * 100, 2)
                            }
                            percentage_results[key]["question"][key_data.get("title", "")].append(current_metric)
                            break
        return percentage_results

    @staticmethod
    async def get_private_profile(sender_id: int, user_id: int, language: str) -> Dict:
        current_timestamp = int(datetime.now().timestamp())
        user_data, reg_date = {}, current_timestamp
        user_results = await Files.get_files(sender_id, user_id, True, "%m/%d")
        with create_session() as session:
            user = session.query(Users).filter(Users.user_id == user_id).first()
            achievements_count = session.query(Achievements).filter(Achievements.user_id == user_id).count()
            about_data = {}
            if user:
                user = user.to_json()
                user_data = user.get("data", {})
                about_data = user.get("about_data", {})
                reg_date = user["auth_date"]
            dt_object = datetime.fromtimestamp(reg_date)
            weight_kg = user_data.get("weight", 0)
            start_weight = user_data.get("start_weight", 0)
            if user_data.get("banned", 0) < current_timestamp:
                avatar = user_data.get("avatar", random.choice(BASIC_AVATARS))
            else:
                avatar = random.choice(BASIC_AVATARS)
                user_results = {key: [] for key in ["weight", "food", "life"]}
            if avatar.startswith("static"):
                avatar = f"https://webapp.slim-n-rich.com/api/{avatar}"
            ban_timestamp = user_data.get("banned", 0)
            banned_date = datetime.fromtimestamp(ban_timestamp)
            premium_timestamp = user_data.get("premium", current_timestamp)
            premium_date = datetime.fromtimestamp(premium_timestamp)
            approved_terms = user_data.get("terms_accepted", {})
            approved_terms_date = datetime.fromtimestamp(approved_terms.get("date", current_timestamp))
            approved_terms_ip = approved_terms.get("client_ip", "N/A")
            reports_by_user = session.query(Reports).filter(Reports.sender == user_id).count()
            reports_for_user = session.query(Reports).filter(Reports.receiver == user_id).count()
            approved_reports_for_user = session.query(Reports).filter(
                Reports.receiver == user_id,
                Reports.data.has_key("status"),
                Reports.data["status"].as_string() == "true"
            ).count()
            if not user:
                user = {"user_id": user_id, "data": {"weight": weight_kg, "start_weight": start_weight}}
            battles_info = await Users.user_battles_info(
                user=user,
                only_battles=True,
                timestamps_needed=True,
                participants_needed=True
            )
            battles_info = [
                value | {"title": key} for key, value in battles_info.items()
                if isinstance(value.get("id"), int) and str(value.get("status", "new")) == "continue"
            ]
            balance_history = await BalanceHistory.get_history(user_id, language, 1, current_timestamp, 1, "all")
        about_data_response = {}
        for key, value in about_data.items():
            if "description" not in key:
                key_data = questions.get(key, {}).get(language, {})
                available_answers = key_data.get("answers", [])
                about_data_response[key] = {"title": key_data.get("title", {}), "answer": ""}
                answer_list = []
                for a_data in available_answers:
                    if isinstance(a_data, dict):
                        if (str(a_data.get("value", "")) == str(value)) or (str(value).lower() == "skip"):
                            if str(value).lower() == "skip":
                                answer_text = "Skip"
                            elif str(value) == "another":
                                answer_text = str(about_data.get(f"{key}_description", ""))
                            else:
                                answer_text = str(a_data.get("text", ""))
                            about_data_response[key]["answer"] = answer_text
                            break
                        elif (isinstance(value, list)) and (str(a_data.get("value", "")) in value):
                            answer_list.append(str(a_data.get("text", "")))
                if len(answer_list) > 0:
                    about_data_response[key]["answer"] = "; ".join(answer_list)
        return {
            "its_you": user_id == sender_id,
            "name": user_data.get("name", f"User{random.randint(1, 99999)}"),
            "avatar": avatar,
            "user_id": user_id,
            "is_banned": ban_timestamp > current_timestamp,
            "ban_until": banned_date.strftime("%Y/%m/%d %H:%M:%S"),
            "achievements_count": achievements_count,
            "results": user_results,
            "weight_kg": weight_kg,
            "weight_lost": round(start_weight - weight_kg, 1),
            "reg_date": dt_object.strftime("%Y/%m/%d"),
            "is_premium": premium_timestamp > current_timestamp,
            "premium_date": premium_date.strftime("%Y/%m/%d"),
            "approved_terms_date": approved_terms_date.strftime("%Y/%m/%d %H:%M:%S"),
            "approved_terms_ip": approved_terms_ip,
            "reports_by_user": reports_by_user,
            "reports_for_user": reports_for_user,
            "approved_reports_for_user": approved_reports_for_user,
            "battles_info": battles_info,
            "balance_history": balance_history,
            "about_data": about_data_response
        }

    @staticmethod
    async def get_admin_battles(battle_id: int = None, battle_type: str = None) -> List[Dict]:
        titles = ["bymyself", "onevsfriend", "onevsone", "groupfortime", "withyourgroup", "groupbyweight"]
        is_another = isinstance(battle_id, int) and isinstance(battle_type, str)
        if is_another:
            titles = [battle_type]
        response = []
        timestamp = int(datetime.now().timestamp())
        with create_session() as session:
            for title in titles:
                if title == "bymyself":
                    if is_another:
                        needed_filter = ByMyself.id == battle_id
                    else:
                        needed_filter = and_(ByMyself.end_date > timestamp, ByMyself.start_date < timestamp)
                    battles = session.query(ByMyself).filter(
                        ByMyself.status.is_(True),
                        needed_filter
                    ).order_by(desc(ByMyself.id)).limit(5).all()
                elif title == "onevsfriend":
                    if is_another:
                        needed_filter = OneVsFriend.id == battle_id
                    else:
                        needed_filter = and_(OneVsFriend.end_date > timestamp, OneVsFriend.start_date < timestamp)
                    battles = session.query(OneVsFriend).filter(
                        OneVsFriend.status.is_(True),
                        needed_filter
                    ).order_by(desc(OneVsFriend.id)).limit(5).all()
                elif title == "onevsone":
                    if is_another:
                        needed_filter = OneVsOne.id == battle_id
                    else:
                        needed_filter = and_(OneVsOne.end_date > timestamp, OneVsOne.start_date < timestamp)
                    battles = session.query(OneVsOne).filter(
                        OneVsOne.status.is_(True),
                        needed_filter
                    ).order_by(desc(OneVsOne.id)).limit(5).all()
                elif title == "groupfortime":
                    if is_another:
                        needed_filter = GroupForTime.id == battle_id
                    else:
                        needed_filter = and_(GroupForTime.end_date > timestamp, GroupForTime.start_date < timestamp)
                    battles = session.query(GroupForTime).filter(
                        GroupForTime.status.is_(True),
                        needed_filter
                    ).order_by(desc(GroupForTime.id)).limit(5).all()
                elif title == "withyourgroup":
                    if is_another:
                        needed_filter = WithYourGroup.id == battle_id
                    else:
                        needed_filter = and_(WithYourGroup.end_date > timestamp, WithYourGroup.start_date < timestamp)
                    battles = session.query(WithYourGroup).filter(
                        WithYourGroup.status.is_(True),
                        needed_filter
                    ).order_by(desc(WithYourGroup.id)).limit(5).all()
                elif title == "groupbyweight":
                    if is_another:
                        needed_filter = GroupByWeight.id == battle_id
                    else:
                        needed_filter = and_(GroupByWeight.end_date > timestamp, GroupByWeight.start_date < timestamp)
                    battles = session.query(GroupByWeight).filter(
                        GroupByWeight.status.is_(True),
                        needed_filter
                    ).order_by(desc(GroupByWeight.id)).limit(5).all()
                else:
                    continue
                for battle in battles:
                    battle_data = {}
                    if battle:
                        battle_data = battle.to_json()
                    start_timestamp = battle_data.get("start_date", timestamp)
                    start_date = datetime.fromtimestamp(start_timestamp)
                    end_timestamp = battle_data.get("end_date", timestamp)
                    end_date = datetime.fromtimestamp(end_timestamp)
                    participants = []
                    participants_data = {
                        str(battle_data.get("data", {}).get("user_id", 0)):
                            battle_data.get("data", {})
                    } if "participants_data" not in battle_data.keys() else battle_data.get("participants_data", {})
                    for participant, participant_data in participants_data.items():
                        p_obj = session.query(Users).filter(Users.user_id == int(participant)).first()
                        if p_obj:
                            p_obj = p_obj.to_json()
                            p_udata = p_obj["data"]
                            avatar = p_udata.get("avatar", random.choice(BASIC_AVATARS))
                            name = p_udata.get("name", f"User{random.randint(1, 99999)}")
                            if p_udata.get("banned", 0) > timestamp:
                                name = f"User{random.randint(1, 99999)}"
                                avatar = random.choice(BASIC_AVATARS)
                            if avatar.startswith("static"):
                                avatar = f"https://webapp.slim-n-rich.com/api/{avatar}"
                            achievements_count = session.query(Achievements).filter(
                                Achievements.user_id == participant
                            ).count()
                            participants.append({
                                "name": name,
                                "avatar": avatar,
                                "user_id": participant,
                                "achievements_count": achievements_count,
                                "weight_kg": p_udata.get("weight", 0),
                                "its_you": False
                            })
                    needed_results = battle_data.get("data", {}).get("period", 2)
                    none_list = [None for _ in range(needed_results)]
                    response.append({
                        "id": battle_data.get("id", 0),
                        "amount": battle_data.get("data", {}).get("amount", 0),
                        "is_owner": False,
                        "battle_code": battle_data.get("data", {}).get("battle_code", ""),
                        "participants": participants,
                        "title": title,
                        "status": "continue",
                        "alerts": [],
                        "results": [],
                        "progress": none_list,
                        "money_progress": none_list,
                        "needed_results": needed_results,
                        "reached": 0,
                        "goal": battle_data.get("goal", 0),
                        "start_date": start_date.strftime("%B %d"),
                        "end_date": end_date.strftime("%B %d"),
                        "start_timestamp": start_timestamp,
                        "end_timestamp": end_timestamp
                    })
        return response

    @staticmethod
    async def change_balance(
            user_id: int,
            amount: int,
            balance_type: str,
            direction: str,
            need_freeze: bool = False
    ) -> bool:
        response, balance_changes = False, []
        if amount == 0:
            return response
        with create_session() as session:
            user = session.query(Users).filter(Users.user_id == user_id).first()
            if user:
                current_data = user.data
                bonus_balance = current_data.get("bonus_balance", 0)
                real_balance = current_data.get("balance", 0)
                frozen_balance = current_data.get("frozen_balance", 0)
                frozen_bonus_balance = current_data.get("frozen_bonus_balance", 0)
                if ((bonus_balance + amount >= 0 > amount) or (amount > 0)) and (balance_type in ["both", "bonus"]):
                    user.data["bonus_balance"] = bonus_balance + amount
                    balance_changes.append({
                        "user_id": user_id,
                        "balance_type": "bonus",
                        "type": direction,
                        "amount": amount
                    })
                    if need_freeze and amount < 0:
                        user.data["frozen_bonus_balance"] = frozen_bonus_balance - amount
                    response = True
                elif (bonus_balance + real_balance >= -amount) and (amount < 0) and (balance_type in ["both"]):
                    user.data["bonus_balance"] = 0
                    if bonus_balance > 0:
                        amount += bonus_balance
                        balance_changes.append({
                            "user_id": user_id,
                            "balance_type": "bonus",
                            "type": direction,
                            "amount": -bonus_balance
                        })
                    balance_changes.append({
                        "user_id": user_id,
                        "balance_type": "real",
                        "type": direction,
                        "amount": amount
                    })
                    real_balance += amount
                    user.data["balance"] = real_balance
                    response = True
                elif ((real_balance >= -amount and amount < 0) or (amount > 0)) and (balance_type == "real"):
                    balance_changes.append({
                        "user_id": user_id,
                        "balance_type": "real",
                        "type": direction,
                        "amount": amount
                    })
                    real_balance += amount
                    user.data["balance"] = real_balance
                    if need_freeze and amount < 0:
                        user.data["frozen_balance"] = frozen_balance - amount
                    response = True
                elif (balance_type == "frozen") and (amount < 0) and (frozen_balance + amount >= 0):
                    user.data["frozen_balance"] = frozen_balance + amount
                    response = True
                elif (balance_type == "frozen_bonus") and (amount < 0) and (frozen_bonus_balance + amount >= 0):
                    user.data["frozen_bonus_balance"] = frozen_bonus_balance + amount
                    response = True
                else:
                    return response
                flag_modified(user, "data")
        if response and balance_changes:
            await BalanceHistory.add_rows(balance_changes)
        return response


class Moderators(Base):
    __tablename__ = "moderators"

    id = Column(BigInteger, primary_key=True)
    full_name = Column(String, nullable=False)
    user_id = Column(BigInteger, nullable=False, unique=True, index=True)
    data = Column(JSONB, nullable=False, default={})
    timestamp = Column(Integer, nullable=False)

    def to_json(self) -> Dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    async def add_moderator(moderator_id: int, full_name: str, by_user: int) -> bool:
        with create_session() as session:
            moderator = session.query(Moderators).filter(Moderators.user_id == moderator_id).first()
            if not moderator:
                timestamp = int(datetime.now().timestamp())
                session.add(Moderators(
                    full_name=full_name,
                    user_id=moderator_id,
                    data={"by_user": by_user},
                    timestamp=timestamp
                ))
                return True
        return False

    @staticmethod
    async def get_moderator(user_id: int) -> Dict:
        with create_session() as session:
            moderator = session.query(Moderators).filter(Moderators.user_id == user_id).first()
            if moderator:
                return moderator.to_json()

    @staticmethod
    async def delete_moderator(moderator_id: int) -> bool:
        with create_session() as session:
            moderator = session.query(Moderators).filter(Moderators.user_id == moderator_id).first()
            if moderator:
                session.delete(moderator)
                return True
        return False

    @staticmethod
    async def get_moderators() -> List[Dict]:
        response = []
        with create_session() as session:
            for moderator in [
                moderator.to_json() for moderator in
                session.query(Moderators).order_by(desc(Moderators.id)).all()
            ]:
                response.append({
                    "id": moderator["id"],
                    "user_id": moderator["user_id"],
                    "full_name": moderator["full_name"]
                })
        return response


class PaymentMethods(Base):
    __tablename__ = "payment_methods"

    id = Column(Integer, primary_key=True)
    method = Column(String, nullable=False)
    balance = Column(Integer, nullable=False, default=0)

    def to_json(self) -> Dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    async def working_with_balance(method: str, money: int) -> bool:
        with create_session() as session:
            try:
                row = session.query(PaymentMethods).filter(PaymentMethods.method == method).first()
                if row:
                    current_balance = row.balance
                    if current_balance + money >= 0:
                        row.balance = current_balance + money
                        return True
                elif money >= 0:
                    session.add(PaymentMethods(method=method, balance=money))
                    return True
                else:
                    return False
            except IntegrityError:
                return False

    @staticmethod
    async def get_another_balance(method: str) -> int:
        with create_session() as session:
            row = session.query(PaymentMethods).filter(PaymentMethods.method == method).first()
            if row:
                return row.balance
            return 0

    @staticmethod
    async def get_balances() -> List[Dict]:
        with create_session() as session:
            return [
                payment_method.to_json() for payment_method in
                session.query(PaymentMethods).filter(PaymentMethods.method.in_(
                    ["stars", "crypto", "card", "cats", "dogs", "children", "developers"]
                )).all()
            ]


class Referrals(Base):
    __tablename__ = "referrals"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, nullable=False, unique=True, index=True)
    inviter = Column(BigInteger, nullable=False, index=True)
    is_blogger = Column(Boolean, nullable=False, default=False)
    timestamp = Column(Integer, nullable=False)

    def to_json(self) -> Dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    async def add_referral(user: dict, inviter: Any) -> None:
        user_id = user["user_id"]
        timestamp = int(datetime.now().timestamp())
        is_blogger = False
        with create_session() as session:
            referral = session.query(Referrals).filter(Referrals.user_id == user_id).first()
            if not referral:
                if isinstance(inviter, str):
                    inviter_obj = session.query(Bloggers).filter(Bloggers.promo_code == inviter.lower()).first()
                    if inviter_obj:
                        inviter = inviter_obj.user_id
                        is_blogger = True
                if str(inviter).isdigit():
                    inviter = int(inviter)
                    inviter_row = session.query(Users).filter(Users.user_id == inviter).first()
                    if inviter_row:
                        session.add(Referrals(
                            user_id=user_id,
                            inviter=inviter,
                            is_blogger=is_blogger,
                            timestamp=timestamp
                        ))
                        achievements_count = session.query(Achievements).filter(
                            Achievements.user_id == user_id
                        ).count()
                        await Users.change_balance(inviter, 1000, "bonus", "invited_referral")
                        await ReferralsRevenue.add_revenue(user_id, inviter, "bonus", 1000)
                        current_timestamp = int(datetime.now().timestamp())
                        if user["data"].get("banned", 0) < current_timestamp:
                            name = user["data"].get("name", f"User{random.randint(1, 99999)}")
                            avatar = user["data"].get("avatar", random.choice(BASIC_AVATARS))
                        else:
                            name = f"User{random.randint(1, 99999)}"
                            avatar = random.choice(BASIC_AVATARS)
                        if avatar.startswith("static"):
                            avatar = f"https://webapp.slim-n-rich.com/api/{avatar}"
                        alert_data = {
                            "user_id": user_id,
                            "file": None,
                            "amount": 1000,
                            "avatar": avatar,
                            "name": name,
                            "achievements_count": achievements_count,
                            "timestamp": current_timestamp
                        }
                        await UserAlerts.add_alert(inviter, "referral", alert_data)

    @staticmethod
    async def get_inviter(user_id: int, user_obj: bool = True) -> Dict:
        with create_session() as session:
            referral = session.query(Referrals).filter(Referrals.user_id == user_id).first()
            if referral:
                if user_obj is not True:
                    return referral.to_json()
                inviter = session.query(Users).filter(Users.user_id == referral.inviter).first()
                if inviter:
                    return inviter.to_json()


class ReferralsRevenue(Base):
    __tablename__ = "referrals_revenue"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, nullable=False)
    inviter = Column(BigInteger, nullable=False, index=True)
    balance_type = Column(String, nullable=False, index=True)
    amount = Column(BigInteger, nullable=False)
    timestamp = Column(Integer, nullable=False, index=True)

    def to_json(self) -> Dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    async def add_revenue(user_id: int, inviter: int, balance_type: str, amount: int) -> None:
        timestamp = int(datetime.now().timestamp())
        with create_session() as session:
            session.add(ReferralsRevenue(
                user_id=user_id,
                inviter=inviter,
                balance_type=balance_type,
                amount=amount,
                timestamp=timestamp
            ))

    @staticmethod
    async def get_referrals_revenue(inviter: int, balance_type: str, start_time: int, end_time: int, page: int) -> Dict:
        page = 0 if page <= 0 else page - 1
        response = {"result": [], "total_pages": 0}
        current_timestamp = int(datetime.now().timestamp())
        end_time = current_timestamp if end_time <= 0 else end_time
        with create_session() as session:
            total_rows = session.query(ReferralsRevenue.user_id).filter(
                ReferralsRevenue.inviter == inviter,
                ReferralsRevenue.balance_type == balance_type,
                ReferralsRevenue.timestamp > start_time,
                ReferralsRevenue.timestamp < end_time
            ).distinct().count()
            total_pages = 0 if total_rows <= 0 else int(math.ceil(total_rows / 10))
            response["total_pages"] = total_pages
            result = [
                {"user_id": user_id, "total_amount": total_amount}
                for user_id, total_amount in
                session.query(
                    ReferralsRevenue.user_id,
                    func.sum(ReferralsRevenue.amount).label("total_amount")
                ).filter(
                    ReferralsRevenue.inviter == inviter,
                    ReferralsRevenue.balance_type == balance_type,
                    ReferralsRevenue.timestamp > start_time,
                    ReferralsRevenue.timestamp < end_time
                ).group_by(
                    ReferralsRevenue.user_id
                ).order_by(desc("total_amount"))
                .offset(10 * page)
                .limit(10)
                .all()
            ]
            for data in result:
                current_user = session.query(Users).filter(Users.user_id == data["user_id"]).first()
                if current_user:
                    name = current_user.data.get("name", f"User{random.randint(1, 99999)}")
                    timestamp = current_user.auth_date
                else:
                    name = f"User{random.randint(1, 99999)}"
                    timestamp = current_timestamp
                dt_object = datetime.fromtimestamp(timestamp)
                response["result"].append({
                    "name": name,
                    "user_id": data["user_id"],
                    "amount": data["total_amount"],
                    "date": dt_object.strftime("%Y/%m/%d")
                })
        return response


class Bloggers(Base):
    __tablename__ = "bloggers"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, nullable=False, unique=True, index=True)
    data = Column(JSONB, nullable=False, default={})
    promo_code = Column(String, nullable=False, unique=True, index=True)
    timestamp = Column(Integer, nullable=False)

    def to_json(self) -> Dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    async def add_blogger(by_user: int, user_id: int, promo_code: str, revenue_percent: int) -> Any:
        with create_session() as session:
            blogger = session.query(Bloggers).filter(or_(
                Bloggers.user_id == user_id,
                Bloggers.promo_code == promo_code.lower()
            )).first()
            if not blogger:
                user = session.query(Users).filter(Users.user_id == user_id).first()
                if not user:
                    return None
                session.add(Bloggers(
                    user_id=user_id,
                    data={"added_by": by_user, "percent": revenue_percent},
                    promo_code=promo_code,
                    timestamp=int(datetime.now().timestamp())
                ))
                return True
        return False

    @staticmethod
    async def delete_blogger(user_id: int) -> None:
        with create_session() as session:
            session.query(Bloggers).filter(Bloggers.user_id == user_id).delete()

    @staticmethod
    async def get_bloggers() -> List:
        response = []
        current_timestamp = int(datetime.now().timestamp())
        with create_session() as session:
            for blogger in [
                blogger.to_json() for blogger in
                session.query(Bloggers).order_by(desc(Bloggers.id)).all()
            ]:
                name = f"User{random.randint(1, 99999)}"
                user = session.query(Users).filter(Users.user_id == blogger["user_id"]).first()
                balance = 0
                if user:
                    user = user.to_json()
                    if user["data"].get("banned", 0) < current_timestamp:
                        name = user["data"].get("name", name)
                    balance = user["data"].get("balance", 0)
                referrals_count = session.query(Referrals).filter(Referrals.inviter == user["user_id"]).count()
                response.append({
                    "user_id": blogger["user_id"],
                    "referrals_count": referrals_count,
                    "promo_code": blogger["promo_code"],
                    "name": name,
                    "balance": balance,
                    "revenue_percent": blogger["data"].get("percent", 0)
                })
        return response


class Likes(Base):
    __tablename__ = "likes"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, nullable=False)
    file_id = Column(BigInteger, nullable=False, index=True)
    amount = Column(BigInteger, nullable=False)

    def to_json(self) -> Dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    async def add_like(file_id: int, user: dict) -> bool:
        file = await Files.get_file(file_id)
        sender_id = user["user_id"]
        if (isinstance(file, dict)) and (file["user_id"] != sender_id) and (isinstance(file["photo"], str)):
            balance_changed = await Users.change_balance(sender_id, -10, "bonus", "send_gift")
            if balance_changed is True:
                with create_session() as session:
                    like = session.query(Likes).filter(Likes.user_id == sender_id, Likes.file_id == file_id).first()
                    if like:
                        current_amount = like.amount
                        like.amount = current_amount + 9
                    else:
                        session.add(Likes(
                            user_id=sender_id,
                            file_id=file_id,
                            amount=9
                        ))
                    achievements_count = session.query(Achievements).filter(
                        Achievements.user_id == sender_id
                    ).count()
                current_timestamp = int(datetime.now().timestamp())
                if user["data"].get("banned", 0) < current_timestamp:
                    name = user["data"].get("name", f"User{random.randint(1, 99999)}")
                    avatar = user["data"].get("avatar", random.choice(BASIC_AVATARS))
                else:
                    name = f"User{random.randint(1, 99999)}"
                    avatar = random.choice(BASIC_AVATARS)
                if avatar.startswith("static"):
                    avatar = f"https://webapp.slim-n-rich.com/api/{avatar}"
                file_url = file["photo"]
                if file_url.startswith("static"):
                    file_url = f"https://webapp.slim-n-rich.com/api/{file_url}"
                alert_data = {
                    "user_id": sender_id,
                    "file": file_url,
                    "amount": 9,
                    "avatar": avatar,
                    "name": name,
                    "achievements_count": achievements_count,
                    "timestamp": current_timestamp
                }
                await UserAlerts.add_alert(file["user_id"], "like", alert_data)
                await Users.change_balance(file["user_id"], 9, "bonus", "received_gift")
                return True
            else:
                return False

    @staticmethod
    async def get_ratings(user_id: int, file_id: int) -> List[Dict]:
        response = []
        file = await Files.get_file(file_id)
        if (isinstance(file, dict)) and (user_id in [file.get("user_id")]):
            current_timestamp = int(datetime.now().timestamp())
            with create_session() as session:
                ratings = [
                    like.to_json() for like in
                    session.query(Likes).filter(Likes.file_id == file_id).order_by(desc(Likes.amount)).limit(500).all()
                ]
                for rating in ratings:
                    user = await Users.get_user(rating["user_id"])
                    if isinstance(user, dict):
                        is_banned = user["data"].get("banned", 0) > current_timestamp
                        user_name = f"User{random.randint(1, 99999)}"
                        user_avatar = random.choice(BASIC_AVATARS)
                        if not is_banned:
                            user_name = user["data"].get("name", user_name)
                            user_avatar = user["data"].get("avatar", user_avatar)
                        if user_avatar.startswith("static"):
                            user_avatar = f"https://webapp.slim-n-rich.com/api/{user_avatar}"
                        response.append({
                            "user_id": rating["user_id"],
                            "name": user_name,
                            "avatar": user_avatar,
                            "amount": rating["amount"]
                        })
        return response


class UserAlerts(Base):
    __tablename__ = "user_alerts"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, nullable=False, index=True)
    alert_type = Column(String, nullable=False, index=True)
    alert_data = Column(JSONB, nullable=False, default={})
    timestamp = Column(Integer, nullable=False, index=True)

    def to_json(self) -> Dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    async def add_alert(user_id: int, alert_type: str, data: dict) -> None:
        with create_session() as session:
            session.add(UserAlerts(
                user_id=user_id,
                alert_type=alert_type,
                alert_data=data,
                timestamp=data["timestamp"]
            ))

    @staticmethod
    async def read_alerts(user_id: int, alert_ids: List[int], all_condition: bool = False) -> None:
        with create_session() as session:
            if all_condition is True:
                session.query(UserAlerts).filter(UserAlerts.user_id == user_id).delete()
            else:
                session.query(UserAlerts).filter(UserAlerts.user_id == user_id, UserAlerts.id.in_(alert_ids)).delete()

    @staticmethod
    async def get_alerts(user_id: int, another_group: str = None, page: int = 1) -> Dict:
        page = 0 if page <= 0 else page - 1
        default_groups = ["like", "referral", "battle"]
        if another_group is None:
            groups = default_groups
        else:
            groups = [another_group]
        response = {group: [] for group in default_groups} | {f"{group}_size": "" for group in default_groups} | {"total_size": 0}
        total_size = 0
        with create_session() as session:
            for group in groups:
                current_group = [
                    alert[1] | {"id": alert[0]} for alert in
                    session.query(UserAlerts.id, UserAlerts.alert_data).filter(
                        UserAlerts.user_id == user_id,
                        UserAlerts.alert_type == group
                    ).offset(100 * page)
                    .limit(100).all()
                ]
                response[group] = current_group
                group_len = len(current_group)
                if group_len > 0:
                    if group_len > 99:
                        response[f"{group}_size"] = "99+"
                    else:
                        response[f"{group}_size"] = str(group_len)
                    total_size += group_len
        response["total_size"] = str(total_size) if total_size <= 99 else "99+"
        return response

    @staticmethod
    async def delete_old_alerts() -> None:
        current_timestamp = int(datetime.now().timestamp())
        with create_session() as session:
            session.query(UserAlerts).filter(UserAlerts.timestamp < current_timestamp - (86400 * 7)).delete()


class Files(Base):
    __tablename__ = "files"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, nullable=False, index=True)
    file_type = Column(String, nullable=False, index=True)
    meta_data = Column(JSONB, nullable=False, default={})
    weight = Column(Float, nullable=False, default=0)
    photo = Column(String, nullable=True, index=True)
    timestamp = Column(Integer, nullable=False, index=True)

    def to_json(self) -> Dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    async def add_file(
            user_id: int,
            file_type: str,
            photo: str,
            description: str,
            title: str,
            calories: int = 0,
            weight: float = 0
    ) -> Any:
        now = datetime.now()
        today_midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
        now_date = today_midnight.date()
        now_day = now_date.weekday()
        days_since_monday = (now_day - 0) % 7
        last_monday = now_date - timedelta(days=days_since_monday)
        last_monday_datetime = datetime.combine(last_monday, now.time())
        last_monday = int(last_monday_datetime.timestamp())
        current_timestamp = int(now.timestamp())
        with create_session() as session:
            result = session.query(Files).filter(
                Files.user_id == user_id,
                Files.file_type == file_type,
                Files.timestamp > current_timestamp - 3600
            ).first()
            is_weight = (file_type == "weight") and (weight > 0)
            if not result:
                session.add(Files(
                    user_id=user_id,
                    file_type=file_type,
                    meta_data={"title": title, "description": description, "calories": calories},
                    weight=weight,
                    photo=photo,
                    timestamp=current_timestamp
                ))
                pre_data = {"file_type": file_type, "change": 0, "bonus": 0, "numbers": "kg/cm"}
                if is_weight:
                    user = session.query(Users).filter(Users.user_id == user_id).first()
                    if user:
                        notifications = user.data.get("notifications", True)
                        timezone = user.data.get("timezone", 0)
                        current_weight = user.data.get("weight", 0)
                        pre_data["numbers"] = user.data.get("numbers", "kg/cm")
                        pre_data["change"] = round(weight - current_weight, 2)
                        user.data["weight"] = round(weight, 2)
                        flag_modified(user, "data")
                        session.commit()
                        if now_day > 0:
                            results = [
                                result[0] for result in
                                session.query(Files.timestamp).filter(
                                    Files.user_id == user_id,
                                    Files.file_type == file_type,
                                    Files.timestamp > last_monday
                                ).order_by(desc(Files.timestamp)).all()
                            ]
                            dates = sorted(
                                list(set(datetime.fromtimestamp(timestamp).date() for timestamp in results)),
                                reverse=True
                            )
                            consecutive_days = 0
                            if dates:
                                consecutive_days = 1
                                for i in range(1, len(dates)):
                                    if dates[i] == dates[i - 1] - timedelta(days=1):
                                        consecutive_days += 1
                                    else:
                                        break
                            if consecutive_days <= 0:
                                return True
                            elif consecutive_days > 7:
                                consecutive_days = 7
                            upload_bonus = 10 * consecutive_days
                            await Users.change_balance(user_id, upload_bonus, "bonus", "result_streak")
                            pre_data["bonus"] = upload_bonus
                        if notifications is True:
                            await Notifications.add_notification(user_id, timezone)
                else:
                    await Users.change_balance(user_id, 10, "bonus", "photo_upload")
                    pre_data["bonus"] = 10
                return pre_data
        return False

    @staticmethod
    async def update_meta_data(user_id: int, file_id: int, title: str = "", description: str = "") -> bool:
        with create_session() as session:
            file = session.query(Files).filter(Files.id == file_id, Files.user_id == user_id).first()
            if file:
                if (isinstance(title, str)) and (file.file_type == "life") and (len(title) > 0):
                    file.meta_data["title"] = title
                if (isinstance(description, str)) and (len(description) > 0):
                    file.meta_data["description"] = description
                flag_modified(file, "meta_data")
                return True
        return False

    @staticmethod
    async def get_file(file_id: int) -> Dict:
        with create_session() as session:
            file = session.query(Files).filter(Files.id == file_id).first()
            if file:
                return file.to_json()

    @staticmethod
    async def get_latest(user_id: int) -> bool:
        current_timestamp = int(datetime.now().timestamp())
        with create_session() as session:
            row = session.query(Files).filter(
                and_(
                    Files.user_id == user_id,
                    Files.file_type == "weight",
                    Files.timestamp > current_timestamp - (86400 * 14)
                )
            ).first()
            if row:
                return True
        return False

    @staticmethod
    async def get_files(sender_id: int, user_id: int, profile_condition: bool = True, dt_format: str = "%Y/%m/%d") -> Dict:
        available_types = ["weight", "food", "life"]
        response = {key: [] for key in available_types}
        with create_session() as session:
            if profile_condition is True:
                available_timestamp = int(datetime.now().timestamp()) - (86400 * 360)
                needed_filters = and_(
                    Files.user_id == user_id,
                    Files.timestamp > available_timestamp,
                    Files.photo.is_not(None)
                )
            else:
                needed_filters = Files.user_id == user_id
            result = [
                row.to_json() for row in
                session.query(Files).filter(
                    needed_filters
                ).order_by(desc(Files.id)).limit(500).all() # 168
            ]
            for data in result:
                if data["file_type"] not in available_types:
                    continue
                likes = None
                if sender_id == user_id:
                    likes = session.query(func.sum(Likes.amount)).filter(Likes.file_id == data["id"]).scalar()
                if likes is None:
                    likes = 0
                current_photo = data["photo"]
                if isinstance(current_photo, str):
                    if current_photo.startswith("static"):
                        current_photo = f"https://webapp.slim-n-rich.com/api/{current_photo}"
                dt_object = datetime.fromtimestamp(data["timestamp"])
                formatted_date = dt_object.strftime(dt_format)
                response[data["file_type"]].append({
                    "id": data["id"],
                    "gifts": likes,
                    "weight": data["weight"],
                    "calories": data["meta_data"].get("calories", 0),
                    "title": data["meta_data"].get("title", ""),
                    "description": data["meta_data"].get("description", ""),
                    "photo": current_photo,
                    "date": formatted_date
                })
        return response

    @staticmethod
    async def remove_old_photos() -> List[str]:
        with create_session() as session:
            available_timestamp = int(datetime.now().timestamp()) - (86400 * 60)
            needed_filters = and_(
                Files.timestamp < available_timestamp,
                Files.photo.is_not(None)
            )
            photos = [
                photo[0] for photo in
                session.query(Files.photo).filter(needed_filters).all()
            ]
            session.query(Files).filter(needed_filters).update({"photo": None})
            return photos


class Withdrawals(Base):
    __tablename__ = "withdrawals"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, nullable=False)
    method = Column(String, nullable=False)
    wallet = Column(String, nullable=False)
    amount = Column(Integer, nullable=False)
    status = Column(Boolean, nullable=True, index=True)
    timestamp = Column(Integer, nullable=False)

    def to_json(self) -> Dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    async def add_withdrawal(user_id: int, method: str, amount: int, wallet: str) -> int:
        current_timestamp = int(datetime.now().timestamp())
        with create_session() as session:
            withdrawal = Withdrawals(
                user_id=user_id,
                method=method,
                wallet=wallet,
                amount=amount,
                timestamp=current_timestamp
            )
            session.add(withdrawal)
            session.commit()
            return withdrawal.id

    @staticmethod
    async def update_withdrawal(row_id: int, update_data: dict) -> bool:
        with create_session() as session:
            withdraw = session.query(Withdrawals).filter(
                Withdrawals.id == row_id,
                Withdrawals.status.is_(None)
            ).first()
            if withdraw:
                session.query(Withdrawals).filter(Withdrawals.id == row_id).update(update_data)
                return True


class Messages(Base):
    __tablename__ = "messages"

    id = Column(BigInteger, primary_key=True)
    chat_id = Column(BigInteger, nullable=False, index=True)
    sender = Column(BigInteger, nullable=False, index=True)
    text = Column(String, nullable=True)
    file = Column(String, nullable=True)
    timestamp = Column(Integer, nullable=False, index=True)

    def to_json(self) -> Dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    async def send_message(chat_id: int, user_id: int, text: str = None, file: str = None) -> bool:
        current_timestamp = int(datetime.now().timestamp())
        with create_session() as session:
            if (chat_id != user_id) and (isinstance(chat_id, int)) and (user_id not in ADMIN_IDS):
                moderator = session.query(Moderators).filter(Moderators.user_id == user_id).first()
                if not moderator:
                    return False
            else:
                previous_message = session.query(Messages).filter(
                    Messages.chat_id == chat_id,
                    Messages.sender == user_id
                ).order_by(desc(Messages.id)).first()
                if previous_message:
                    if previous_message.timestamp > current_timestamp - 60:
                        return False
            session.add(Messages(chat_id=chat_id, sender=user_id, text=text, file=file, timestamp=current_timestamp))
            return True

    @staticmethod
    async def get_messages(chat_id: int, user_id: int, page: int) -> bool | List[Dict]:
        page = 0 if page <= 0 else page - 1
        with create_session() as session:
            chat_id = user_id if chat_id is None else chat_id
            if chat_id != user_id:
                moderator = session.query(Moderators).filter(Moderators.user_id == user_id).first()
                if (not moderator) and (user_id not in ADMIN_IDS):
                    return False
            messages = [
                message.to_json() for message in
                session.query(Messages).filter(
                    Messages.chat_id == chat_id
                ).offset(100 * page)
                .limit(100)
                .all()
            ]
            response = []
            participants = {}
            for msg in messages:
                random_avatar = random.choice(BASIC_AVATARS)
                if random_avatar.startswith("static"):
                    random_avatar = f"https://webapp.slim-n-rich.com/api/{random_avatar}"
                if chat_id == user_id:
                    temp_data = {
                        "name": f"User{random.randint(1, 99999)}",
                        "avatar": random_avatar
                    }
                    response.append(msg | temp_data)
                else:
                    if msg["sender"] not in participants.keys():
                        user = session.query(Users).filter(Users.user_id == msg["sender"]).first()
                        if user:
                            user_data = user.data
                        else:
                            user_data = {}
                        avatar = user_data.get("avatar", random_avatar)
                        if avatar.startswith("static"):
                            avatar = f"https://webapp.slim-n-rich.com/api/{avatar}"
                        participants[msg["sender"]] = {
                            "name": user_data.get("name", f"User{random.randint(1, 99999)}"),
                            "avatar": avatar
                        }
                    response.append(msg | participants[msg["sender"]])
            return response

    @staticmethod
    async def get_chats(action_type: str) -> List[Dict]:
        response = []
        with create_session() as session:
            if action_type == "all":
                subquery = session.query(
                    Messages.chat_id,
                    func.max(Messages.timestamp).label("last_timestamp")
                ).group_by(
                    Messages.chat_id
                ).subquery()
                query = session.query(Messages).join(
                    subquery,
                    (Messages.chat_id == subquery.c.chat_id) & (Messages.timestamp == subquery.c.last_timestamp)
                ).limit(10).all()
            else:
                if action_type == "answered":
                    last_message_subq = session.query(
                        Messages.chat_id,
                        func.max(Messages.timestamp).label("last_timestamp")
                    ).group_by(Messages.chat_id).subquery()
                    query = session.query(Messages).join(
                        last_message_subq,
                        and_(
                            Messages.chat_id == last_message_subq.c.chat_id,
                            Messages.timestamp == last_message_subq.c.last_timestamp
                        )
                    ).filter(
                        Messages.sender != Messages.chat_id
                    ).limit(10).all()
                else:
                    timestamps_subq = session.query(
                        Messages.chat_id,
                        func.max(Messages.timestamp).label("overall_last_ts"),
                        func.max(
                            case(
                                (Messages.sender == Messages.chat_id, Messages.timestamp),
                                else_=None
                            )
                        ).label("owner_last_ts"),
                        func.max(
                            case(
                                (Messages.sender != Messages.chat_id, Messages.timestamp),
                                else_=None
                            )
                        ).label("other_last_ts")
                    ).group_by(Messages.chat_id).subquery()
                    qualifying_chats_subq = session.query(
                        timestamps_subq.c.chat_id,
                        timestamps_subq.c.overall_last_ts
                    ).filter(
                        timestamps_subq.c.owner_last_ts > timestamps_subq.c.other_last_ts
                    ).subquery()
                    query = session.query(Messages).join(
                        qualifying_chats_subq,
                        and_(
                            Messages.chat_id == qualifying_chats_subq.c.chat_id,
                            Messages.timestamp == qualifying_chats_subq.c.overall_last_ts
                        )
                    ).limit(10).all()
            chats = [chat.to_json() for chat in query]
            for chat in chats:
                response.append({
                    "chat_id": chat["chat_id"],
                    "status": "waiting" if chat["chat_id"] == chat["sender"] else "answered",
                    "date": datetime.fromtimestamp(chat["timestamp"]).strftime("%Y/%m/%d")
                })
        return response


class BalanceHistory(Base):
    __tablename__ = "balance_history"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, nullable=False, index=True)
    balance_type = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False, index=True)
    amount = Column(Integer, nullable=False)
    timestamp = Column(Integer, nullable=False, index=True)

    def to_json(self) -> Dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    async def add_rows(new_rows: List[Dict]) -> None:
        with create_session() as session:
            new_history = []
            current_timestamp = int(datetime.now().timestamp())
            for data in new_rows:
                new_history.append(BalanceHistory(
                    user_id=data["user_id"],
                    balance_type=data["balance_type"],
                    type=data["type"],
                    amount=data["amount"],
                    timestamp=current_timestamp
                ))
            if new_history:
                session.add_all(new_history)

    @staticmethod
    async def get_user_info(user_id: int) -> tuple[int, int, int]:
        month_top_ups = all_top_ups = withdrawn = 0
        current_timestamp = int(datetime.now().timestamp())
        try:
            with create_session() as session:
                month_top_ups = session.query(func.sum(Transactions.amount)).filter(
                    Transactions.user_id == user_id,
                    Transactions.status.is_(True),
                    Transactions.timestamp > current_timestamp - (86400 * 30)
                ).scalar()
                all_top_ups = session.query(func.sum(Transactions.amount)).filter(
                    Transactions.user_id == user_id,
                    Transactions.status.is_(True)
                ).scalar()
                withdrawn = session.query(func.sum(Withdrawals.amount)).filter(
                    Withdrawals.user_id == user_id,
                    Withdrawals.status.is_(True)
                ).scalar()
        except Exception as _:
            pass
        if month_top_ups is None:
            month_top_ups = 0
        if all_top_ups is None:
            all_top_ups = 0
        if withdrawn is None:
            withdrawn = 0
        return month_top_ups, all_top_ups, withdrawn

    @staticmethod
    async def get_history(
            user_id: int,
            language: str,
            start_timestamp: int,
            end_timestamp: int,
            page: int,
            history_type: str
    ) -> Dict:
        page = 0 if page <= 0 else page - 1
        response = {}
        needed_filters = and_(
            BalanceHistory.user_id == user_id,
            BalanceHistory.timestamp >= start_timestamp,
            BalanceHistory.timestamp <= end_timestamp
        )
        if history_type in ["bonus", "real"]:
            needed_filters = and_(
                needed_filters,
                BalanceHistory.balance_type == history_type
            )
        with create_session() as session:
            total_rows = session.query(BalanceHistory).filter(needed_filters).count()
            total_pages = 0 if total_rows <= 0 else int(math.ceil(total_rows / 100))
            history = [
                row.to_json() for row in
                session.query(BalanceHistory)
                .filter(needed_filters)
                .order_by(desc(BalanceHistory.id))
                .offset(100 * page)
                .limit(100)
                .all()
            ]
            for row in history:
                row_date = datetime.fromtimestamp(row["timestamp"])
                row_date = row_date.strftime("%Y/%m/%d")
                response.setdefault(row_date, [])
                response[row_date].append({
                    "balance_type": row["balance_type"],
                    "subtitle": transaction_types[row["type"]].get(language, transaction_types[row["type"]]["en"]),
                    "amount": row["amount"]
                })
        return {"result": response, "total_pages": total_pages}


class QueueDeletion(Base):
    __tablename__ = "queue_deletion"

    id = Column(BigInteger, primary_key=True)
    filename = Column(String, nullable=False, unique=True)

    def to_json(self) -> Dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    async def add_file(directory: str) -> None:
        with create_session() as session:
            session.add(QueueDeletion(filename=directory))

    @staticmethod
    async def get_files() -> Dict:
        with create_session() as session:
            file_row = session.query(QueueDeletion).first()
            if file_row:
                response = file_row.to_json()
                session.delete(file_row)
                return response


class Notifications(Base):
    __tablename__ = "notifications"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, nullable=False)
    notification_type = Column(String, nullable=False)
    timestamp = Column(Integer, nullable=False, index=True)

    def to_json(self) -> Dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    async def add_notification(user_id: int, timezone: int) -> None:
        with create_session() as session:
            row = session.query(Notifications).filter(Notifications.user_id == user_id).first()
            if (not row) or (row.notification_type == "inactive"):
                if row:
                    session.delete(row)
                now = datetime.now()
                today_seven_am = now.replace(hour=7, minute=0, second=0, microsecond=0)
                time_difference = timedelta(hours=timezone)
                new_time = today_seven_am + time_difference
                timestamp = int(new_time.timestamp()) + 86400
                session.add(Notifications(user_id=user_id, notification_type="weight", timestamp=timestamp))

    @staticmethod
    async def get_notifications() -> List[Dict]:
        current_timestamp = int(datetime.now().timestamp())
        with create_session() as session:
            return [
                notification.to_json() for notification in
                session.query(Notifications).filter(Notifications.timestamp < current_timestamp).limit(5).all()
            ]

    @staticmethod
    async def validate_notification(user_id: int, notification_type: str, notification_timestamp: int) -> str:
        user = await Users.get_user(user_id)
        if user["about_data"] and user["data"].get("notifications", True) is True:
            battles = await Users.user_battles_info(user, True)
            if battles and isinstance(battles, dict):
                status = "empty"
                for title, data in battles.items():
                    if data["status"] in ["continue"]:
                        status = "continue"
                        break
                timezone = user["data"].get("timezone", 0)
                now = datetime.now()
                today_midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
                today_seven_am = now.replace(hour=7, minute=0, second=0, microsecond=0)
                time_difference = timedelta(hours=timezone)
                today_time = today_midnight + time_difference
                today_timestamp = int(today_time.timestamp())
                new_time = today_seven_am + time_difference
                new_timestamp = int(new_time.timestamp()) + 86400
                if new_timestamp < notification_timestamp + 86400:
                    new_timestamp += 86400
                new_inactive_timestamp = new_timestamp + (86400 * 7)
                if (status == "empty") and (notification_type == "weight"):
                    with create_session() as session:
                        session.query(Notifications).filter(
                            Notifications.user_id == user_id
                        ).update({
                            "notification_type": "inactive",
                            "timestamp": new_inactive_timestamp
                        })
                elif (status == "empty") and (notification_type == "inactive"):
                    with create_session() as session:
                        session.query(Notifications).filter(Notifications.user_id == user_id).delete()
                    return user["data"].get("language", "en")
                elif (status == "continue") and (notification_type == "inactive"):
                    with create_session() as session:
                        session.query(Notifications).filter(
                            Notifications.user_id == user_id
                        ).update({
                            "notification_type": "weight",
                            "timestamp": new_timestamp
                        })
                elif (status == "continue") and (notification_type == "weight"):
                    with create_session() as session:
                        result = session.query(Files).filter(
                            Files.user_id == user_id,
                            Files.file_type == "weight",
                            Files.timestamp > today_timestamp
                        ).first()
                        session.query(Notifications).filter(
                            Notifications.user_id == user_id
                        ).update({"timestamp": new_timestamp})
                        if not result:
                            return user["data"].get("language", "en")


class Achievements(Base):
    __tablename__ = "achievements"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, nullable=False, index=True)
    code = Column(String, nullable=False)
    timestamp = Column(Integer, nullable=False)

    __table_args__ = (
        Index("unique_user_id_code", "user_id", "code", unique=True),
    )

    def to_json(self) -> Dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    async def get_achievements(user_id: int) -> List[str]:
        with create_session() as session:
            return [
                achievement[0] for achievement in
                session.query(Achievements.code).filter(Achievements.user_id == user_id).all()
            ]


class Reports(Base):
    __tablename__ = "reports"

    id = Column(BigInteger, primary_key=True)
    sender = Column(BigInteger, nullable=False, index=True)
    receiver = Column(BigInteger, nullable=False, index=True)
    status = Column(Boolean, nullable=True, index=True)
    data = Column(JSONB, nullable=False, default={})
    timestamp = Column(Integer, nullable=False, index=True)

    def to_json(self) -> Dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    async def add_report(sender: int, receiver: int, report_text: str) -> bool:
        current_timestamp = int(datetime.now().timestamp())
        with create_session() as session:
            check_same = session.query(Reports).filter(
                Reports.sender == sender,
                Reports.receiver == receiver,
                Reports.timestamp > current_timestamp - (86400 * 14)
            ).first()
            if check_same:
                return False
            check_receiver = session.query(Users).filter(Users.user_id == receiver).first()
            if check_receiver:
                session.add(Reports(
                    sender=sender,
                    receiver=receiver,
                    status=None,
                    data={"text": report_text},
                    timestamp=current_timestamp
                ))
            return True

    @staticmethod
    async def get_reports(user: dict, moderation_mode: bool = False, status: str = "all") -> List[Dict]:
        user_id = user["user_id"]
        response, reports = [], []
        if moderation_mode is True:
            moderator = await Moderators.get_moderator(user_id)
            if (user_id in ADMIN_IDS) or (isinstance(moderator, dict)):
                with create_session() as session:
                    status_filter = Reports.id > 0
                    if status == "ended":
                        status_filter = Reports.status.is_not(None)
                    elif status == "consideration":
                        status_filter = Reports.status.is_(None)
                    reports = [
                        report.to_json() for report in
                        session.query(Reports).filter(
                            status_filter
                        ).order_by(desc(Reports.id)).limit(50).all()
                    ]
        else:
            with create_session() as session:
                status_filter = Reports.sender == user_id
                if status == "ended":
                    status_filter = and_(
                        Reports.sender == user_id,
                        Reports.status.is_not(None)
                    )
                elif status == "consideration":
                    status_filter = and_(
                        Reports.sender == user_id,
                        Reports.status.is_(None)
                    )
                reports = [
                    report.to_json() for report in
                    session.query(Reports).filter(
                        status_filter
                    ).order_by(desc(Reports.id)).limit(50).all()
                ]
        for report in reports:
            status = report["status"]
            status = {None: "consideration", True: "approved", False: "declined"}.get(status, "consideration")
            dt_object = datetime.fromtimestamp(report["timestamp"])
            response.append({
                "id": report["id"],
                "sender": user_id if not moderation_mode else report["sender"],
                "receiver": None if not moderation_mode else report["receiver"],
                "status": status,
                "text": "" if not moderation_mode else report["data"].get("text", ""),
                "date": dt_object.strftime("%Y/%m/%d")
            })
        return response

    @staticmethod
    async def moderate_report(user_id: int, row_id: int, result: bool) -> bool:
        if user_id not in ADMIN_IDS:
            moderator = await Moderators.get_moderator(user_id)
            if not isinstance(moderator, dict):
                return False
        with create_session() as session:
            report = session.query(Reports).filter(
                Reports.id == row_id
            ).first()
            if report:
                if report.status is None:
                    report.status = result
                    report.data["moderator"] = user_id
                    flag_modified(report, "data")
        return True


class Transactions(Base):
    __tablename__ = "transactions"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, nullable=False, index=True)
    amount = Column(Float, nullable=True)
    payment_method = Column(String, nullable=False)
    payment_uuid = Column(String, nullable=False, unique=True, index=True)
    status = Column(Boolean, nullable=False, index=True)
    timestamp = Column(Integer, nullable=False)

    def to_json(self) -> Dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    async def pre_create_invoice(user_id: int) -> bool:
        current_timestamp = int(datetime.now().timestamp())
        with create_session() as session:
            previous_invoice = session.query(Transactions).filter(
                Transactions.user_id == user_id
            ).order_by(desc(Transactions.timestamp)).first()
            if previous_invoice:
                if previous_invoice.timestamp > current_timestamp - 30:
                    return False
        return True

    @staticmethod
    async def create_invoice(
            user_id: int,
            payment_method: str,
            payment_uuid: str
    ) -> None:
        current_timestamp = int(datetime.now().timestamp())
        with create_session() as session:
            session.add(Transactions(
                user_id=user_id,
                payment_method=payment_method,
                payment_uuid=payment_uuid,
                status=False,
                timestamp=current_timestamp
            ))

    @staticmethod
    async def confirm_invoice(payment_uuid: str, amount: float) -> None:
        with create_session() as session:
            invoice = session.query(Transactions).filter(
                Transactions.payment_uuid == payment_uuid,
                Transactions.status.is_(False)
            ).first()
            if invoice:
                user_id = invoice.user_id
                invoice.amount = amount
                invoice.status = True
                session.commit()
                await Users.change_balance(user_id, math.floor(amount) * 100, "real", "top_up")


class ByMyself(Base):
    __tablename__ = "battles_bymyself"

    id = Column(BigInteger, primary_key=True)
    data = Column(JSONB, nullable=False, default={})
    status = Column(Boolean, nullable=True, default=True, index=True)
    start_date = Column(Integer, nullable=False, index=True)
    end_date = Column(Integer, nullable=False, index=True)

    def to_json(self) -> Dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    async def get_info(user: dict) -> Dict:
        current_timestamp = int(datetime.now().timestamp())
        with create_session() as session:
            user_data = user["data"]
            battle = session.query(ByMyself).filter(
                ByMyself.data["user_id"].cast(BigInteger) == user["user_id"]
            ).order_by(desc(ByMyself.end_date)).first()
            if battle:
                current_battle = battle.to_json()
            else:
                current_battle = {}
            battle_data = current_battle.get("data", {})
            timezone = battle_data.get("timezone", 0)
            start_timestamp = current_battle.get("start_date", current_timestamp)
            start_date = datetime.fromtimestamp(start_timestamp)
            start_date = start_date + timedelta(hours=timezone)
            end_timestamp = current_battle.get("end_date", current_timestamp)
            end_date = datetime.fromtimestamp(end_timestamp)
            end_date = end_date + timedelta(hours=timezone)
            weeks_count = (end_timestamp - start_timestamp) // (86400 * 7)
            progress_list, money_list, alerts = [], [], []
            weeks_bets = battle_data.get("weeks_bets", {})
            start_result = session.query(Files).filter(
                Files.user_id == user["user_id"],
                Files.file_type == "weight",
                Files.timestamp < start_timestamp
            ).order_by(desc(Files.timestamp)).first()
            if start_result:
                start_weight = start_result.weight
            else:
                start_weight = user_data.get("start_weight", 0)
            for i in range(1, weeks_count + 1):
                i_week = start_timestamp + (86400 * (7 * (i - 1)))
                n_week = start_timestamp + (86400 * 7 * i)
                if n_week > current_timestamp:
                    progress_list.append(None)
                    money_list.append(None)
                else:
                    another_week = weeks_bets.get(str(i), {})
                    needed_weight = another_week.get("needed_weight", 0)
                    week_amount = another_week.get("amount", 0)
                    week_result = session.query(Files).filter(
                        Files.user_id == user["user_id"],
                        Files.file_type == "weight",
                        Files.timestamp > i_week,
                        Files.timestamp < n_week
                    ).order_by(desc(Files.timestamp)).first()
                    if week_result and week_result.weight <= needed_weight:
                        progress_list.append(True)
                        money_list.append(week_amount)
                    else:
                        progress_list.append(False)
                        money_list.append(-week_amount)
            final_weight = battle_data.get("goal", 0)
            reached = 0
            if final_weight > 0:
                goal = round(start_weight - final_weight, 1)
                final_result = session.query(Files).filter(
                    Files.user_id == user["user_id"],
                    Files.file_type == "weight",
                    Files.timestamp < end_timestamp,
                    Files.timestamp > start_timestamp
                ).order_by(desc(Files.timestamp)).first()
                if final_result:
                    reached_weight = final_result.weight
                    if reached_weight <= final_weight:
                        reached = goal
                    else:
                        reached = round(goal - abs(reached_weight - final_weight), 1)
            else:
                goal = 0
            results = [
                row[0] for row in
                session.query(Files.timestamp).filter(
                    Files.user_id == user["user_id"],
                    Files.file_type == "weight",
                    Files.timestamp > start_timestamp,
                    Files.timestamp < end_timestamp
                ).all()
            ]
            if battle and (start_timestamp < current_timestamp):
                motivation_alert = battle_data.get("motivation_alert", start_timestamp)
                charity_selected = battle_data.get("charity_selected", start_timestamp)
                if (current_timestamp - charity_selected > 86400 * 7) and (False in progress_list):
                    alerts.append("charity")
                    battle.data["charity_selected"] = current_timestamp
                elif (current_timestamp - motivation_alert > 86400 * 2) and (current_timestamp < end_timestamp):
                    alerts.append("motivation")
                    battle.data["motivation_alert"] = current_timestamp
                flag_modified(battle, "data")
                session.commit()
            if end_timestamp < current_timestamp:
                if reached < goal:
                    status = "lost"
                else:
                    status = "won"
            elif start_timestamp == end_timestamp:
                status = "new"
            else:
                status = "continue"
            return {
                "amount": current_battle.get("data", {}).get("amount", 0),
                "progress": progress_list,
                "money_progress": money_list,
                "reached": reached,
                "goal": goal,
                "status": status,
                "results": results,
                "needed_results": int(weeks_count * 7),
                "alerts": alerts,
                "start_date": start_date.strftime("%B %d"),
                "end_date": end_date.strftime("%B %d"),
                "start_timestamp": start_timestamp,
                "end_timestamp": end_timestamp
            }

    @staticmethod
    async def create_battle(user: dict, amount: int, period: int, goal: int) -> Any:
        previous_battle = await ByMyself.get_info(user)
        current_timestamp = int(datetime.now().timestamp())
        if isinstance(previous_battle, dict):
            if previous_battle["status"] == "continue":
                return False
        weeks_bets = {}
        parts = [0] * period
        for i in range(amount):
            parts[i % period] += 1
        start_weight = user["data"]["weight"]
        step = (start_weight - goal) / period
        needed_weights = [
            round(x, 1) if x >= goal else goal 
            for x in [start_weight - step * i for i in range(period + 1)][1:]
        ]
        for week in range(1, period + 1):
            weeks_bets[week] = {"needed_weight": needed_weights[week - 1], "amount": parts[week - 1]}
        balance_changed = await Users.change_balance(user["user_id"], amount * -1, "real", "create_battle", True)
        if balance_changed is True:
            with create_session() as session:
                data = {
                    "user_id": user["user_id"],
                    "frozen": amount,
                    "amount": amount,
                    "goal": goal,
                    "timezone": user["data"].get("timezone", 0),
                    "weeks_bets": weeks_bets
                }
                session.add(ByMyself(
                    data=data,
                    start_date=current_timestamp,
                    end_date=current_timestamp + (86400 * 7 * period)
                ))
            return await ByMyself.get_info(user)
        return None


class OneVsFriend(Base):
    __tablename__ = "battles_onevsfriend"

    id = Column(BigInteger, primary_key=True)
    data = Column(JSONB, nullable=False, default={})
    status = Column(Boolean, nullable=True, default=None, index=True)
    participants = Column(JSONB, default=[])
    participants_data = Column(JSONB, nullable=False, default={})
    start_date = Column(Integer, nullable=False, index=True)
    end_date = Column(Integer, nullable=False, index=True)

    def to_json(self) -> Dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    async def get_info(user: dict) -> Dict:
        current_timestamp = int(datetime.now().timestamp())
        participants = []
        with create_session() as session:
            user_data = user["data"]
            battle = session.query(OneVsFriend).filter(
                OneVsFriend.participants.contains(cast([user["user_id"]], JSONB))
            ).order_by(desc(OneVsFriend.end_date)).first()
            if battle:
                current_battle = battle.to_json()
            else:
                current_battle = {}
            participants_data = current_battle.get("participants_data", {})
            p_user_data = participants_data.get(str(user["user_id"]), {})
            timezone = p_user_data.get("timezone", 0)
            start_timestamp = current_battle.get("start_date", current_timestamp)
            start_date = datetime.fromtimestamp(start_timestamp)
            start_date = start_date + timedelta(hours=timezone)
            end_timestamp = current_battle.get("end_date", current_timestamp)
            end_date = datetime.fromtimestamp(end_timestamp)
            end_date = end_date + timedelta(hours=timezone)
            weeks_count = (end_timestamp - start_timestamp) // (86400 * 7)
            progress_list, money_list, alerts = [], [], []
            weeks_bets = p_user_data.get("weeks_bets", {})
            start_result = session.query(Files).filter(
                Files.user_id == user["user_id"],
                Files.file_type == "weight",
                Files.timestamp < start_timestamp
            ).order_by(desc(Files.timestamp)).first()
            if start_result:
                start_weight = start_result.weight
            else:
                start_weight = user_data.get("start_weight", 0)
            for i in range(1, weeks_count + 1):
                i_week = start_timestamp + (86400 * (7 * (i - 1)))
                n_week = start_timestamp + (86400 * 7 * i)
                if n_week > current_timestamp:
                    progress_list.append(None)
                    money_list.append(None)
                else:
                    another_week = weeks_bets.get(str(i), {})
                    needed_weight = another_week.get("needed_weight", 0)
                    week_amount = another_week.get("amount", 0)
                    week_result = session.query(Files).filter(
                        Files.user_id == user["user_id"],
                        Files.file_type == "weight",
                        Files.timestamp > i_week,
                        Files.timestamp < n_week
                    ).order_by(desc(Files.timestamp)).first()
                    if week_result and week_result.weight <= needed_weight:
                        progress_list.append(True)
                        money_list.append(week_amount)
                    else:
                        progress_list.append(False)
                        money_list.append(-week_amount)
            final_weight = p_user_data.get("goal", 0)
            reached = 0
            if final_weight > 0:
                goal = round(start_weight - final_weight, 1)
                final_result = session.query(Files).filter(
                    Files.user_id == user["user_id"],
                    Files.file_type == "weight",
                    Files.timestamp < end_timestamp,
                    Files.timestamp > start_timestamp
                ).order_by(desc(Files.timestamp)).first()
                if final_result:
                    reached_weight = final_result.weight
                    if reached_weight <= final_weight:
                        reached = goal
                    else:
                        reached = round(goal - abs(reached_weight - final_weight), 1)
            else:
                goal = 0
            results = [
                row[0] for row in
                session.query(Files.timestamp).filter(
                    Files.user_id == user["user_id"],
                    Files.file_type == "weight",
                    Files.timestamp > start_timestamp,
                    Files.timestamp < end_timestamp
                ).all()
            ]
            if battle and (start_timestamp < current_timestamp) and p_user_data:
                motivation_alert = p_user_data.get("motivation_alert", start_timestamp)
                charity_selected = p_user_data.get("charity_selected", start_timestamp)
                if (current_timestamp - charity_selected > 86400 * 7) and (False in progress_list):
                    alerts.append("charity")
                    battle.participants_data[str(user["user_id"])]["charity_selected"] = current_timestamp
                elif (current_timestamp - motivation_alert > 86400 * 2) and (current_timestamp < end_timestamp):
                    alerts.append("motivation")
                    battle.participants_data[str(user["user_id"])]["motivation_alert"] = current_timestamp
                flag_modified(battle, "participants_data")
                session.commit()
            for participant, participant_data in participants_data.items():
                if str(participant).isdigit():
                    p_obj = session.query(Users).filter(Users.user_id == int(participant)).first()
                    if p_obj:
                        p_obj = p_obj.to_json()
                        p_udata = p_obj["data"]
                        avatar = p_udata.get("avatar", random.choice(BASIC_AVATARS))
                        name = p_udata.get("name", f"User{random.randint(1, 99999)}")
                        if p_udata.get("banned", 0) > current_timestamp:
                            name = f"User{random.randint(1, 99999)}"
                            avatar = random.choice(BASIC_AVATARS)
                        if avatar.startswith("static"):
                            avatar = f"https://webapp.slim-n-rich.com/api/{avatar}"
                        achievements_count = session.query(Achievements).filter(
                            Achievements.user_id == participant
                        ).count()
                        participants.append({
                            "name": name,
                            "avatar": avatar,
                            "user_id": participant,
                            "achievements_count": achievements_count,
                            "weight_kg": p_udata.get("weight", 0),
                            "its_you": str(participant) == str(user["user_id"])
                        })
            if end_timestamp < current_timestamp:
                if reached < goal:
                    status = "lost"
                else:
                    status = "won"
            elif start_timestamp > current_timestamp:
                status = "waiting"
            elif start_timestamp == end_timestamp:
                status = "new"
            else:
                status = "continue"
            return {
                "amount": current_battle.get("data", {}).get("amount", 0),
                "is_owner": str(user["user_id"]) == str(current_battle.get("data", {}).get("owner", "")),
                "battle_code": current_battle.get("data", {}).get("battle_code", ""),
                "participants": participants,
                "progress": progress_list,
                "money_progress": money_list,
                "reached": reached,
                "goal": goal,
                "status": status,
                "results": results,
                "needed_results": int(weeks_count * 7),
                "alerts": alerts,
                "start_date": start_date.strftime("%B %d"),
                "end_date": end_date.strftime("%B %d"),
                "start_timestamp": start_timestamp,
                "end_timestamp": end_timestamp
            }

    @staticmethod
    async def delete_battle(user: dict) -> None:
        user_id = user["user_id"]
        current_timestamp = int(datetime.now().timestamp())
        with create_session() as session:
            battle = session.query(OneVsFriend).filter(
                and_(
                    OneVsFriend.start_date > current_timestamp,
                    OneVsFriend.participants.contains(cast([user_id], JSONB)),
                    OneVsFriend.status.is_(None)
                )
            ).first()
            if battle:
                battle_data = battle.to_json()
                if len(battle_data["participants"]) <= 1:
                    participants_data = battle_data["participants_data"]
                    user_data = participants_data.get(str(user_id), {})
                    frozen = user_data.get("frozen", 0)
                    session.delete(battle)
                    session.commit()
                    if frozen > 0:
                        balance_changed = await Users.change_balance(user_id, frozen * -1, "frozen", "battle_deleted", False)
                        if balance_changed is True:
                            await Users.change_balance(user_id, frozen, "real", "battle_deleted", False)

    @staticmethod
    async def pre_join_battle(user: dict, battle_code: str) -> Any:
        previous_battle = await OneVsFriend.get_info(user)
        current_timestamp = int(datetime.now().timestamp())
        if isinstance(previous_battle, dict):
            if previous_battle["status"] in ["continue", "waiting"]:
                return False
        with create_session() as session:
            battle = session.query(OneVsFriend).filter(
                and_(
                    OneVsFriend.start_date > current_timestamp,
                    OneVsFriend.status.is_(None),
                    OneVsFriend.data.has_key("battle_code"),
                    OneVsFriend.data["battle_code"].astext == battle_code
                )
            ).first()
            if battle:
                battle_data = battle.to_json()
                if len(battle_data["participants"]) >= 2:
                    return None
            else:
                return None
        timezone = user["data"].get("timezone", 0)
        start_timestamp = battle_data.get("start_date", current_timestamp)
        start_date = datetime.fromtimestamp(start_timestamp)
        start_date = start_date + timedelta(hours=timezone)
        end_timestamp = battle_data.get("end_date", current_timestamp)
        end_date = datetime.fromtimestamp(end_timestamp)
        end_date = end_date + timedelta(hours=timezone)
        participants = []
        for participant, participant_data in battle_data.get("participants_data", {}).items():
            p_obj = session.query(Users).filter(Users.user_id == int(participant)).first()
            if p_obj:
                p_obj = p_obj.to_json()
                p_udata = p_obj["data"]
                avatar = p_udata.get("avatar", random.choice(BASIC_AVATARS))
                name = p_udata.get("name", f"User{random.randint(1, 99999)}")
                if p_udata.get("banned", 0) > current_timestamp:
                    name = f"User{random.randint(1, 99999)}"
                    avatar = random.choice(BASIC_AVATARS)
                if avatar.startswith("static"):
                    avatar = f"https://webapp.slim-n-rich.com/api/{avatar}"
                achievements_count = session.query(Achievements).filter(
                    Achievements.user_id == participant
                ).count()
                participants.append({
                    "name": name,
                    "avatar": avatar,
                    "user_id": participant,
                    "achievements_count": achievements_count,
                    "weight_kg": p_udata.get("weight", 0),
                    "its_you": str(participant) == str(user["user_id"])
                })
        battle_data = battle_data.get("data", {})
        return {
            "is_owner": False,
            "battle_code": battle_code,
            "participants": participants,
            "amount": battle_data.get("amount", 0),
            "period": battle_data.get("period", 0),
            "start_date": start_date.strftime("%B %d"),
            "start_timestamp": start_timestamp,
            "progress": [None for _ in range(2)],
            "money_progress": [None for _ in range(2)],
            "reached": 0,
            "goal": 0,
            "status": "waiting",
            "results": [],
            "needed_results": int(2 * 7),
            "alerts": [],
            "end_date": end_date.strftime("%B %d"),
            "end_timestamp": end_timestamp
        }

    @staticmethod
    async def join_battle(user: dict, battle_code: str) -> Any:
        previous_battle = await OneVsFriend.get_info(user)
        current_timestamp = int(datetime.now().timestamp())
        if isinstance(previous_battle, dict):
            if previous_battle["status"] in ["continue", "waiting"]:
                return False
        with create_session() as session:
            battle = session.query(OneVsFriend).filter(
                and_(
                    OneVsFriend.start_date > current_timestamp,
                    OneVsFriend.status.is_(None),
                    OneVsFriend.data.has_key("battle_code"),
                    OneVsFriend.data["battle_code"].astext == battle_code
                )
            ).first()
            if battle:
                try:
                    battle_data = battle.to_json()
                    if len(battle_data["participants"]) >= 2:
                        return True
                    period = int(battle_data["data"]["period"])
                    weeks_bets = {}
                    parts = [0] * period
                    amount = int(battle_data["data"]["amount"])
                    if amount > 0:
                        balance_changed = await Users.change_balance(
                            user["user_id"],
                            amount * -1,
                            "real",
                            "join_battle",
                            True
                        )
                        if balance_changed is not True:
                            return None
                    for i in range(amount):
                        parts[i % period] += 1
                    start_weight = temp_weight = user["data"]["weight"]
                    max_lost_kg = []
                    for _ in range(11):
                        max_lost_kg.append(round(temp_weight, 1))
                        temp_weight *= 0.99
                    max_lost_kg = max_lost_kg[1:]
                    step = (start_weight - max_lost_kg[period - 1]) / period
                    needed_weights = [round(x, 1) for x in [max_lost_kg[0] - step * i for i in range(period)]]
                    for week in range(1, period + 1):
                        weeks_bets[week] = {"needed_weight": needed_weights[week - 1], "amount": parts[week - 1]}
                    participant_data = {
                        "frozen": amount,
                        "weeks_bets": weeks_bets,
                        "goal": max_lost_kg[period - 1],
                        "timezone": user["data"].get("timezone", 0)
                    }
                    battle = session.query(OneVsFriend).filter(
                        OneVsFriend.id == battle_data["id"]
                    ).first()
                    battle.status = True
                    battle.participants_data[user["user_id"]] = participant_data
                    battle.participants = cast(battle.participants + [user["user_id"]], JSONB)
                    battle.start_date = current_timestamp
                    battle.end_date = current_timestamp + (86400 * 7 * 2)
                    flag_modified(battle, "participants_data")
                    flag_modified(battle, "participants")
                    return await OneVsFriend.get_info(user)
                except (ValueError, TypeError):
                    pass
        return True

    @staticmethod
    async def create_battle(user: dict, amount: int) -> Any:
        period = 2
        previous_battle = await OneVsFriend.get_info(user)
        current_timestamp = int(datetime.now().timestamp())
        if isinstance(previous_battle, dict):
            if previous_battle["status"] in ["continue", "waiting"]:
                return False
        weeks_bets = {}
        parts = [0] * period
        for i in range(amount):
            parts[i % period] += 1
        start_weight = temp_weight = user["data"]["weight"]
        max_lost_kg = []
        for _ in range(11):
            max_lost_kg.append(round(temp_weight, 1))
            temp_weight *= 0.99
        max_lost_kg = max_lost_kg[1:]
        step = (start_weight - max_lost_kg[period - 1]) / period
        needed_weights = [
            round(x, 1) if x >= max_lost_kg[period - 1] else max_lost_kg[period - 1]
            for x in [max_lost_kg[0] - step * i for i in range(period)]
        ]
        for week in range(1, period + 1):
            weeks_bets[week] = {"needed_weight": needed_weights[week - 1], "amount": parts[week - 1]}
        if amount > 0:
            balance_changed = await Users.change_balance(user["user_id"], amount * -1, "real", "create_battle", True)
            if balance_changed is not True:
                return None
        characters = string.ascii_uppercase + string.digits
        battle_code = "".join(random.choice(characters) for _ in range(12))
        with create_session() as session:
            data = {
                "owner": user["user_id"],
                "amount": amount,
                "period": period,
                "money_division": False,
                "battle_code": battle_code
            }
            participant_data = {
                "frozen": amount,
                "weeks_bets": weeks_bets,
                "goal": max_lost_kg[period - 1],
                "timezone": user["data"].get("timezone", 0)
            }
            session.add(OneVsFriend(
                data=data,
                status=None,
                participants=cast([user["user_id"]], JSONB),
                participants_data={user["user_id"]: participant_data},
                start_date=current_timestamp + 86400,
                end_date=current_timestamp + 86400 + (86400 * 7 * period)
            ))
        return await OneVsFriend.get_info(user)


class WithYourGroup(Base):
    __tablename__ = "battles_withowngroup"

    id = Column(BigInteger, primary_key=True)
    data = Column(JSONB, nullable=False, default={})
    status = Column(Boolean, nullable=True, default=None, index=True)
    participants = Column(JSONB, default=[])
    participants_data = Column(JSONB, nullable=False, default={})
    start_date = Column(Integer, nullable=False, index=True)
    end_date = Column(Integer, nullable=False, index=True)

    def to_json(self) -> Dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    async def get_info(user: dict) -> Dict:
        current_timestamp = int(datetime.now().timestamp())
        participants = []
        with create_session() as session:
            user_data = user["data"]
            battle = session.query(WithYourGroup).filter(
                WithYourGroup.participants.contains(cast([user["user_id"]], JSONB))
            ).order_by(desc(WithYourGroup.end_date)).first()
            if battle:
                current_battle = battle.to_json()
            else:
                current_battle = {}
            participants_data = current_battle.get("participants_data", {})
            p_user_data = participants_data.get(str(user["user_id"]), {})
            timezone = p_user_data.get("timezone", 0)
            start_timestamp = current_battle.get("start_date", current_timestamp)
            start_date = datetime.fromtimestamp(start_timestamp)
            start_date = start_date + timedelta(hours=timezone)
            end_timestamp = current_battle.get("end_date", current_timestamp)
            end_date = datetime.fromtimestamp(end_timestamp)
            end_date = end_date + timedelta(hours=timezone)
            weeks_count = (end_timestamp - start_timestamp) // (86400 * 7)
            progress_list, money_list, alerts = [], [], []
            weeks_bets = p_user_data.get("weeks_bets", {})
            start_result = session.query(Files).filter(
                Files.user_id == user["user_id"],
                Files.file_type == "weight",
                Files.timestamp < start_timestamp
            ).order_by(desc(Files.timestamp)).first()
            if start_result:
                start_weight = start_result.weight
            else:
                start_weight = user_data.get("start_weight", 0)
            for i in range(1, weeks_count + 1):
                i_week = start_timestamp + (86400 * (7 * (i - 1)))
                n_week = start_timestamp + (86400 * 7 * i)
                if n_week > current_timestamp:
                    progress_list.append(None)
                    money_list.append(None)
                else:
                    another_week = weeks_bets.get(str(i), {})
                    needed_weight = another_week.get("needed_weight", 0)
                    week_amount = another_week.get("amount", 0)
                    week_result = session.query(Files).filter(
                        Files.user_id == user["user_id"],
                        Files.file_type == "weight",
                        Files.timestamp > i_week,
                        Files.timestamp < n_week
                    ).order_by(desc(Files.timestamp)).first()
                    if week_result and week_result.weight <= needed_weight:
                        progress_list.append(True)
                        money_list.append(week_amount)
                    else:
                        progress_list.append(False)
                        money_list.append(-week_amount)
            final_weight = p_user_data.get("goal", 0)
            reached = 0
            if final_weight > 0:
                goal = round(start_weight - final_weight, 1)
                final_result = session.query(Files).filter(
                    Files.user_id == user["user_id"],
                    Files.file_type == "weight",
                    Files.timestamp < end_timestamp,
                    Files.timestamp > start_timestamp
                ).order_by(desc(Files.timestamp)).first()
                if final_result:
                    reached_weight = final_result.weight
                    if reached_weight <= final_weight:
                        reached = goal
                    else:
                        reached = round(goal - abs(reached_weight - final_weight), 1)
            else:
                goal = 0
            results = [
                row[0] for row in
                session.query(Files.timestamp).filter(
                    Files.user_id == user["user_id"],
                    Files.file_type == "weight",
                    Files.timestamp > start_timestamp,
                    Files.timestamp < end_timestamp
                ).all()
            ]
            if battle and (start_timestamp < current_timestamp) and p_user_data:
                motivation_alert = p_user_data.get("motivation_alert", start_timestamp)
                charity_selected = p_user_data.get("charity_selected", start_timestamp)
                if (current_timestamp - charity_selected > 86400 * 7) and (False in progress_list):
                    alerts.append("charity")
                    battle.participants_data[str(user["user_id"])]["charity_selected"] = current_timestamp
                elif (current_timestamp - motivation_alert > 86400 * 2) and (current_timestamp < end_timestamp):
                    alerts.append("motivation")
                    battle.participants_data[str(user["user_id"])]["motivation_alert"] = current_timestamp
                flag_modified(battle, "participants_data")
                session.commit()
            for participant, participant_data in participants_data.items():
                if str(participant).isdigit():
                    p_obj = session.query(Users).filter(Users.user_id == int(participant)).first()
                    if p_obj:
                        p_obj = p_obj.to_json()
                        p_udata = p_obj["data"]
                        avatar = p_udata.get("avatar", random.choice(BASIC_AVATARS))
                        name = p_udata.get("name", f"User{random.randint(1, 99999)}")
                        if p_udata.get("banned", 0) > current_timestamp:
                            name = f"User{random.randint(1, 99999)}"
                            avatar = random.choice(BASIC_AVATARS)
                        if avatar.startswith("static"):
                            avatar = f"https://webapp.slim-n-rich.com/api/{avatar}"
                        achievements_count = session.query(Achievements).filter(
                            Achievements.user_id == participant
                        ).count()
                        participants.append({
                            "name": name,
                            "avatar": avatar,
                            "user_id": participant,
                            "achievements_count": achievements_count,
                            "weight_kg": p_udata.get("weight", 0),
                            "its_you": str(participant) == str(user["user_id"])
                        })
            if end_timestamp < current_timestamp:
                if reached < goal:
                    status = "lost"
                else:
                    status = "won"
            elif start_timestamp > current_timestamp:
                status = "waiting"
            elif start_timestamp == end_timestamp:
                status = "new"
            else:
                status = "continue"
            return {
                "amount": current_battle.get("data", {}).get("amount", 0),
                "is_owner": str(user["user_id"]) == str(current_battle.get("data", {}).get("owner", "")),
                "battle_code": current_battle.get("data", {}).get("battle_code", ""),
                "is_accepted": True if current_battle.get("data", {}) else False,
                "participants": participants,
                "progress": progress_list,
                "money_progress": money_list,
                "reached": reached,
                "goal": goal,
                "status": status,
                "results": results,
                "needed_results": int(weeks_count * 7),
                "alerts": alerts,
                "start_date": start_date.strftime("%B %d"),
                "end_date": end_date.strftime("%B %d"),
                "start_timestamp": start_timestamp,
                "end_timestamp": end_timestamp
            }

    @staticmethod
    async def pre_join_battle(user: dict, battle_code: str) -> Any:
        previous_battle = await WithYourGroup.get_info(user)
        current_timestamp = int(datetime.now().timestamp())
        if isinstance(previous_battle, dict):
            if previous_battle["status"] in ["continue", "waiting"]:
                return False
        with create_session() as session:
            battle = session.query(WithYourGroup).filter(
                and_(
                    WithYourGroup.start_date > current_timestamp,
                    WithYourGroup.status.is_(None),
                    WithYourGroup.data.has_key("battle_code"),
                    WithYourGroup.data["battle_code"].astext == battle_code
                )
            ).first()
            if battle:
                battle_data = battle.to_json()
                if len(battle_data["participants"]) >= 20:
                    return None
            else:
                return None
        timezone = user["data"].get("timezone", 0)
        start_timestamp = battle_data.get("start_date", current_timestamp)
        start_date = datetime.fromtimestamp(start_timestamp)
        start_date = start_date + timedelta(hours=timezone)
        end_timestamp = battle_data.get("end_date", current_timestamp)
        end_date = datetime.fromtimestamp(end_timestamp)
        end_date = end_date + timedelta(hours=timezone)
        participants = []
        for participant, participant_data in battle_data.get("participants_data", {}).items():
            p_obj = session.query(Users).filter(Users.user_id == int(participant)).first()
            if p_obj:
                p_obj = p_obj.to_json()
                p_udata = p_obj["data"]
                avatar = p_udata.get("avatar", random.choice(BASIC_AVATARS))
                name = p_udata.get("name", f"User{random.randint(1, 99999)}")
                if p_udata.get("banned", 0) > current_timestamp:
                    name = f"User{random.randint(1, 99999)}"
                    avatar = random.choice(BASIC_AVATARS)
                if avatar.startswith("static"):
                    avatar = f"https://webapp.slim-n-rich.com/api/{avatar}"
                achievements_count = session.query(Achievements).filter(
                    Achievements.user_id == participant
                ).count()
                participants.append({
                    "name": name,
                    "avatar": avatar,
                    "user_id": participant,
                    "achievements_count": achievements_count,
                    "weight_kg": p_udata.get("weight", 0),
                    "its_you": str(participant) == str(user["user_id"])
                })
        battle_data = battle_data.get("data", {})
        return {
            "is_owner": False,
            "battle_code": battle_code,
            "participants": participants,
            "amount": battle_data.get("amount", 0),
            "period": battle_data.get("period", 0),
            "start_date": start_date.strftime("%B %d"),
            "start_timestamp": start_timestamp,
            "progress": [None for _ in range(2)],
            "money_progress": [None for _ in range(2)],
            "reached": 0,
            "goal": 0,
            "status": "waiting",
            "is_accepted": False,
            "results": [],
            "needed_results": int(2 * 7),
            "alerts": [],
            "end_date": end_date.strftime("%B %d"),
            "end_timestamp": end_timestamp
        }

    @staticmethod
    async def delete_battle(user: dict) -> None:
        current_timestamp = int(datetime.now().timestamp())
        with create_session() as session:
            battle = session.query(WithYourGroup).filter(
                and_(
                    WithYourGroup.start_date > current_timestamp,
                    WithYourGroup.participants.contains(cast([user["user_id"]], JSONB)),
                    WithYourGroup.status.is_(None)
                )
            ).first()
            if battle:
                battle_data = battle.to_json()
                participants_data = battle_data["participants_data"]
                session.delete(battle)
                session.commit()
                for user_id, user_data in participants_data.items():
                    frozen = user_data.get("frozen", 0)
                    if frozen > 0:
                        if str(user_id).isdigit():
                            balance_changed = await Users.change_balance(int(user_id), frozen * -1, "frozen", "battle_deleted", False)
                            if balance_changed is True:
                                await Users.change_balance(int(user_id), frozen, "real", "battle_deleted", False)

    @staticmethod
    async def start_battle(user: dict) -> Any:
        current_timestamp = int(datetime.now().timestamp())
        with create_session() as session:
            battle = session.query(WithYourGroup).filter(
                and_(
                    WithYourGroup.start_date > current_timestamp,
                    WithYourGroup.participants.contains(cast([user["user_id"]], JSONB)),
                    WithYourGroup.status.is_(None)
                )
            ).first()
            if battle:
                battle_data = battle.to_json()
                if battle_data["data"].get("owner") not in [user["user_id"]]:
                    return False
                elif len(battle_data["participants"]) <= 2:
                    return None
                battle.status = True
                period = battle_data["data"].get("period", 0)
                if period > 0:
                    battle.end_date = current_timestamp + (86400 * 7 * period)
                battle.start_date = current_timestamp
                return True

    @staticmethod
    async def create_battle(user: dict, amount: int) -> Any:
        period = 2
        previous_battle = await WithYourGroup.get_info(user)
        if isinstance(previous_battle, dict):
            if previous_battle["status"] in ["continue", "waiting"]:
                return False
        weeks_bets = {}
        parts = [0] * period
        for i in range(amount):
            parts[i % period] += 1
        start_weight = temp_weight = user["data"]["weight"]
        max_lost_kg = []
        for _ in range(11):
            max_lost_kg.append(round(temp_weight, 1))
            temp_weight *= 0.99
        max_lost_kg = max_lost_kg[1:]
        step = (start_weight - max_lost_kg[period - 1]) / period
        needed_weights = [
            round(x, 1) if x >= max_lost_kg[period - 1] else max_lost_kg[period - 1] 
            for x in [max_lost_kg[0] - step * i for i in range(period)]
        ]
        for week in range(1, period + 1):
            weeks_bets[week] = {"needed_weight": needed_weights[week - 1], "amount": parts[week - 1]}
        if amount > 0:
            balance_changed = await Users.change_balance(user["user_id"], amount * -1, "real", "create_battle", True)
            if balance_changed is not True:
                return None
        characters = string.ascii_uppercase + string.digits
        battle_code = "".join(random.choice(characters) for _ in range(12))
        now = datetime.now()
        days_until_monday = (7 - now.weekday()) % 7
        next_monday = now + timedelta(days=days_until_monday)
        next_monday = next_monday.replace(hour=0, minute=0, second=0, microsecond=0)
        if (next_monday - now).total_seconds() < 86400:
            next_monday += timedelta(days=7)
        start_timestamp = int(next_monday.timestamp())
        with create_session() as session:
            data = {
                "owner": user["user_id"],
                "amount": amount,
                "period": period,
                "money_division": False,
                "battle_code": battle_code
            }
            participant_data = {
                "frozen": amount,
                "weeks_bets": weeks_bets,
                "goal": max_lost_kg[period - 1],
                "timezone": user["data"].get("timezone", 0)
            }
            session.add(WithYourGroup(
                data=data,
                status=None,
                participants=cast([user["user_id"]], JSONB),
                participants_data={user["user_id"]: participant_data},
                start_date=start_timestamp,
                end_date=start_timestamp + (86400 * 7 * period)
            ))
        return await WithYourGroup.get_info(user)

    @staticmethod
    async def join_battle(user: dict, battle_code: str) -> Any:
        previous_battle = await WithYourGroup.get_info(user)
        current_timestamp = int(datetime.now().timestamp())
        if isinstance(previous_battle, dict):
            if previous_battle["status"] in ["continue", "waiting"]:
                return False
        with create_session() as session:
            battle = session.query(WithYourGroup).filter(
                and_(
                    WithYourGroup.start_date > current_timestamp,
                    WithYourGroup.status.is_(None),
                    WithYourGroup.data.has_key("battle_code"),
                    WithYourGroup.data["battle_code"].astext == battle_code
                )
            ).first()
            if battle:
                try:
                    battle_data = battle.to_json()
                    if len(battle_data["participants"]) >= 20:
                        return True
                    period = int(battle_data["data"]["period"])
                    weeks_bets = {}
                    parts = [0] * period
                    amount = int(battle_data["data"]["amount"])
                    if amount > 0:
                        balance_changed = await Users.change_balance(
                            user["user_id"],
                            amount * -1,
                            "real",
                            "join_battle",
                            True
                        )
                        if balance_changed is not True:
                            return None
                    for i in range(amount):
                        parts[i % period] += 1
                    start_weight = temp_weight = user["data"]["weight"]
                    max_lost_kg = []
                    for _ in range(11):
                        max_lost_kg.append(round(temp_weight, 1))
                        temp_weight *= 0.99
                    max_lost_kg = max_lost_kg[1:]
                    step = (start_weight - max_lost_kg[period - 1]) / period
                    needed_weights = [
                        round(x, 1) if x >= max_lost_kg[period - 1] else max_lost_kg[period - 1] 
                        for x in [max_lost_kg[0] - step * i for i in range(period)]
                    ]
                    for week in range(1, period + 1):
                        weeks_bets[week] = {"needed_weight": needed_weights[week - 1], "amount": parts[week - 1]}
                    participant_data = {
                        "frozen": amount,
                        "weeks_bets": weeks_bets,
                        "goal": max_lost_kg[period - 1],
                        "timezone": user["data"].get("timezone", 0)
                    }
                    battle = session.query(WithYourGroup).filter(
                        WithYourGroup.id == battle_data["id"]
                    ).first()
                    if len(battle.participants) >= 19:
                        battle.status = True
                    battle.participants_data[user["user_id"]] = participant_data
                    battle.participants = cast(battle.participants + [user["user_id"]], JSONB)
                    flag_modified(battle, "participants_data")
                    flag_modified(battle, "participants")
                    return await WithYourGroup.get_info(user)
                except (ValueError, TypeError):
                    pass
        return True


class OneVsOne(Base):
    __tablename__ = "battles_onevsrandom"

    id = Column(BigInteger, primary_key=True)
    data = Column(JSONB, nullable=False, default={})
    status = Column(Boolean, default=None, index=True)
    participants = Column(JSONB, default=[])
    participants_data = Column(JSONB, nullable=False, default={})
    start_date = Column(Integer, nullable=False, index=True)
    end_date = Column(Integer, nullable=False, index=True)

    def to_json(self) -> Dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    async def get_info(user: dict) -> Dict:
        current_timestamp = int(datetime.now().timestamp())
        participants = []
        with create_session() as session:
            user_data = user["data"]
            battle = session.query(OneVsOne).filter(
                OneVsOne.participants.contains(cast([user["user_id"]], JSONB))
            ).order_by(desc(OneVsOne.end_date)).first()
            if battle:
                current_battle = battle.to_json()
            else:
                current_battle = {}
            participants_data = current_battle.get("participants_data", {})
            p_user_data = participants_data.get(str(user["user_id"]), {})
            timezone = p_user_data.get("timezone", 0)
            start_timestamp = current_battle.get("start_date", current_timestamp)
            start_date = datetime.fromtimestamp(start_timestamp)
            start_date = start_date + timedelta(hours=timezone)
            end_timestamp = current_battle.get("end_date", current_timestamp)
            end_date = datetime.fromtimestamp(end_timestamp)
            end_date = end_date + timedelta(hours=timezone)
            weeks_count = (end_timestamp - start_timestamp) // (86400 * 7)
            progress_list, money_list, alerts = [], [], []
            weeks_bets = p_user_data.get("weeks_bets", {})
            start_result = session.query(Files).filter(
                Files.user_id == user["user_id"],
                Files.file_type == "weight",
                Files.timestamp < start_timestamp
            ).order_by(desc(Files.timestamp)).first()
            if start_result:
                start_weight = start_result.weight
            else:
                start_weight = user_data.get("start_weight", 0)
            for i in range(1, weeks_count + 1):
                i_week = start_timestamp + (86400 * (7 * (i - 1)))
                n_week = start_timestamp + (86400 * 7 * i)
                if n_week > current_timestamp:
                    progress_list.append(None)
                    money_list.append(None)
                else:
                    another_week = weeks_bets.get(str(i), {})
                    needed_weight = another_week.get("needed_weight", 0)
                    week_amount = another_week.get("amount", 0)
                    week_result = session.query(Files).filter(
                        Files.user_id == user["user_id"],
                        Files.file_type == "weight",
                        Files.timestamp > i_week,
                        Files.timestamp < n_week
                    ).order_by(desc(Files.timestamp)).first()
                    if week_result and week_result.weight <= needed_weight:
                        progress_list.append(True)
                        money_list.append(week_amount)
                    else:
                        progress_list.append(False)
                        money_list.append(-week_amount)
            final_weight = p_user_data.get("goal", 0)
            reached = 0
            if final_weight > 0:
                goal = round(start_weight - final_weight, 1)
                final_result = session.query(Files).filter(
                    Files.user_id == user["user_id"],
                    Files.file_type == "weight",
                    Files.timestamp < end_timestamp,
                    Files.timestamp > start_timestamp
                ).order_by(desc(Files.timestamp)).first()
                if final_result:
                    reached_weight = final_result.weight
                    if reached_weight <= final_weight:
                        reached = goal
                    else:
                        reached = round(goal - abs(reached_weight - final_weight), 1)
            else:
                goal = 0
            results = [
                row[0] for row in
                session.query(Files.timestamp).filter(
                    Files.user_id == user["user_id"],
                    Files.file_type == "weight",
                    Files.timestamp > start_timestamp,
                    Files.timestamp < end_timestamp
                ).all()
            ]
            if battle and (start_timestamp < current_timestamp) and p_user_data:
                motivation_alert = p_user_data.get("motivation_alert", start_timestamp)
                charity_selected = p_user_data.get("charity_selected", start_timestamp)
                if (current_timestamp - charity_selected > 86400 * 7) and (False in progress_list):
                    alerts.append("charity")
                    battle.participants_data[str(user["user_id"])]["charity_selected"] = current_timestamp
                elif (current_timestamp - motivation_alert > 86400 * 2) and (current_timestamp < end_timestamp):
                    alerts.append("motivation")
                    battle.participants_data[str(user["user_id"])]["motivation_alert"] = current_timestamp
                flag_modified(battle, "participants_data")
                session.commit()
            for participant, participant_data in participants_data.items():
                if str(participant).isdigit():
                    p_obj = session.query(Users).filter(Users.user_id == int(participant)).first()
                    if p_obj:
                        p_obj = p_obj.to_json()
                        p_udata = p_obj["data"]
                        avatar = p_udata.get("avatar", random.choice(BASIC_AVATARS))
                        name = p_udata.get("name", f"User{random.randint(1, 99999)}")
                        if p_udata.get("banned", 0) > current_timestamp:
                            name = f"User{random.randint(1, 99999)}"
                            avatar = random.choice(BASIC_AVATARS)
                        if avatar.startswith("static"):
                            avatar = f"https://webapp.slim-n-rich.com/api/{avatar}"
                        achievements_count = session.query(Achievements).filter(
                            Achievements.user_id == participant
                        ).count()
                        participants.append({
                            "name": name,
                            "avatar": avatar,
                            "user_id": participant,
                            "achievements_count": achievements_count,
                            "weight_kg": p_udata.get("weight", 0),
                            "its_you": str(participant) == str(user["user_id"])
                        })
            if end_timestamp < current_timestamp:
                if reached < goal:
                    status = "lost"
                else:
                    status = "won"
            elif start_timestamp > current_timestamp:
                status = "waiting"
            elif start_timestamp == end_timestamp:
                status = "new"
            else:
                status = "continue"
            return {
                "amount": current_battle.get("data", {}).get("amount", 0),
                "is_owner": str(user["user_id"]) == str(current_battle.get("data", {}).get("owner", "")),
                "battle_code": "",
                "participants": participants,
                "progress": progress_list,
                "money_progress": money_list,
                "reached": reached,
                "goal": goal,
                "status": status,
                "results": results,
                "needed_results": int(weeks_count * 7),
                "alerts": alerts,
                "start_date": start_date.strftime("%B %d"),
                "end_date": end_date.strftime("%B %d"),
                "start_timestamp": start_timestamp,
                "end_timestamp": end_timestamp
            }

    @staticmethod
    async def create_battle(user: dict, amount: int) -> Any:
        period = 2
        previous_battle = await OneVsOne.get_info(user)
        if isinstance(previous_battle, dict):
            if previous_battle["status"] in ["continue", "waiting"]:
                return False
        weeks_bets = {}
        parts = [0] * period
        for i in range(amount):
            parts[i % period] += 1
        start_weight = temp_weight = user["data"]["weight"]
        max_lost_kg = []
        for _ in range(11):
            max_lost_kg.append(round(temp_weight, 1))
            temp_weight *= 0.99
        max_lost_kg = max_lost_kg[1:]
        step = (start_weight - max_lost_kg[period - 1]) / period
        needed_weights = [
            round(x, 1) if x >= max_lost_kg[period - 1] else max_lost_kg[period - 1] 
            for x in [max_lost_kg[0] - step * i for i in range(period)]
        ]
        for week in range(1, period + 1):
            weeks_bets[week] = {"needed_weight": needed_weights[week - 1], "amount": parts[week - 1]}
        if amount > 0:
            balance_changed = await Users.change_balance(user["user_id"], amount * -1, "real", "create_battle", True)
            if balance_changed is not True:
                return None
        now = datetime.now()
        days_until_monday = (7 - now.weekday()) % 7
        next_monday = now + timedelta(days=days_until_monday)
        next_monday = next_monday.replace(hour=0, minute=0, second=0, microsecond=0)
        if (next_monday - now).total_seconds() < 86400:
            next_monday += timedelta(days=7)
        start_timestamp = int(next_monday.timestamp())
        current_timestamp = int(now.timestamp())
        with create_session() as session:
            participant_data = {
                "frozen": amount,
                "weeks_bets": weeks_bets,
                "goal": max_lost_kg[period - 1],
                "timezone": user["data"].get("timezone", 0)
            }
            same_battle = session.query(OneVsOne).filter(
                OneVsOne.status.is_(None),
                OneVsOne.start_date > current_timestamp,
                OneVsOne.data.has_key("amount"),
                OneVsOne.data["amount"].cast(Integer) == amount
            ).first()
            if same_battle:
                battle_data = same_battle.to_json()
                if len(battle_data["participants"]) == 1:
                    same_battle.status = True
                    same_battle.participants_data[user["user_id"]] = participant_data
                    same_battle.participants = cast(same_battle.participants + [user["user_id"]], JSONB)
                    same_battle.start_date = current_timestamp
                    same_battle.end_date = current_timestamp + (86400 * 7 * period)
                    flag_modified(same_battle, "participants_data")
                    flag_modified(same_battle, "participants")
                    session.commit()
                    return await OneVsOne.get_info(user)
            data = {
                "owner": user["user_id"],
                "amount": amount,
                "period": period,
                "money_division": False
            }
            session.add(OneVsOne(
                data=data,
                status=None,
                participants=cast([user["user_id"]], JSONB),
                participants_data={user["user_id"]: participant_data},
                start_date=start_timestamp,
                end_date=start_timestamp + (86400 * 7 * period)
            ))
        return await OneVsOne.get_info(user)


class GroupForTime(Base):
    __tablename__ = "battles_groupfortime"

    id = Column(BigInteger, primary_key=True)
    data = Column(JSONB, nullable=False, default={})
    status = Column(Boolean, nullable=True, default=None, index=True)
    participants = Column(JSONB, default=[])
    participants_data = Column(JSONB, nullable=False, default={})
    start_date = Column(Integer, nullable=False, index=True)
    end_date = Column(Integer, nullable=False, index=True)

    def to_json(self) -> Dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    async def get_info(user: dict) -> Dict:
        current_timestamp = int(datetime.now().timestamp())
        participants = []
        with create_session() as session:
            user_data = user["data"]
            battle = session.query(GroupForTime).filter(
                GroupForTime.participants.contains(cast([user["user_id"]], JSONB))
            ).order_by(desc(GroupForTime.end_date)).first()
            if battle:
                current_battle = battle.to_json()
            else:
                current_battle = {}
            participants_data = current_battle.get("participants_data", {})
            p_user_data = participants_data.get(str(user["user_id"]), {})
            timezone = p_user_data.get("timezone", 0)
            start_timestamp = current_battle.get("start_date", current_timestamp)
            start_date = datetime.fromtimestamp(start_timestamp)
            start_date = start_date + timedelta(hours=timezone)
            end_timestamp = current_battle.get("end_date", current_timestamp)
            end_date = datetime.fromtimestamp(end_timestamp)
            end_date = end_date + timedelta(hours=timezone)
            weeks_count = (end_timestamp - start_timestamp) // (86400 * 7)
            progress_list, money_list, alerts = [], [], []
            weeks_bets = p_user_data.get("weeks_bets", {})
            start_result = session.query(Files).filter(
                Files.user_id == user["user_id"],
                Files.file_type == "weight",
                Files.timestamp < start_timestamp
            ).order_by(desc(Files.timestamp)).first()
            if start_result:
                start_weight = start_result.weight
            else:
                start_weight = user_data.get("start_weight", 0)
            for i in range(1, weeks_count + 1):
                i_week = start_timestamp + (86400 * (7 * (i - 1)))
                n_week = start_timestamp + (86400 * 7 * i)
                if n_week > current_timestamp:
                    progress_list.append(None)
                    money_list.append(None)
                else:
                    another_week = weeks_bets.get(str(i), {})
                    needed_weight = another_week.get("needed_weight", 0)
                    week_amount = another_week.get("amount", 0)
                    week_result = session.query(Files).filter(
                        Files.user_id == user["user_id"],
                        Files.file_type == "weight",
                        Files.timestamp > i_week,
                        Files.timestamp < n_week
                    ).order_by(desc(Files.timestamp)).first()
                    if week_result and week_result.weight <= needed_weight:
                        progress_list.append(True)
                        money_list.append(week_amount)
                    else:
                        progress_list.append(False)
                        money_list.append(-week_amount)
            final_weight = p_user_data.get("goal", 0)
            reached = 0
            if final_weight > 0:
                goal = round(start_weight - final_weight, 1)
                final_result = session.query(Files).filter(
                    Files.user_id == user["user_id"],
                    Files.file_type == "weight",
                    Files.timestamp < end_timestamp,
                    Files.timestamp > start_timestamp
                ).order_by(desc(Files.timestamp)).first()
                if final_result:
                    reached_weight = final_result.weight
                    if reached_weight <= final_weight:
                        reached = goal
                    else:
                        reached = round(goal - abs(reached_weight - final_weight), 1)
            else:
                goal = 0
            results = [
                row[0] for row in
                session.query(Files.timestamp).filter(
                    Files.user_id == user["user_id"],
                    Files.file_type == "weight",
                    Files.timestamp > start_timestamp,
                    Files.timestamp < end_timestamp
                ).all()
            ]
            if battle and (start_timestamp < current_timestamp) and p_user_data:
                motivation_alert = p_user_data.get("motivation_alert", start_timestamp)
                charity_selected = p_user_data.get("charity_selected", start_timestamp)
                if (current_timestamp - charity_selected > 86400 * 7) and (False in progress_list):
                    alerts.append("charity")
                    battle.participants_data[str(user["user_id"])]["charity_selected"] = current_timestamp
                elif (current_timestamp - motivation_alert > 86400 * 2) and (current_timestamp < end_timestamp):
                    alerts.append("motivation")
                    battle.participants_data[str(user["user_id"])]["motivation_alert"] = current_timestamp
                flag_modified(battle, "participants_data")
                session.commit()
            for participant, participant_data in participants_data.items():
                if str(participant).isdigit():
                    p_obj = session.query(Users).filter(Users.user_id == int(participant)).first()
                    if p_obj:
                        p_obj = p_obj.to_json()
                        p_udata = p_obj["data"]
                        avatar = p_udata.get("avatar", random.choice(BASIC_AVATARS))
                        name = p_udata.get("name", f"User{random.randint(1, 99999)}")
                        if p_udata.get("banned", 0) > current_timestamp:
                            name = f"User{random.randint(1, 99999)}"
                            avatar = random.choice(BASIC_AVATARS)
                        if avatar.startswith("static"):
                            avatar = f"https://webapp.slim-n-rich.com/api/{avatar}"
                        achievements_count = session.query(Achievements).filter(
                            Achievements.user_id == participant
                        ).count()
                        participants.append({
                            "name": name,
                            "avatar": avatar,
                            "user_id": participant,
                            "achievements_count": achievements_count,
                            "weight_kg": p_udata.get("weight", 0),
                            "its_you": str(participant) == str(user["user_id"])
                        })
            if end_timestamp < current_timestamp:
                if reached < goal:
                    status = "lost"
                else:
                    status = "won"
            elif start_timestamp > current_timestamp:
                status = "waiting"
            elif start_timestamp == end_timestamp:
                status = "new"
            else:
                status = "continue"
            return {
                "amount": current_battle.get("data", {}).get("amount", 0),
                "is_owner": str(user["user_id"]) == str(current_battle.get("data", {}).get("owner", "")),
                "battle_code": "",
                "participants": participants,
                "progress": progress_list,
                "money_progress": money_list,
                "reached": reached,
                "goal": goal,
                "status": status,
                "results": results,
                "needed_results": int(weeks_count * 7),
                "alerts": alerts,
                "start_date": start_date.strftime("%B %d"),
                "end_date": end_date.strftime("%B %d"),
                "start_timestamp": start_timestamp,
                "end_timestamp": end_timestamp
            }

    @staticmethod
    async def create_battle(user: dict, amount: int) -> Any:
        period = 4
        previous_battle = await GroupForTime.get_info(user)
        if isinstance(previous_battle, dict):
            if previous_battle["status"] in ["continue", "waiting"]:
                return False
        weeks_bets = {}
        parts = [0] * period
        for i in range(amount):
            parts[i % period] += 1
        start_weight = temp_weight = user["data"]["weight"]
        max_lost_kg = []
        for _ in range(11):
            max_lost_kg.append(round(temp_weight, 1))
            temp_weight *= 0.99
        max_lost_kg = max_lost_kg[1:]
        step = (start_weight - max_lost_kg[period - 1]) / period
        needed_weights = [
            round(x, 1) if x >= max_lost_kg[period - 1] else max_lost_kg[period - 1] 
            for x in [max_lost_kg[0] - step * i for i in range(period)]
        ]
        for week in range(1, period + 1):
            weeks_bets[week] = {"needed_weight": needed_weights[week - 1], "amount": parts[week - 1]}
        if amount > 0:
            balance_changed = await Users.change_balance(user["user_id"], amount * -1, "real", "create_battle", True)
            if balance_changed is not True:
                return None
        now = datetime.now()
        days_until_monday = (7 - now.weekday()) % 7
        next_monday = now + timedelta(days=days_until_monday)
        next_monday = next_monday.replace(hour=0, minute=0, second=0, microsecond=0)
        if (next_monday - now).total_seconds() < 86400:
            next_monday += timedelta(days=7)
        start_timestamp = int(next_monday.timestamp())
        with create_session() as session:
            participant_data = {
                "frozen": amount,
                "weeks_bets": weeks_bets,
                "goal": max_lost_kg[period - 1],
                "timezone": user["data"].get("timezone", 0)
            }
            same_battle = session.query(GroupForTime).filter(
                GroupForTime.status.is_(None),
                GroupForTime.start_date > int(now.timestamp()),
                GroupForTime.data.has_key("amount"),
                GroupForTime.data["amount"].cast(Integer) == amount
            ).first()
            if same_battle:
                battle_data = same_battle.to_json()
                if len(battle_data["participants"]) < 20:
                    if len(battle_data["participants"]) >= 19:
                        same_battle.status = True
                    same_battle.participants_data[user["user_id"]] = participant_data
                    same_battle.participants = cast(same_battle.participants + [user["user_id"]], JSONB)
                    # same_battle.start_date = int(now.timestamp())
                    # same_battle.end_date = int(now.timestamp()) + (86400 * 7 * period)
                    flag_modified(same_battle, "participants_data")
                    flag_modified(same_battle, "participants")
                    session.commit()
                    return await GroupForTime.get_info(user)
            data = {
                "owner": user["user_id"],
                "amount": amount,
                "period": period,
                "money_division": False
            }
            session.add(GroupForTime(
                data=data,
                status=None,
                participants=cast([user["user_id"]], JSONB),
                participants_data={user["user_id"]: participant_data},
                start_date=start_timestamp,
                end_date=start_timestamp + (86400 * 7 * period)
            ))
        return await GroupForTime.get_info(user)


class GroupByWeight(Base):
    __tablename__ = "battles_groupbyweight"

    id = Column(BigInteger, primary_key=True)
    data = Column(JSONB, nullable=False, default={})
    status = Column(Boolean, nullable=True, default=None, index=True)
    participants = Column(JSONB, default=[])
    participants_data = Column(JSONB, nullable=False, default={})
    start_date = Column(Integer, nullable=False, index=True)
    end_date = Column(Integer, nullable=False, index=True)

    def to_json(self) -> Dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    async def get_info(user: dict) -> Dict:
        current_timestamp = int(datetime.now().timestamp())
        participants = []
        with create_session() as session:
            user_data = user["data"]
            battle = session.query(GroupByWeight).filter(
                GroupByWeight.participants.contains(cast([user["user_id"]], JSONB))
            ).order_by(desc(GroupByWeight.end_date)).first()
            if battle:
                current_battle = battle.to_json()
            else:
                current_battle = {}
            participants_data = current_battle.get("participants_data", {})
            p_user_data = participants_data.get(str(user["user_id"]), {})
            timezone = p_user_data.get("timezone", 0)
            start_timestamp = current_battle.get("start_date", current_timestamp)
            start_date = datetime.fromtimestamp(start_timestamp)
            start_date = start_date + timedelta(hours=timezone)
            end_timestamp = current_battle.get("end_date", current_timestamp)
            end_date = datetime.fromtimestamp(end_timestamp)
            end_date = end_date + timedelta(hours=timezone)
            weeks_count = (end_timestamp - start_timestamp) // (86400 * 7)
            progress_list, money_list, alerts = [], [], []
            weeks_bets = p_user_data.get("weeks_bets", {})
            start_result = session.query(Files).filter(
                Files.user_id == user["user_id"],
                Files.file_type == "weight",
                Files.timestamp < start_timestamp
            ).order_by(desc(Files.timestamp)).first()
            if start_result:
                start_weight = start_result.weight
            else:
                start_weight = user_data.get("start_weight", 0)
            for i in range(1, weeks_count + 1):
                i_week = start_timestamp + (86400 * (7 * (i - 1)))
                n_week = start_timestamp + (86400 * 7 * i)
                if n_week > current_timestamp:
                    progress_list.append(None)
                    money_list.append(None)
                else:
                    another_week = weeks_bets.get(str(i), {})
                    needed_weight = another_week.get("needed_weight", 0)
                    week_amount = another_week.get("amount", 0)
                    week_result = session.query(Files).filter(
                        Files.user_id == user["user_id"],
                        Files.file_type == "weight",
                        Files.timestamp > i_week,
                        Files.timestamp < n_week
                    ).order_by(desc(Files.timestamp)).first()
                    if week_result and week_result.weight <= needed_weight:
                        progress_list.append(True)
                        money_list.append(week_amount)
                    else:
                        progress_list.append(False)
                        money_list.append(-week_amount)
            final_weight = p_user_data.get("goal", 0)
            reached = 0
            if final_weight > 0:
                goal = round(start_weight - final_weight, 1)
                final_result = session.query(Files).filter(
                    Files.user_id == user["user_id"],
                    Files.file_type == "weight",
                    Files.timestamp < end_timestamp,
                    Files.timestamp > start_timestamp
                ).order_by(desc(Files.timestamp)).first()
                if final_result:
                    reached_weight = final_result.weight
                    if reached_weight <= final_weight:
                        reached = goal
                    else:
                        reached = round(goal - abs(reached_weight - final_weight), 1)
            else:
                goal = 0
            results = [
                row[0] for row in
                session.query(Files.timestamp).filter(
                    Files.user_id == user["user_id"],
                    Files.file_type == "weight",
                    Files.timestamp > start_timestamp,
                    Files.timestamp < end_timestamp
                ).all()
            ]
            if battle and (start_timestamp < current_timestamp) and p_user_data:
                motivation_alert = p_user_data.get("motivation_alert", start_timestamp)
                charity_selected = p_user_data.get("charity_selected", start_timestamp)
                if (current_timestamp - charity_selected > 86400 * 7) and (False in progress_list):
                    alerts.append("charity")
                    battle.participants_data[str(user["user_id"])]["charity_selected"] = current_timestamp
                elif (current_timestamp - motivation_alert > 86400 * 2) and (current_timestamp < end_timestamp):
                    alerts.append("motivation")
                    battle.participants_data[str(user["user_id"])]["motivation_alert"] = current_timestamp
                flag_modified(battle, "participants_data")
                session.commit()
            for participant, participant_data in participants_data.items():
                if str(participant).isdigit():
                    p_obj = session.query(Users).filter(Users.user_id == int(participant)).first()
                    if p_obj:
                        p_obj = p_obj.to_json()
                        p_udata = p_obj["data"]
                        avatar = p_udata.get("avatar", random.choice(BASIC_AVATARS))
                        name = p_udata.get("name", f"User{random.randint(1, 99999)}")
                        if p_udata.get("banned", 0) > current_timestamp:
                            name = f"User{random.randint(1, 99999)}"
                            avatar = random.choice(BASIC_AVATARS)
                        if avatar.startswith("static"):
                            avatar = f"https://webapp.slim-n-rich.com/api/{avatar}"
                        achievements_count = session.query(Achievements).filter(
                            Achievements.user_id == participant
                        ).count()
                        participants.append({
                            "name": name,
                            "avatar": avatar,
                            "user_id": participant,
                            "achievements_count": achievements_count,
                            "weight_kg": p_udata.get("weight", 0),
                            "its_you": str(participant) == str(user["user_id"])
                        })
            if end_timestamp < current_timestamp:
                if reached < goal:
                    status = "lost"
                else:
                    status = "won"
            elif start_timestamp > current_timestamp:
                status = "waiting"
            elif start_timestamp == end_timestamp:
                status = "new"
            else:
                status = "continue"
            return {
                "amount": current_battle.get("data", {}).get("amount", 0),
                "is_owner": str(user["user_id"]) == str(current_battle.get("data", {}).get("owner", "")),
                "battle_code": "",
                "participants": participants,
                "progress": progress_list,
                "money_progress": money_list,
                "reached": reached,
                "goal": goal,
                "status": status,
                "results": results,
                "needed_results": int(weeks_count * 7),
                "alerts": alerts,
                "start_date": start_date.strftime("%B %d"),
                "end_date": end_date.strftime("%B %d"),
                "start_timestamp": start_timestamp,
                "end_timestamp": end_timestamp
            }

    @staticmethod
    async def create_battle(user: dict, amount: int, goal_size: Any) -> Any:
        period = 1
        previous_battle = await GroupByWeight.get_info(user)
        if isinstance(previous_battle, dict):
            if previous_battle["status"] in ["continue", "waiting"]:
                return False
        start_weight = user["data"]["weight"]
        goal = start_weight - goal_size
        weeks_bets = {1: {"needed_weight": goal, "amount": amount}}
        if amount > 0:
            balance_changed = await Users.change_balance(user["user_id"], amount * -1, "real", "create_battle", True)
            if balance_changed is not True:
                return None
        now = datetime.now()
        days_until_monday = (7 - now.weekday()) % 7
        next_monday = now + timedelta(days=days_until_monday)
        next_monday = next_monday.replace(hour=0, minute=0, second=0, microsecond=0)
        if (next_monday - now).total_seconds() < 86400:
            next_monday += timedelta(days=7)
        start_timestamp = int(next_monday.timestamp())
        with create_session() as session:
            participant_data = {
                "frozen": amount,
                "weeks_bets": weeks_bets,
                "goal": goal,
                "timezone": user["data"].get("timezone", 0)
            }
            same_battle = session.query(GroupByWeight).filter(
                GroupByWeight.status.is_(None),
                GroupByWeight.start_date > int(now.timestamp()),
                GroupByWeight.data.has_key("amount"),
                GroupByWeight.data["amount"].cast(Integer) == amount,
                GroupByWeight.data.has_key("goal"),
                GroupByWeight.data["goal"].cast(Float) == goal_size
            ).first()
            if same_battle:
                battle_data = same_battle.to_json()
                if len(battle_data["participants"]) < 20:
                    if len(battle_data["participants"]) >= 19:
                        same_battle.status = True
                    same_battle.participants_data[user["user_id"]] = participant_data
                    same_battle.participants = cast(same_battle.participants + [user["user_id"]], JSONB)
                    # same_battle.start_date = int(now.timestamp())
                    # same_battle.end_date = int(now.timestamp()) + (86400 * 7 * period)
                    flag_modified(same_battle, "participants_data")
                    flag_modified(same_battle, "participants")
                    session.commit()
                    return await GroupByWeight.get_info(user)
            data = {
                "owner": user["user_id"],
                "amount": amount,
                "period": period,
                "goal": goal_size,
                "money_division": False
            }
            session.add(GroupByWeight(
                data=data,
                status=None,
                participants=cast([user["user_id"]], JSONB),
                participants_data={user["user_id"]: participant_data},
                start_date=start_timestamp,
                end_date=start_timestamp + (86400 * 7 * period)
            ))
        return await GroupByWeight.get_info(user)


Index('idx_btree_reports_data_status', text("(data->>'status')::boolean"), postgresql_using='btree')
Index('idx_btree_battles_bymyself_data_user_id', text("(data->>'user_id')::bigint"), postgresql_using='btree')
Index('idx_btree_battles_onevsfriend_battle_code', text("(data->>'battle_code')::text"), postgresql_using='btree')
Index('idx_btree_battles_onevsfriend_participants', OneVsFriend.participants, postgresql_using='gin')
Index('idx_btree_battles_withowngroup_battle_code', text("(data->>'battle_code')::text"), postgresql_using='btree')
Index('idx_btree_battles_withowngroup_participants', WithYourGroup.participants, postgresql_using='gin')
Index('idx_btree_battles_onevsrandom_participants', OneVsOne.participants, postgresql_using='gin')
Index('idx_btree_battles_onevsrandom_amount', text("(data->>'amount')::integer"), postgresql_using='btree')
Index('idx_btree_battles_groupfortime_participants', GroupForTime.participants, postgresql_using='gin')
Index('idx_btree_battles_groupfortime_amount', text("(data->>'amount')::integer"), postgresql_using='btree')
Index('idx_btree_battles_groupbyweight_participants', GroupByWeight.participants, postgresql_using='gin')
Index('idx_btree_battles_groupbyweight_amount', text("(data->>'amount')::integer"), postgresql_using='btree')
Index('idx_btree_battles_groupbyweight_goal', text("(data->>'goal')::float"), postgresql_using='btree')

Achievements