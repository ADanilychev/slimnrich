import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { BattleType } from '@/lib/configs/Battle.config';
import { WEIGHT_SYSTEM } from '@/lib/constants/NumberSystem';
import { BattleStatusEnum, IBattlesDataItem } from '@/lib/types/services/battles.type';

import BidDropList from '../../BidDropList/BidDropList';

import { useTransformNumberSystem } from '@/hooks/useTransformNumberSystem';

import './battleProgress.scss';

const BattleProgress = ({
    bid,
    setBid,
    entity,
    battleType,
}: {
    bid: number;
    entity: IBattlesDataItem;
    setBid: (value: number) => void;
    battleType: BattleType;
}) => {
    const t = useTranslations('BattleProgress');
    const tBattleStatistics = useTranslations('BattleStatistics');

    const { transformValueWithNumberSystem, currentNumberSystem, transformToIb } = useTransformNumberSystem();

    const lineBarFillWidth = useMemo(() => {
        if (entity.reached < 0) return 0;
        return (entity.reached * 100) / entity.goal;
    }, [entity]);

    const startEndText = useMemo(() => {
        if (entity.status === BattleStatusEnum.NEW) return t('StartRight');
        return t.rich('StartEndText', {
            start: entity.start_date,
            end: entity.end_date,
        });
    }, [entity]);

    const renderBidDropList = useMemo(() => {
        if (entity.status === BattleStatusEnum.CONTINUE) return <p className="battle-status">{t('Continues')}</p>;
        if (entity.status === BattleStatusEnum.LOST) return <p className="battle-status">{t('Loss')}</p>;
        if (entity.status === BattleStatusEnum.WON) return <p className="battle-status">{t('Complited')}</p>;
        if (entity.status === BattleStatusEnum.WAITING) return <p className="battle-status">{t('Waiting')}</p>;

        return (
            <div className="battle-progress__drop">
                <span>{t('Bid')}:</span>
                <BidDropList
                    bid={bid}
                    setBid={setBid}
                    withZeroValue={battleType === BattleType.ONE_ON_ONE_WITH_FRIENDS}
                />
            </div>
        );
    }, [entity, bid, setBid, battleType]);

    const displayReachValue = useMemo(() => {
        if (currentNumberSystem.weight === WEIGHT_SYSTEM.IB) return transformToIb(entity.reached);
        else return entity.reached;
    }, [entity, currentNumberSystem]);

    const isShowUserCount = useMemo(() => {
        return entity.status === BattleStatusEnum.WAITING && battleType === BattleType.GROUP_FOR_TIME;
    }, [entity]);

    return (
        <div className="battle-progress">
            <div className="battle-progress__top">
                {(entity.status === BattleStatusEnum.CONTINUE ||
                    entity.status === BattleStatusEnum.WON ||
                    entity.status === BattleStatusEnum.LOST) && (
                    <p className="battle-progress__text-progress">
                        <span>{displayReachValue}</span> {tBattleStatistics('OutOf')}{' '}
                        {transformValueWithNumberSystem(entity.goal, 'weight')}
                    </p>
                )}

                {renderBidDropList}
            </div>

            <div className="battle-progress__bar">
                <div>
                    <span
                        style={{
                            width: lineBarFillWidth + '%',
                        }}
                    />
                </div>
            </div>

            <div className="battle-progress__bottom">
                <p className="battle-progress__hint">{startEndText}</p>

                {isShowUserCount && (
                    <div className="battle-progress__users-count">
                        <b>{entity.participants}</b>/20
                    </div>
                )}
            </div>
        </div>
    );
};

export default BattleProgress;
