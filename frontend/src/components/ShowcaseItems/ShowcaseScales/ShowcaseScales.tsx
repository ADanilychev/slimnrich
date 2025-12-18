import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState, useTransition } from 'react';

import Button from '@/components/UI/Button/Button';
import GiftButton from '@/components/UI/GiftButton/GiftButton';

import { useModal } from '@/context/useModalContext';

import { ROUTES } from '@/lib/constants/Routes';
import { PopupTypes } from '@/lib/types/ModalContext.type';
import { IProfileDataProps, IProfileResultItem, SHOWCASE_TAB } from '@/lib/types/services/user.type';

import { useSendGift } from '@/hooks/react-queries/useSendGift';
import { useTransformNumberSystem } from '@/hooks/useTransformNumberSystem';
import { useRouter } from '@/i18n/routing';

import '../showcase.base.scss';
import './showcaseScales.scss';

export function ShowcaseScales({
    entity,
    user_id,
    profileData,
    type = SHOWCASE_TAB.SCALES,
    isMyProfile = false,
}: {
    entity: IProfileResultItem;
    profileData: IProfileDataProps;
    user_id: number;
    type: SHOWCASE_TAB;
    isMyProfile: boolean;
}) {
    const router = useRouter();
    const t = useTranslations('ShowcaseScales');
    const { togglePopup } = useModal();
    const { transformValueWithNumberSystem } = useTransformNumberSystem();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [_, startTransition] = useTransition();

    const { mutate, isPending } = useSendGift();

    return (
        <div
            className="base-showcase"
            onClick={() =>
                togglePopup(true, PopupTypes.UserPhotoGallery, {
                    data: entity,
                    userId: user_id,
                    type,
                    profileData,
                    isMyProfile,
                })
            }
        >
            <div className="base-showcase__image">
                <Image src={entity.photo} objectFit="cover" fill alt="test" />
            </div>
            <div className="base-showcase__info">
                {type === SHOWCASE_TAB.SCALES && <h4>{transformValueWithNumberSystem(entity.weight, 'weight')}</h4>}
                {type === SHOWCASE_TAB.FOOD && <h4 style={{ textTransform: 'capitalize' }}>{entity.title}</h4>}
                {type === SHOWCASE_TAB.LIFESTYLE && <h4>{entity.title}</h4>}

                {type != SHOWCASE_TAB.LIFESTYLE && (
                    <div className="base-showcase__date">
                        {type === SHOWCASE_TAB.FOOD && (
                            <p>
                                {t('Сalory')}: <b>{entity.calories}</b>
                            </p>
                        )}
                        <p>
                            {t('Date')}: <b>{entity.date}</b>
                        </p>
                    </div>
                )}

                <div className="base-showcase__description">
                    <p>{entity.description}</p>
                </div>

                <div className="base-showcase__buttons">
                    {isMyProfile && (
                        <GiftButton
                            style={{ borderWidth: '1px' }}
                            onClick={(event) => {
                                setIsLoading(true);
                                event.stopPropagation();
                                router.push(ROUTES.POST_GIFT(entity.id));
                                startTransition(() => {
                                    togglePopup(false);
                                    setIsLoading(false);
                                });
                            }}
                            loadingSize={15}
                            isLoading={isLoading}
                        >
                            {t('Got')}: {entity.gifts} {t('Slims')}
                        </GiftButton>
                    )}

                    {!isMyProfile && (
                        <GiftButton
                            style={{ borderWidth: '1px' }}
                            onClick={(event) => {
                                event.stopPropagation();
                                mutate(entity.id);
                            }}
                            isLoading={isPending}
                            loadingSize={15}
                        >
                            {t('Gift')}
                        </GiftButton>
                    )}

                    <Button variant={'stroke'} id="more-btn">
                        <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_2128_5750)">
                                <path
                                    d="M12.5 8C12.5 8.69036 13.0596 9.25 13.75 9.25C14.4404 9.25 15 8.69036 15 8C15 7.30964 14.4404 6.75 13.75 6.75C13.0596 6.75 12.5 7.30964 12.5 8Z"
                                    fill="#8000FF"
                                />
                                <path
                                    d="M6.25 8C6.25 8.69036 6.80964 9.25 7.5 9.25C8.19036 9.25 8.75 8.69036 8.75 8C8.75 7.30964 8.19036 6.75 7.5 6.75C6.80964 6.75 6.25 7.30964 6.25 8Z"
                                    fill="#8000FF"
                                />
                                <path
                                    d="M-5.46392e-08 8C-8.48157e-08 8.69036 0.559644 9.25 1.25 9.25C1.94036 9.25 2.5 8.69036 2.5 8C2.5 7.30964 1.94036 6.75 1.25 6.75C0.559644 6.75 -2.44628e-08 7.30964 -5.46392e-08 8Z"
                                    fill="#8000FF"
                                />
                            </g>
                            <defs>
                                <clipPath id="clip0_2128_5750">
                                    <rect
                                        width="15"
                                        height="15"
                                        fill="white"
                                        transform="translate(15 0.5) rotate(90)"
                                    />
                                </clipPath>
                            </defs>
                        </svg>
                    </Button>
                </div>
            </div>
        </div>
    );
}
