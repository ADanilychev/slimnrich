import { useTranslations } from 'next-intl';

import Button from '@/components/UI/Button/Button';
import { UserFrame } from '@/components/UserFrame/UserFrame';

import { ROUTES } from '@/lib/constants/Routes';
import { IBattleParticipant } from '@/lib/types/services/battles.type';

import { useTransformNumberSystem } from '@/hooks/useTransformNumberSystem';
import { useRouter } from '@/i18n/routing';

import './playerItem.scss';

export function PlayerItem({ player }: { player: IBattleParticipant }) {
    const router = useRouter();
    const t = useTranslations('Badges.PlayersInBattle');

    const { transformValueWithNumberSystem } = useTransformNumberSystem();

    return (
        <div className={`player-item ${player.its_you ? 'player-item_me' : ''}`}>
            <div className="player-item__left">
                <UserFrame width={24} height={24} achievementCount={player.achievements_count} src={player.avatar} />

                <div className="player-item__wrapper">
                    <p>{transformValueWithNumberSystem(player.weight_kg, 'weight')}</p>

                    <p>{player.name}</p>
                </div>
            </div>

            <div className="player-item__right">
                {!player.its_you && (
                    <Button variant="blue" onClick={() => router.push(ROUTES.USER(player.user_id))}>
                        {t('ViewProfile')}
                    </Button>
                )}
                {player.its_you && <p>{t('ItsYou')}</p>}
            </div>
        </div>
    );
}
