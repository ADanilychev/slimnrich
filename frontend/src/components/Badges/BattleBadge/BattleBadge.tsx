'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import BattleItem from '@/components/BattleItem/BattleItem';

import { BattleConfig } from '@/lib/configs/Battle.config';
import { ROUTES } from '@/lib/constants/Routes';
import { IBattlesDataItem } from '@/lib/types/services/battles.type';

import { useGetUserBattles } from '@/hooks/react-queries/useGetUserBattles';
import { useProfile } from '@/hooks/react-queries/useProfile';
import { Link } from '@/i18n/routing';

import '../badge.scss';
import './battleBadge.scss';

const BattleBadge = () => {
    const t = useTranslations('Badges.BattleBadge');
    const { data, isLoading } = useGetUserBattles();
    const { data: profileData, isLoading: isLoadingProfileData } = useProfile();

    const battlesData = useMemo(() => {
        return data?.battles_data || {};
    }, [data]);

    const isPremium = useMemo(() => {
        return profileData?.is_premium || false;
    }, [profileData]);

    if (isLoading) return <Skeleton height={270} />;

    return (
        <div className="badge battle-badge">
            <div className="badge__header">
                <p className="badge__title">{t('Title')}</p>
                <Link href={ROUTES.BATTLE}>{t('TitleLink')}</Link>
            </div>
            <div className="badge__content">
                <Swiper
                    pagination={{
                        el: '.swiper-pagination',
                        clickable: true,
                    }}
                    modules={[Pagination]}
                >
                    {Object.entries(battlesData).map(([type, data]) => (
                        <SwiperSlide key={type}>
                            <BattleItem
                                setCurrentBattleHint={() => {}}
                                isPremium={isPremium}
                                baseBattle={BattleConfig[type as keyof typeof BattleConfig]}
                                entity={data as IBattlesDataItem}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
                <div className="swiper-pagination"></div>
            </div>
        </div>
    );
};

export default BattleBadge;
