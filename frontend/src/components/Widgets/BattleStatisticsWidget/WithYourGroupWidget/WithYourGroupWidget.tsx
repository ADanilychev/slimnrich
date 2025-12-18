'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useMemo, useState } from 'react';

import { BattleImage } from '@/components/BattleItem/BattleImage/BattleImage';
import BidDropList from '@/components/BidDropList/BidDropList';
import Button from '@/components/UI/Button/Button';

import { BattleConfig, BattleType } from '@/lib/configs/Battle.config';
import { BATTLE_SLIMS } from '@/lib/configs/CreateBattle.config';
import { BattleStatusEnum, IBattleInfo } from '@/lib/types/services/battles.type';

import { useRouter } from '@/i18n/routing';

import './withYourGroupWidget.scss';

const currentConfig = BattleConfig[BattleType.WITH_YOUR_GROUP];

export function WithYourGroupWidget({ entity }: { entity?: IBattleInfo }) {
    const t = useTranslations('WithYourGroupWidget');
    const tBattleConfig = useTranslations('BattleConfig.' + BattleType.WITH_YOUR_GROUP);
    const tBattleProgress = useTranslations('BattleProgress');

    const router = useRouter();
    const [bid, setBid] = useState<number>(BATTLE_SLIMS[0]);

    const currentStatus = useMemo(() => {
        return entity?.status || BattleStatusEnum.NEW; //entity?.status ||
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
        <div className={`battle-widget with-your-group-widget battle-status_${currentStatus}`}>
            <div className="with-your-group-widget__top">
                <BattleImage battle_type={currentConfig!.type} />
                {currentStatus === BattleStatusEnum.NEW && (
                    <div className="with-your-group-widget__info">
                        <h3>
                            {tBattleConfig('Title')}{' '}
                            <Image width={20} height={20} src={'/img/currency/premium.svg'} alt="premium-icon" />
                        </h3>
                        <p className="info-subtext">{displayDate}</p>
                        <div className="bid">
                            <p className="bid__text">{t('Bid')}: </p>
                            <BidDropList bid={bid} setBid={setBid} />
                        </div>
                    </div>
                )}

                {currentStatus === BattleStatusEnum.CONTINUE && (
                    <div className="with-your-group-widget__info">
                        <h3>
                            {tBattleConfig('Title')}
                            <Image width={20} height={20} src={'/img/currency/premium.svg'} alt="premium-icon" />
                        </h3>
                        <p className="info-status">{t('Continues')}</p>
                        <p className="info-subtext">{displayDate}</p>
                    </div>
                )}

                {currentStatus === BattleStatusEnum.WAITING && (
                    <div className="with-your-group-widget__info">
                        <h3>{tBattleConfig('Title')}</h3>
                        <p className="info-status">{t('Waiting')}</p>
                        <p className="info-subtext">{displayDate}</p>
                    </div>
                )}

                {currentStatus === BattleStatusEnum.LOST && (
                    <div className="with-your-group-widget__info">
                        <h3>
                            {tBattleConfig('Title')}
                            <Image width={20} height={20} src={'/img/currency/premium.svg'} alt="premium-icon" />
                        </h3>
                        <p className="info-status">{t('Lost')}</p>
                        <p className="info-subtext">{displayDate}</p>
                    </div>
                )}

                {currentStatus === BattleStatusEnum.WON && (
                    <div className="with-your-group-widget__info">
                        <h3>
                            {tBattleConfig('Title')}{' '}
                            <Image width={20} height={20} src={'/img/currency/premium.svg'} alt="premium-icon" />
                        </h3>
                        <p className="info-status">{t('Won')}</p>
                        <p className="info-subtext">{displayDate}</p>
                    </div>
                )}
            </div>
            <div className="with-your-group-widget__controls">
                {(currentStatus === BattleStatusEnum.LOST ||
                    currentStatus === BattleStatusEnum.WON ||
                    currentStatus === BattleStatusEnum.NEW) && (
                    <>
                        <Button
                            variant={'orange'}
                            onClick={() =>
                                router.push(currentConfig.create_link ? currentConfig.create_link(bid) : '#')
                            }
                        >
                            {t('Create')}
                        </Button>
                        <Button
                            variant={'green'}
                            onClick={() => router.push(currentConfig.join_link ? currentConfig.join_link() : '#')}
                        >
                            {t('Join')}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
