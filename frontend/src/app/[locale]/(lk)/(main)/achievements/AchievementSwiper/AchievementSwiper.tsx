import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import AchievementItem from '@/components/AchievementItem/AchievementItem';

import { IAchievementData } from '@/lib/types/services/achievement.type';

import './achievementSwiper.scss';

const AchievementSwiper = ({ achievements }: { achievements: IAchievementData }) => {
    return (
        <div className="achievement-swiper">
            <Swiper
                autoHeight={true}
                pagination={{
                    el: '.swiper-pagination',
                    clickable: true,
                }}
                modules={[Pagination]}
            >
                {achievements.pages.map((page, index) => (
                    <SwiperSlide key={index}>
                        <div className="achievement-swiper__wrapper">
                            {page.has.map((item) => (
                                <AchievementItem key={item.title} data={item} isReceived={true} />
                            ))}
                            {page.available.map((item) => (
                                <AchievementItem key={item.title} data={item} />
                            ))}
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
            <div className="swiper-pagination"></div>
        </div>
    );
};

export default AchievementSwiper;
