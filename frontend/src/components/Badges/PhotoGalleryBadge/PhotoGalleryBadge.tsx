'use client';

import { useMemo } from 'react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { IProfileResultItem } from '@/lib/types/services/user.type';

import { GalleryItem } from './GalleryItem/GalleryItem';

import '../badge.scss';
import './photoGalleryBadge.scss';

export function PhotoGalleryBadge({ gallery, userId }: { gallery: IProfileResultItem[]; userId: number }) {
    const galleryPages = useMemo(() => {
        const pages = [];

        for (let index = 0; index < gallery.length; index += 6) {
            pages.push(gallery.slice(index, index + 6));
        }

        return pages;
    }, [gallery]);
    return (
        <div className="badge photo-gallery-badge">
            <div className="badge__header">
                <p className="badge__title">Photo gallery</p>
            </div>

            <div className="badge__content">
                <div className="photo-gallery-badge__swiper">
                    <Swiper
                        pagination={{
                            el: '.swiper-pagination',
                            clickable: true,
                        }}
                        autoHeight
                        modules={[Pagination]}
                    >
                        {galleryPages.map((page, index) => (
                            <SwiperSlide key={index}>
                                <div className="photo-gallery-badge__wrapper">
                                    {page.map((item) => (
                                        <GalleryItem key={item.date} item={item} userId={userId} />
                                    ))}
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <div className="swiper-pagination"></div>
                </div>
            </div>
        </div>
    );
}
