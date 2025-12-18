'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { FC, useCallback, useMemo, useState } from 'react';

import { useModal } from '@/context/useModalContext';

import { BattleType } from '@/lib/configs/Battle.config';
import { BATTLE_SLIMS, ZERO_BATTLE_SLIMS } from '@/lib/configs/CreateBattle.config';
import { BATTLE_PAGE, ROUTES } from '@/lib/constants/Routes';
import cn from '@/lib/import/classnames';
import { IBaseBattle } from '@/lib/types/Battle.type';
import { PopupTypes } from '@/lib/types/ModalContext.type';
import { TButtonVariant } from '@/lib/types/button.type';
import { BattleStatusEnum, IBattlesDataItem } from '@/lib/types/services/battles.type';

import Button from '../UI/Button/Button';

import { BattleImage } from './BattleImage/BattleImage';
import BattleProgress from './BattleProgress/BattleProgress';
import { useRouter } from '@/i18n/routing';

import './battleItem.scss';

interface IBattleItem {
    baseBattle: IBaseBattle;
    entity: IBattlesDataItem;
    isPremium: boolean;
    setCurrentBattleHint: (type: BattleType) => void;
}

const BattleItem: FC<IBattleItem> = ({ baseBattle, entity, isPremium, setCurrentBattleHint }) => {
    const t = useTranslations('BattleItem');
    const tBattleConfig = useTranslations('BattleConfig.' + baseBattle.type);

    const router = useRouter();
    const { togglePopup } = useModal();

    // entity.status = BattleStatusEnum.WAITING;

    const defaultBidValue = useMemo(() => {
        return baseBattle.type === BattleType.ONE_ON_ONE_WITH_FRIENDS ? ZERO_BATTLE_SLIMS[0] : BATTLE_SLIMS[0];
    }, [baseBattle]);

    const [bid, setBid] = useState<number>(defaultBidValue);

    const premiumChecker = useCallback(() => {
        if (!isPremium && baseBattle.isPrem) {
            togglePopup(true, PopupTypes.NotUserPremium, '');
            return false;
        }

        return true;
    }, [isPremium, baseBattle]);

    const acceptButtonHandler = () => {
        if (!premiumChecker()) return;

        router.push(baseBattle.accept_link ? baseBattle.accept_link(bid) : '#');
    };

    const viewStatisticHandler = () => {
        router.push(ROUTES.BATTLE_STATISTICS(baseBattle.type));
    };

    const joinBattleHandler = () => {
        router.push(BATTLE_PAGE.JOIN_IN_BATTLE(baseBattle.type));
    };

    const mainButton = useMemo(() => {
        let clickHandler;
        let text;
        let variant: TButtonVariant;

        switch (entity.status) {
            case BattleStatusEnum.NEW:
                clickHandler = acceptButtonHandler;
                text = t('MainButton.Active');
                variant = 'active';
                break;
            case BattleStatusEnum.CONTINUE:
                clickHandler = viewStatisticHandler;
                text = t('MainButton.ViewStatistic');
                variant = 'active';
                break;
            case BattleStatusEnum.LOST:
                clickHandler = viewStatisticHandler;
                text = t('MainButton.Lost');
                variant = 'red';
                break;
            case BattleStatusEnum.WON:
                clickHandler = viewStatisticHandler;
                text = t('MainButton.Win');
                variant = 'green';
                break;
            default:
                clickHandler = acceptButtonHandler;
                variant = 'active';
        }

        return (
            <Button variant={variant} onClick={clickHandler}>
                {text}
            </Button>
        );
    }, [entity, acceptButtonHandler, viewStatisticHandler]);

    return (
        <div className={cn(`battle-item battle-item_${entity.status}`)}>
            <div className="battle-item__top">
                <BattleImage battle_type={baseBattle.type} />

                <div className="battle-item__info">
                    <div className="battle-item__header">
                        <span>
                            <h4>{tBattleConfig('Title')}</h4>
                            {baseBattle.isPrem && (
                                <Image src={'/img/currency/premium.svg'} width={16} height={16} alt="premium" />
                            )}
                        </span>

                        {!baseBattle.isPrem && baseBattle.type !== BattleType.BY_MYSELF && (
                            <Image
                                src={'/img/battle/free.svg'}
                                className="free-icon"
                                width={60}
                                height={20}
                                quality={100}
                                alt="free"
                            />
                        )}
                        <div className="battle-item__header-q" onClick={() => setCurrentBattleHint(baseBattle.type)}>
                            ?
                        </div>
                    </div>
                    <BattleProgress bid={bid} setBid={setBid} entity={entity} battleType={baseBattle.type} />
                </div>
            </div>
            <div className="battle-item__controls">
                {baseBattle.actionBattleButtons ? (
                    <>
                        {entity.status === BattleStatusEnum.NEW && (
                            <>
                                <Button
                                    variant={'active'}
                                    onClick={() =>
                                        router.push(baseBattle.create_link ? baseBattle.create_link(bid) : '#')
                                    }
                                >
                                    {t('Create')}
                                </Button>
                                <Button
                                    variant={'green'}
                                    onClick={() => router.push(baseBattle.join_link ? baseBattle.join_link() : '#')}
                                >
                                    {t('Join')}
                                </Button>
                            </>
                        )}

                        {entity.status === BattleStatusEnum.WAITING && (
                            <Button variant={'blue'} onClick={joinBattleHandler}>
                                {t('Enter')}
                            </Button>
                        )}

                        {entity.status !== BattleStatusEnum.WAITING && entity.status !== BattleStatusEnum.NEW && (
                            <>{mainButton}</>
                        )}
                    </>
                ) : (
                    <>
                        {!baseBattle.actionBattleButtons && entity.status === BattleStatusEnum.WAITING ? (
                            <Button variant={'disabled-variant'} onClick={viewStatisticHandler}>
                                {baseBattle.type === BattleType.GROUP_FOR_TIME ||
                                baseBattle.type === BattleType.GROUP_BY_WEIGHT
                                    ? t('Waiting')
                                    : t('Enter')}
                            </Button>
                        ) : (
                            <>{mainButton}</>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default BattleItem;
