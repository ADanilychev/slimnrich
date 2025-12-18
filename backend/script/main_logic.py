import asyncio
import copy
import os

from loguru import logger

from database.objects import *


logger.add(
    "logs/logic_errors.log",
    rotation="7 day",
    compression="zip",
    level="INFO",
    format="{level} - {time} - {message}",
)


async def main() -> None:
    while True:
        await asyncio.sleep(5)
        current_timestamp = int(datetime.now().timestamp())
        with create_session() as session:
            for title in ["bymyself", "onevsfriend", "onevsone", "groupfortime", "withyourgroup", "groupbyweight"]:
                refund_participants_datas, end_participants_datas = [], []
                try:
                    if title == "bymyself":
                        started_battles = session.query(ByMyself).filter(
                            ByMyself.status.is_(None),
                            ByMyself.start_date < current_timestamp
                        ).all()
                        ended_battles = session.query(ByMyself).filter(
                            ByMyself.status.is_(True),
                            ByMyself.end_date < current_timestamp
                        ).limit(1).all()
                    elif title == "onevsfriend":
                        started_battles = session.query(OneVsFriend).filter(
                            OneVsFriend.status.is_(None),
                            OneVsFriend.start_date < current_timestamp
                        ).all()
                        ended_battles = session.query(OneVsFriend).filter(
                            OneVsFriend.status.is_(True),
                            OneVsFriend.end_date < current_timestamp
                        ).limit(1).all()
                    elif title == "onevsone":
                        started_battles = session.query(OneVsOne).filter(
                            OneVsOne.status.is_(None),
                            OneVsOne.start_date < current_timestamp
                        ).all()
                        ended_battles = session.query(OneVsOne).filter(
                            OneVsOne.status.is_(True),
                            OneVsOne.end_date < current_timestamp
                        ).limit(1).all()
                    elif title == "groupfortime":
                        started_battles = session.query(GroupForTime).filter(
                            GroupForTime.status.is_(None),
                            GroupForTime.start_date < current_timestamp
                        ).all()
                        ended_battles = session.query(GroupForTime).filter(
                            GroupForTime.status.is_(True),
                            GroupForTime.end_date < current_timestamp
                        ).limit(1).all()
                    elif title == "withyourgroup":
                        started_battles = session.query(WithYourGroup).filter(
                            WithYourGroup.status.is_(None),
                            WithYourGroup.start_date < current_timestamp
                        ).all()
                        ended_battles = session.query(WithYourGroup).filter(
                            WithYourGroup.status.is_(True),
                            WithYourGroup.end_date < current_timestamp
                        ).limit(1).all()
                    elif title == "groupbyweight":
                        started_battles = session.query(GroupByWeight).filter(
                            GroupByWeight.status.is_(None),
                            GroupByWeight.start_date < current_timestamp
                        ).all()
                        ended_battles = session.query(GroupByWeight).filter(
                            GroupByWeight.status.is_(True),
                            GroupByWeight.end_date < current_timestamp
                        ).limit(1).all()
                    else:
                        continue
                    users_lost = 0
                    for battle in started_battles:
                        if title in ["onevsfriend", "onevsone"]:
                            if len(battle.participants) >= 2:
                                battle.status = True
                                continue
                        elif title == "bymyself":
                            battle.status = True
                            continue
                        else:
                            if len(battle.participants) >= 3:
                                battle.status = True
                                continue
                        participants_data = battle.participants_data
                        refund_participants_datas.append(participants_data)
                        session.delete(battle)
                    session.commit()
                    for battle in ended_battles:
                        battle.status = False
                        if (title == "onevsfriend") and (battle.data.get("amount", 0) <= 0):
                            continue
                        if title == "bymyself":
                            p_data = battle.data
                            if not isinstance(p_data.get("user_id"), int):
                                continue
                            participants_data = {str(p_data["user_id"]): p_data}
                        else:
                            participants_data = battle.participants_data
                        start_timestamp = battle.start_date
                        end_timestamp = battle.end_date
                        weeks_count = (end_timestamp - start_timestamp) // (86400 * 7)
                        for user_id, user_data in participants_data.items():
                            if str(user_id).isdigit():
                                new_participant_data = copy.deepcopy(user_data)
                                user_frozen = frozen_now = new_participant_data.get("frozen", 0)
                                if frozen_now <= 0:
                                    continue
                                new_participant_data["frozen"] = frozen_now
                                lost_slims = won_slims = won_weeks = 0
                                weeks_bets = new_participant_data.get("weeks_bets", {})
                                for i in range(1, weeks_count + 1):
                                    i_week = start_timestamp + (86400 * (7 * (i - 1)))
                                    n_week = start_timestamp + (86400 * 7 * i)
                                    if n_week <= end_timestamp:
                                        another_week = weeks_bets.get(str(i), {})
                                        needed_weight = another_week.get("needed_weight", 0)
                                        week_amount = another_week.get("amount", 0)
                                        week_result = session.query(Files).filter(
                                            Files.user_id == int(user_id),
                                            Files.file_type == "weight",
                                            Files.timestamp > i_week,
                                            Files.timestamp < n_week
                                        ).order_by(desc(Files.timestamp)).first()
                                        user_goal = new_participant_data.get("goal")
                                        if user_goal:
                                            if week_result and week_result.weight < user_goal:
                                                new_participant_data["is_winner"] = True
                                            elif week_result:
                                                new_participant_data["is_winner"] = False
                                        user_frozen -= week_amount
                                        if week_result and week_result.weight <= needed_weight:
                                            won_slims += week_amount
                                            won_weeks += 1
                                        else:
                                            lost_slims += week_amount
                                if user_frozen > 0:
                                    logger.info(f"User {user_id} has unknown {user_frozen}")
                                new_participant_data["lost_slims"] = lost_slims
                                users_lost += lost_slims
                                new_participant_data["won_slims"] = won_slims
                                new_participant_data["total_slims"] = won_slims + lost_slims
                                new_participant_data["won_weeks"] = won_weeks
                                if title == "bymyself":
                                    battle.data["frozen"] = 0
                                else:
                                    battle.participants_data[str(user_id)]["frozen"] = 0
                                end_participants_datas.append({str(user_id): new_participant_data})
                        if title == "bymyself":
                            flag_modified(battle, "data")
                        else:
                            flag_modified(battle, "participants_data")
                        session.commit()
                        break
                    session.commit()
                    winners, for_winners, charity = [], 0, {}
                    for participants_data in end_participants_datas:
                        for user_id_str, user_data in participants_data.items():
                            user_id = int(user_id_str)
                            frozen = user_data.get("frozen", 0)
                            lost_slims = user_data.get("lost_slims", 0)
                            won_slims = user_data.get("won_slims", 0)
                            won_weeks = user_data.get("won_weeks", 0)
                            total_slims = user_data.get("total_slims", 0)
                            is_winner = user_data.get("is_winner", False)
                            if total_slims <= frozen > 0:
                                balance_changed = await Users.change_balance(user_id, frozen * -1, "frozen", "end_battle", False)
                                if balance_changed is True:
                                    await Users.change_balance(user_id, won_slims, "real", "end_battle", False)
                                    alert_data = {
                                        "user_id": None,
                                        "file": None,
                                        "amount": won_slims,
                                        "avatar": None,
                                        "name": title,
                                        "achievements_count": None,
                                        "timestamp": current_timestamp
                                    }
                                    if won_slims > 0:
                                        await UserAlerts.add_alert(user_id, "battle", alert_data)
                                    if is_winner and title != "bymyself":
                                        winners.append(user_id)
                                    inviter = await Referrals.get_inviter(user_id, False)
                                    if isinstance(inviter, dict):
                                        referral_type = "bonus"
                                        referral_amount = int(lost_slims * 0.25)
                                        if inviter["is_blogger"] is True:
                                            blogger = session.query(Bloggers).filter(Bloggers.user_id == inviter["inviter"]).first()
                                            if blogger:
                                                percent = blogger.data.get("percent", 0)
                                                if 50 >= percent > 0:
                                                    referral_type = "real"
                                                    referral_amount = int(lost_slims * (percent * 0.01))
                                        await ReferralsRevenue.add_revenue(user_id, inviter["inviter"], referral_type, referral_amount)
                                        lost_slims -= referral_amount
                                        await Users.change_balance(user_id, referral_amount, referral_type, "referral_revenue", False)
                                    user = session.query(Users).filter(Users.user_id == user_id).first()
                                    charity_direction = "developers"
                                    if user:
                                        current_data = user.data
                                        charity_direction = current_data.get("charity", "developers")
                                        won_weeks_before = current_data.get("won_weeks", 0)
                                        user.data["won_weeks"] = won_weeks_before + won_weeks
                                        streak_timestamp = current_data.get("streak_timestamp", current_timestamp)
                                        streak = current_data.get("streak", 0)
                                        streak_bonus = 0
                                        if (streak_timestamp <= current_timestamp) or (streak + won_weeks > 10):
                                            user.data["streak"] = won_weeks
                                            for i in range(1, won_weeks + 1):
                                                streak_bonus += 1000 * i
                                        else:
                                            user.data["streak"] = streak + won_weeks
                                            for i in range(streak + 1, streak + won_weeks + 1):
                                                streak_bonus += 1000 * i
                                        user.data["streak_timestamp"] = current_timestamp + (86400 * 7)
                                        flag_modified(user, "data")
                                        session.commit()
                                        if streak_bonus > 0:
                                            await Users.change_balance(user_id, streak_bonus, "bonus", "streak_bonus", False)
                                    current_loss = int(lost_slims * 0.5)
                                    for_winners += current_loss
                                    charity.setdefault(charity_direction, 0)
                                    charity[charity_direction] = charity[charity_direction] + (lost_slims - current_loss)
                    if len(winners) > 0 < for_winners:
                        amount_per_winner = for_winners // len(winners)
                        charity.setdefault("developers", 0)
                        charity["developers"] = charity["developers"] + (for_winners % len(winners))
                        for winner in winners:
                            await Users.change_balance(winner, amount_per_winner, "real", "participation_earn", False)
                    elif 0 < for_winners:
                        charity.setdefault("developers", 0)
                        charity["developers"] = charity["developers"] + for_winners
                    for charity_type, charity_amount in charity.items():
                        if charity_amount > 0:
                            await PaymentMethods.working_with_balance(charity_type, charity_amount)
                    await PaymentMethods.working_with_balance("lost", users_lost)
                    for participants_data in refund_participants_datas:
                        for user_id, user_data in participants_data.items():
                            frozen = user_data.get("frozen", 0)
                            if (frozen > 0) and (str(user_id).isdigit()):
                                balance_changed = await Users.change_balance(int(user_id), frozen * -1, "frozen", "battle_deleted", False)
                                if balance_changed is True:
                                    await Users.change_balance(int(user_id), frozen, "real", "battle_deleted", False)
                except Exception as exc:
                    logger.exception(exc)
            await UserAlerts.delete_old_alerts()
            old_files = await Files.remove_old_photos()
            queue = await QueueDeletion.get_files()
            if isinstance(queue, dict):
                old_files.append(queue["filename"])
            for filename in old_files:
                if filename not in BASIC_AVATARS:
                    remove_status = False
                    for attempt in range(3):
                        if not remove_status:
                            try:
                                if os.path.exists(filename):
                                    os.remove(filename)
                                remove_status = True
                            except Exception as _:
                                await asyncio.sleep(2)

if __name__ == "__main__":
    Base.metadata.create_all(engine)
    asyncio.run(main())
