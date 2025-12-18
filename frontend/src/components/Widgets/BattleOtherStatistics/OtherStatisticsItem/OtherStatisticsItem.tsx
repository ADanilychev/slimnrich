import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { BattleImage } from '@/components/BattleItem/BattleImage/BattleImage';

import { ROUTES } from '@/lib/constants/Routes';
import { IBaseBattle } from '@/lib/types/Battle.type';
import { IBattlesDataItem } from '@/lib/types/services/battles.type';

import { Progress } from '../../Progress/Progress';

import { Link } from '@/i18n/routing';

import './otherStatisticsItem.scss';

export function OtherStatisticsItem({ battle, entity }: { battle: IBaseBattle; entity: IBattlesDataItem }) {
    const tBattleConfig = useTranslations('BattleConfig.' + battle.type);

    return (
        <Link className="other-statistics-item" href={ROUTES.BATTLE_STATISTICS(battle.type)}>
            <div className="other-statistics-item__image">
                {battle.isPrem && (
                    <Image
                        width={15}
                        height={15}
                        src={'/img/currency/premium.svg'}
                        className="prem-battle"
                        alt="premium-icon"
                    />
                )}

                <BattleImage battle_type={battle.type} size={50} border_width={6} />
            </div>
            <div className="other-statistics-item__name">
                <p>{tBattleConfig('Title')}</p>
            </div>
            <div className="other-statistics-item__progress">
                <Progress goal={entity.goal} reached={entity.reached} />
            </div>
        </Link>
    );
}
