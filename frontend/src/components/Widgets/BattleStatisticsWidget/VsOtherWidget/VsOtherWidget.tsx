'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { BattleImage } from '@/components/BattleItem/BattleImage/BattleImage';
import BidDropList from '@/components/BidDropList/BidDropList';
import Button from '@/components/UI/Button/Button';

import { BattleConfig, BattleType } from '@/lib/configs/Battle.config';
import { BATTLE_SLIMS } from '@/lib/configs/CreateBattle.config';
import { ROUTES } from '@/lib/constants/Routes';
import { BattleStatusEnum, INewVsOtherBattleResponse } from '@/lib/types/services/battles.type';

import { UserEntity } from '../../UserEntity/UserEntity';

import { useRouter } from '@/i18n/routing';

import './vsOtherWidget.scss';

const currentConfig = BattleConfig[BattleType.ONE_ON_ONE];

export function VsOtherWidget({ entity }: { entity?: INewVsOtherBattleResponse }) {
    const t = useTranslations('VsOtherWidget');
    const tBattleConfig = useTranslations('BattleConfig.' + BattleType.ONE_ON_ONE);
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

    const meData = useMemo(() => {
        return entity?.participants.findLast((p) => p.its_you);
    }, [entity]);

    const otherData = useMemo(() => {
        return entity?.participants.findLast((p) => !p.its_you);
    }, [entity]);

    return (
        <div className={`battle-widget vs-other-widget battle-status_${currentStatus}`}>
            <div className="vs-other-widget__top">
                <BattleImage battle_type={currentConfig!.type} />
                {currentStatus === BattleStatusEnum.NEW && (
                    <div className="vs-other-widget__info">
                        <h3>{tBattleConfig('Title')}</h3>
                        <p className="info-subtext">{displayDate}</p>
                        <div className="bid">
                            <p className="bid__text">{t('Bid')}: </p>
                            <BidDropList bid={bid} setBid={setBid} />
                        </div>
                    </div>
                )}

                {currentStatus === BattleStatusEnum.CONTINUE && (
                    <div className="vs-other-widget__info">
                        <h3>{tBattleConfig('Title')}</h3>
                        <p className="info-status">{t('Continues')}</p>
                        <p className="info-subtext">{displayDate}</p>
                    </div>
                )}

                {currentStatus === BattleStatusEnum.WAITING && (
                    <div className="vs-other-widget__info">
                        <h3>{tBattleConfig('Title')}</h3>
                        <p className="info-status">{t('Waiting')}</p>
                        <p className="info-subtext">{displayDate}</p>
                    </div>
                )}

                {currentStatus === BattleStatusEnum.LOST && (
                    <div className="vs-other-widget__info">
                        <h3>{tBattleConfig('Title')}</h3>
                        <p className="info-status">{t('Lost')}</p>
                        <p className="info-subtext">{displayDate}</p>
                    </div>
                )}

                {currentStatus === BattleStatusEnum.WON && (
                    <div className="vs-other-widget__info">
                        <h3>{tBattleConfig('Title')}</h3>
                        <p className="info-status">{t('Won')}</p>
                        <p className="info-subtext">{displayDate}</p>
                    </div>
                )}
            </div>

            {currentStatus !== BattleStatusEnum.NEW && (
                <div className="vs-other-widget__bottom">
                    <UserEntity
                        text={t('YourWeight')}
                        weight_kg={meData?.weight_kg || 0}
                        achievementCount={meData?.achievements_count}
                        avatarSrc={meData?.avatar}
                        isUnknown={!!!meData}
                    />
                    <UserEntity
                        direction="row-reverse"
                        text={t('OtherWeight')}
                        avatarSrc={otherData?.avatar}
                        achievementCount={otherData?.achievements_count}
                        weight_kg={otherData?.weight_kg || 0}
                        isUnknown={!!!otherData}
                    />
                </div>
            )}

            <div className="vs-other-widget__controls">
                {currentStatus === BattleStatusEnum.NEW && (
                    <>
                        <Button
                            variant={'orange'}
                            onClick={() =>
                                router.push(currentConfig.accept_link ? currentConfig.accept_link(bid) : '#')
                            }
                        >
                            {t('Accept')}
                        </Button>
                    </>
                )}

                {currentStatus !== BattleStatusEnum.NEW && (
                    <div className="control-row">
                        {(currentStatus === BattleStatusEnum.LOST || currentStatus === BattleStatusEnum.WON) && (
                            <Button
                                variant={'stroke'}
                                onClick={() =>
                                    router.push(currentConfig.accept_link ? currentConfig.accept_link(bid) : '#')
                                }
                            >
                                {t('Again')}
                            </Button>
                        )}

                        {currentStatus !== BattleStatusEnum.WAITING && (
                            <Button variant={'blue'} onClick={() => router.push(ROUTES.USER(otherData?.user_id || 0))}>
                                {t('View')}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
