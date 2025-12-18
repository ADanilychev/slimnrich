import Image from 'next/image';

import { useModal } from '@/context/useModalContext';

import { PopupTypes } from '@/lib/types/ModalContext.type';
import { IProfileResultItem } from '@/lib/types/services/user.type';

import { useTransformNumberSystem } from '@/hooks/useTransformNumberSystem';

import './galleryItem.scss';

export function GalleryItem({ item, userId }: { item: IProfileResultItem; userId: number }) {
    const { togglePopup } = useModal();
    const { transformValueWithNumberSystem } = useTransformNumberSystem();

    return (
        <div
            className="gallery-item"
            onClick={() => togglePopup(true, PopupTypes.UserPhotoGallery, { data: item, userId })}
        >
            <div className="gallery-item__zoom">
                <Image src={'/img/zoom.svg'} width={14} height={14} quality={100} alt="zoom" />
            </div>
            <div className="gallery-item__top">
                <Image src={item.photo} width={112} height={105} alt="img" />
            </div>
            <div className="gallery-item__bottom">
                <p>{item.date}</p>
                <p>{transformValueWithNumberSystem(item.weight, 'weight')}</p>
            </div>
        </div>
    );
}
