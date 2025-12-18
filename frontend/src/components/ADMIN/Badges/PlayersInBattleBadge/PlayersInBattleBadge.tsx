import Button from '@/components/UI/Button/Button';
import { UserFrame } from '@/components/UserFrame/UserFrame';

import { ADMIN_PAGE } from '@/lib/constants/admin.routes';
import { IBattleParticipant } from '@/lib/types/services/battles.type';

import { useRouter } from '@/i18n/routing';

import '../admin-badge.scss';
import './playersInBattleBadge.scss';

export function PlayersInBattleBadge({ users }: { users?: IBattleParticipant[] }) {
    const router = useRouter();

    return (
        <div className="admin-badge players-battle-badge">
            <div className="admin-badge__header">
                <p className="admin-badge__title">Players in the battle</p>
            </div>
            <div className="admin-badge__content">
                {users?.map((user) => (
                    <div className="players-battle-badge-item" key={user.user_id}>
                        <div className="players-battle-badge-item__left">
                            <UserFrame
                                src={user.avatar}
                                height={40}
                                width={40}
                                achievementCount={user.achievements_count}
                            />
                            <h3>{user.name}</h3>
                        </div>
                        <div className="players-battle-badge-item__right">
                            <Button variant={'stroke'} onClick={() => router.push(ADMIN_PAGE.USER_ADMIN(user.user_id))}>
                                View profile
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
