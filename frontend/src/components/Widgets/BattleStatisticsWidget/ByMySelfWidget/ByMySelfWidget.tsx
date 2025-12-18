'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { BattleImage } from '@/components/BattleItem/BattleImage/BattleImage';
import BidDropList from '@/components/BidDropList/BidDropList';
import Button from '@/components/UI/Button/Button';

import { BattleConfig, BattleType } from '@/lib/configs/Battle.config';
import { BATTLE_SLIMS } from '@/lib/configs/CreateBattle.config';
import { BattleStatusEnum, IBattleInfo } from '@/lib/types/services/battles.type';

import { useRouter } from '@/i18n/routing';

import './byMySelfWidget.scss';

const currentConfig = BattleConfig[BattleType.BY_MYSELF];

export function ByMySelfWidget({ entity }: { entity?: IBattleInfo }) {
    const t = useTranslations('ByMySelfWidget');
    const tBattleConfig = useTranslations('BattleConfig.' + BattleType.BY_MYSELF);
    const tBattleProgress = useTranslations('BattleProgress');

    const router = useRouter();
    const [bid, setBid] = useState<number>(BATTLE_SLIMS[0]);

    const currentStatus = useMemo(() => {
        return entity?.status || BattleStatusEnum.NEW;
    }, [entity]);

    const displayDate = useMemo(() => {
        if (currentStatus === BattleStatusEnum.NEW) return 'Start right away';

        return (
            <>
                {tBattleProgress.rich('StartEndText', {
                    start: entity?.start_date,
                    end: entity?.end_date,
                })}
            </>
        );
    }, [entity, currentStatus]);

    return (
        <div className={`battle-widget my-self-widget battle-status_${currentStatus}`}>
            <div className="my-self-widget__top">
                <BattleImage battle_type={currentConfig!.type} />
                {currentStatus === BattleStatusEnum.NEW && (
                    <div className="my-self-widget__info">
                        <h3>{tBattleConfig('Title')}</h3>
                        <p className="info-subtext">{displayDate}</p>
                        <div className="bid">
                            <p className="bid__text">{t('Bid')}: </p>
                            <BidDropList bid={bid} setBid={setBid} />
                        </div>
                    </div>
                )}

                {currentStatus === BattleStatusEnum.CONTINUE && (
                    <div className="my-self-widget__info">
                        <h3>{tBattleConfig('Title')}</h3>
                        <p className="info-status">{t('Continues')}</p>
                        <p className="info-subtext">{displayDate}</p>
                    </div>
                )}

                {currentStatus === BattleStatusEnum.LOST && (
                    <div className="my-self-widget__info">
                        <h3>{tBattleConfig('Title')}</h3>
                        <p className="info-status">{t('Lost')}</p>
                        <p className="info-subtext">{displayDate}</p>
                    </div>
                )}

                {currentStatus === BattleStatusEnum.WON && (
                    <div className="my-self-widget__info">
                        <h3>{tBattleConfig('Title')}</h3>
                        <p className="info-status">{t('Won')}</p>
                        <p className="info-subtext">{displayDate}</p>
                    </div>
                )}
            </div>
            <div className="my-self-widget__controls">
                {/* <StatisticsBottomControls battle_config={currentConfig} bidCount={bid} /> */}
                {currentStatus === BattleStatusEnum.NEW && (
                    <Button
                        variant={'orange'}
                        onClick={() => router.push(currentConfig.accept_link ? currentConfig.accept_link(bid) : '#')}
                    >
                        {t('Accept')}
                    </Button>
                )}

                {(currentStatus === BattleStatusEnum.LOST || currentStatus === BattleStatusEnum.WON) && (
                    <Button
                        variant={'stroke'}
                        onClick={() => router.push(currentConfig.accept_link ? currentConfig.accept_link(bid) : '#')}
                    >
                        {t('Again')}
                    </Button>
                )}
            </div>
        </div>
    );
}
