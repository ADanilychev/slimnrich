import { useTranslations } from 'next-intl';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import Button from '@/components/UI/Button/Button';

import { useModal } from '@/context/useModalContext';

import { IAchievementItem } from '@/lib/types/services/achievement.type';

import './newAchievement.scss';

export function NewAchievement({ list }: { list: IAchievementItem[] }) {
    const t = useTranslations('Modals.NewAchievement');

    const { togglePopup } = useModal();

    return (
        <div className="modal-dialog new-achievement-modal">
            <div className="new-achievement-modal__top">
                <p>{t('Title')}</p>
            </div>
            <div className="new-achievement-modal__content">
                <Swiper
                    autoHeight={true}
                    pagination={{
                        el: '.swiper-pagination-new-achievement-modal',
                        clickable: true,
                    }}
                    modules={[Pagination]}
                >
                    {list.map((item) => (
                        <SwiperSlide key={item.title}>
                            <div className="new-achievement-modal__slide">
                                <p className="new-achievement-modal__title">{item.title}</p>
                                <Image width={150} height={150} src={item.favicon} quality={90} alt="new" />
                                <small
                                    className="new-achievement-modal__desc"
                                    dangerouslySetInnerHTML={{ __html: item.subtitle }}
                                ></small>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
                <div className="swiper-pagination-new-achievement-modal"></div>
            </div>
            <div className="new-achievement-modal__btns">
                <Button variant="active" onClick={() => togglePopup(false)}>
                    {t('Yay')}
                </Button>
            </div>
        </div>
    );
}
