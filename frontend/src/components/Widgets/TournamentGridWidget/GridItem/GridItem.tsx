import { useTranslations } from 'next-intl';

import { UserFrame } from '@/components/UserFrame/UserFrame';

import { IBattleParticipant } from '@/lib/types/services/battles.type';

import AnonymsSVG from '../../../../../public/img/anonumys.svg';

import { useTransformNumberSystem } from '@/hooks/useTransformNumberSystem';

import './gridItem.scss';

export function GridItem({ user }: { user: IBattleParticipant | null }) {
    const t = useTranslations('TournamentGridWidget.GridItem');
    const { transformValueWithNumberSystem, currentNumberSystem } = useTransformNumberSystem();

    return (
        <div className="grid-item">
            {user ? (
                <UserFrame width={23} height={23} src={user.avatar} achievementCount={user.achievements_count} />
            ) : (
                <AnonymsSVG />
            )}

            <p>
                {t('Weight')}:{' '}
                <b>
                    {user ? (
                        transformValueWithNumberSystem(user.weight_kg, 'weight')
                    ) : (
                        <>? {currentNumberSystem.weight}</>
                    )}
                </b>
            </p>
        </div>
    );
}
