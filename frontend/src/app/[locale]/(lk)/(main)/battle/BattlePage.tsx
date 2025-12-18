'use client';

import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

import BattleItem from '@/components/BattleItem/BattleItem';
import MainLoader from '@/components/MainLoader/MainLoader';

import { ElementHint } from '@/hoc/ElementHint/ElementHint';
import TabTopWrapper from '@/hoc/TabTopWrapper/TabTopWrapper';

import { BattleConfig, BattleType } from '@/lib/configs/Battle.config';
import { IBattlesDataItem } from '@/lib/types/services/battles.type';

import { useGetUserBattles } from '@/hooks/react-queries/useGetUserBattles';
import { useProfile } from '@/hooks/react-queries/useProfile';
import { useAppStore } from '@/store/app.store';

import './battlePage.scss';

let timerId: NodeJS.Timeout;

const BattlePage = () => {
    const t = useTranslations('Pages.BattlePage');
    const tBattleConfig = useTranslations('BattleConfig');

    const { data, isLoading } = useGetUserBattles();
    const { data: profileData, isLoading: isLoadingProfileData } = useProfile();

    const isShowFirstEnterManual = useAppStore((store) => store.isShowFirstEnterManual);
    const unsetShowFirstEnterManual = useAppStore((store) => store.unsetShowFirstEnterManual);

    const [currentBattleHint, setCurrentBattleHint] = useState<BattleType | null>(null);

    const battlesData = data?.battles_data || {};

    const isPremium = profileData?.is_premium || false;

    useEffect(() => {
        if (isShowFirstEnterManual) {
            timerId = setTimeout(() => setCurrentBattleHint(BattleType.BY_MYSELF), 350);
        }

        return () => {
            clearTimeout(timerId);
            if (isShowFirstEnterManual) unsetShowFirstEnterManual();
        };
    }, [isShowFirstEnterManual]);

    if (isLoading || isLoadingProfileData) return <MainLoader />;

    return (
        <div className="battle-page">
            <TabTopWrapper className="battle-page__top">
                <h1>{t('Title')}</h1>
                <p>{t('Subtitle')}</p>
            </TabTopWrapper>
            <div className="main-content">
                <div className="battle-page__list">
                    {Object.entries(battlesData).map(([type, data]) => (
                        <ElementHint
                            key={type}
                            tutorialLink={BattleConfig[type].tutorialLink}
                            isActive={currentBattleHint === type}
                            isLastElement={currentBattleHint === BattleType.GROUP_BY_WEIGHT}
                            closeHandler={() => setCurrentBattleHint(null)}
                            showHintUp={currentBattleHint === BattleType.WITH_YOUR_GROUP}
                            nextHandler={() => {
                                const steps = Object.keys(BattleConfig);
                                const currentStepIndex = steps.indexOf(currentBattleHint as string);

                                if (currentStepIndex === steps.length - 1) setCurrentBattleHint(null);
                                else {
                                    const nextStep = steps[currentStepIndex + 1];
                                    const key =
                                        Object.keys(BattleType)[
                                            Object.values(BattleType).indexOf(nextStep as BattleType)
                                        ];
                                    setCurrentBattleHint(BattleType[key as keyof typeof BattleType]);
                                }
                            }}
                            renderHint={() => (
                                <p className="base-element-hint__modal-text">
                                    {tBattleConfig(currentBattleHint + '.Hint')}
                                </p>
                            )}
                        >
                            <div className="battle-page__item">
                                <BattleItem
                                    isPremium={isPremium}
                                    baseBattle={BattleConfig[type]}
                                    entity={data as IBattlesDataItem}
                                    setCurrentBattleHint={setCurrentBattleHint}
                                />
                            </div>
                        </ElementHint>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BattlePage;
