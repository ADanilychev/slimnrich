import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useState, useTransition } from 'react';

import Button from '@/components/UI/Button/Button';
import GiftButton from '@/components/UI/GiftButton/GiftButton';

import { useModal } from '@/context/useModalContext';

import { ROUTES } from '@/lib/constants/Routes';
import { PopupTypes } from '@/lib/types/ModalContext.type';
import { IProfileDataProps, IProfileResultItem, SHOWCASE_TAB } from '@/lib/types/services/user.type';

import { useSendGift } from '@/hooks/react-queries/useSendGift';
import { useTransformNumberSystem } from '@/hooks/useTransformNumberSystem';
import { useRouter } from '@/i18n/routing';

export default function ViewForm({
    item,
    changeMode,
}: {
    item: {
        data: IProfileResultItem;
        userId: number;
        type: SHOWCASE_TAB;
        profileData: IProfileDataProps;
        isMyProfile: boolean;
    };
    changeMode: (flag: boolean) => void;
}) {
    const t = useTranslations('Modals.PhotoGalleryModal');

    const router = useRouter();
    const { togglePopup } = useModal();

    const { transformValueWithNumberSystem } = useTransformNumberSystem();
    const [_, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { mutate, isPending } = useSendGift();

    return (
        <m.div
            className="view-form"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.5 }}
            transition={{
                duration: 1.5,
            }}
        >
            <div className="photo-gallery-modal__line">
                <div className="line-title">
                    <h3>
                        {item.type === SHOWCASE_TAB.SCALES
                            ? transformValueWithNumberSystem(item.data.weight, 'weight')
                            : item.data.title}
                    </h3>
                </div>
                {item.type === SHOWCASE_TAB.FOOD && (
                    <div className="line-item">
                        <p>{t('Calory')}:</p>
                        <small>{item.data.calories} cl.</small>
                    </div>
                )}
            </div>

            <div className="photo-gallery-modal__description">
                <p>{item.data.description}</p>
            </div>

            {item.isMyProfile && (
                <div className="photo-gallery-modal__edit">
                    <Button variant="stroke" onClick={() => changeMode(true)}>
                        <Image src={'/img/pen.svg'} width={18} height={18} alt="edit" />
                    </Button>
                </div>
            )}

            <div className="photo-gallery-modal__controls">
                {item.isMyProfile && (
                    <GiftButton
                        style={{ height: '60px' }}
                        iconSize={28}
                        onClick={() => {
                            setIsLoading(true);
                            router.push(ROUTES.POST_GIFT(item.data.id));
                            startTransition(() => {
                                togglePopup(false);
                                setIsLoading(false);
                            });
                        }}
                        isLoading={isLoading}
                    >
                        {t.rich('Got', { amount: item.data.gifts })}
                    </GiftButton>
                )}

                {!item.isMyProfile && (
                    <>
                        <GiftButton onClick={() => mutate(item.data.id)} isLoading={isPending}>
                            {t('Gift')}
                        </GiftButton>

                        <Button
                            variant={'stroke-red'}
                            onClick={() => togglePopup(true, PopupTypes.SendUserReport, item.userId)}
                        >
                            {t('Report')}
                        </Button>
                    </>
                )}
            </div>
        </m.div>
    );
}
