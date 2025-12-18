import { AnimatePresence, m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { ShowcaseScales } from '@/components/ShowcaseItems/ShowcaseScales/ShowcaseScales';
import Button from '@/components/UI/Button/Button';
import TabMenu from '@/components/UI/TabMenu/TabMenu';

import { IProfileDataProps, IProfileResult, IProfileResultItem, SHOWCASE_TAB } from '@/lib/types/services/user.type';

import './photoShowcase.scss';

const PAGE_SIZE = 2;

export function PhotoShowcase({
    showcase,
    user_id,
    profileData,
    isMyProfile = false,
}: {
    showcase: IProfileResult | null;
    user_id: number;
    profileData: IProfileDataProps;
    isMyProfile: boolean;
}) {
    const t = useTranslations('Badges.PhotoShowcase');
    const [currentTab, setCurrentTab] = useState(SHOWCASE_TAB.SCALES);
    const [currentPage, setCurrentPage] = useState({
        [SHOWCASE_TAB.SCALES]: 1,
        [SHOWCASE_TAB.FOOD]: 1,
        [SHOWCASE_TAB.LIFESTYLE]: 1,
    });

    const getCurrentTabData = () => {
        let data: IProfileResultItem[] | [] = [];

        switch (currentTab) {
            case SHOWCASE_TAB.SCALES:
                data = showcase?.weight || [];
                break;
            case SHOWCASE_TAB.FOOD:
                data = showcase?.food || [];
                break;
            case SHOWCASE_TAB.LIFESTYLE:
                data = showcase?.life || [];
                break;
        }

        return data;
    };

    const paginationData = useMemo(() => {
        let data = getCurrentTabData();

        return data?.slice(0, currentPage[currentTab] * PAGE_SIZE);
    }, [showcase, currentPage, currentTab]);

    const loadMore = () => {
        setCurrentPage((prev) => {
            return { ...prev, [currentTab]: prev[currentTab] + 1 };
        });
    };

    const isShowLoadMore = useMemo(() => {
        return paginationData.length < getCurrentTabData().length;
    }, [paginationData]);

    return (
        <div className="badge photo-showcase-badge">
            <div className="badge__header">
                <TabMenu
                    className="notification-page__tabs"
                    activeLink={currentTab}
                    links={[
                        {
                            text: t('Tabs.Scales'),
                            link: () => setCurrentTab(SHOWCASE_TAB.SCALES),
                            slug: SHOWCASE_TAB.SCALES,
                        },
                        {
                            text: t('Tabs.Food'),
                            link: () => setCurrentTab(SHOWCASE_TAB.FOOD),
                            slug: SHOWCASE_TAB.FOOD,
                        },
                        {
                            text: t('Tabs.Lifestyle'),
                            link: () => setCurrentTab(SHOWCASE_TAB.LIFESTYLE),
                            slug: SHOWCASE_TAB.LIFESTYLE,
                        },
                    ]}
                />
            </div>
            <AnimatePresence key={currentTab}>
                <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                        duration: 1.5,
                    }}
                    className="badge__content"
                >
                    {paginationData.map((item) => (
                        <ShowcaseScales
                            isMyProfile={isMyProfile}
                            key={item.id}
                            entity={item}
                            type={currentTab}
                            user_id={user_id}
                            profileData={profileData}
                        />
                    ))}

                    {isShowLoadMore && (
                        <Button variant={'active'} onClick={loadMore}>
                            {t('LoadMore')}
                        </Button>
                    )}
                </m.div>
            </AnimatePresence>
        </div>
    );
}
