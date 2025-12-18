import { useTranslations } from 'next-intl';

import { UserEntity } from '@/components/Widgets/UserEntity/UserEntity';

import { IBattleParticipant } from '@/lib/types/services/battles.type';

import { PlayerItem } from './PlayerItem/PlayerItem';

import '../badge.scss';
import './playersInBattle.scss';

export function PlayersInBattle({ players }: { players: IBattleParticipant[] }) {
    const t = useTranslations('Badges.PlayersInBattle');
    const meData = players.findLast((p) => p.its_you);

    return (
        <div className="badge players-battle-badge">
            <div className="badge__header ">
                <p className="badge__title">{t('Title')}</p>
            </div>
            <div className="badge__content">
                <div className="players-battle-badge__top">
                    <UserEntity
                        text={t('YourWeight')}
                        weight_kg={meData?.weight_kg || 0}
                        achievementCount={meData?.achievements_count}
                        avatarSrc={meData?.avatar}
                    />

                    <p className="total-count">
                        {t('TotalPlayers')}: <b>{players.length}</b>
                    </p>
                </div>

                <div className="players-battle-badge__list">
                    {players.map((p) => (
                        <PlayerItem player={p} key={p.user_id} />
                    ))}
                </div>
            </div>
        </div>
    );
}
