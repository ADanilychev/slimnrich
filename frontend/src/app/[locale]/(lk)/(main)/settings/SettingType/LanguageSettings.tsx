import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import Button from '@/components/UI/Button/Button';
import RadioButton from '@/components/UI/RadioButton/RadioButton';

import { ROUTES } from '@/lib/constants/Routes';
import { IBasicUserData } from '@/lib/types/services/user.type';

import { useChangeSettings } from '@/hooks/react-queries/useChangeSettings';
import { useProfile } from '@/hooks/react-queries/useProfile';
import { usePathname, useRouter } from '@/i18n/routing';
import { useAppStore } from '@/store/app.store';

const LanguageSettings = () => {
    const t = useTranslations('Settings');

    const pathname = usePathname();
    const searchParams = useSearchParams();

    const language = useAppStore((store) => store.language);
    const setLanguage = useAppStore((store) => store.setLanguage);

    const router = useRouter();
    const queryClient = useQueryClient();

    const [currentLocation, setCurrentLocation] = useState(language);

    const { data, isLoading } = useProfile();
    const { mutateAsync, isPending } = useChangeSettings();

    const changeLanguage = (value: 'en' | 'es' | 'ru') => {
        setCurrentLocation(value);
    };

    const acceptHandler = () => {
        mutateAsync(
            {
                language: currentLocation,
            },
            {
                onSuccess() {
                    setLanguage(currentLocation);
                    queryClient.setQueryData(['get-user-basic-data'], (oldData: IBasicUserData) => {
                        return {
                            ...oldData,
                            language: currentLocation,
                        };
                    });

                    router.push(`${pathname}?${searchParams.toString()}`, { locale: currentLocation });
                },
            },
        );
    };

    const isDisabled = useMemo(() => {
        return data?.language === currentLocation;
    }, [data, currentLocation]);

    if (isLoading) return <Skeleton className="setting-type" height={250} />;

    return (
        <div className="setting-type">
            <RadioButton
                value={'ru'}
                id={'ln-ru'}
                checked={currentLocation === 'ru'}
                name={'select-lang'}
                text={'Русский'}
                onClick={changeLanguage}
            />
            <RadioButton
                value={'en'}
                id={'ln-en'}
                name={'select-lang'}
                text={'English'}
                checked={currentLocation === 'en'}
                onClick={changeLanguage}
            />
            <RadioButton
                value={'es'}
                id={'ln-es'}
                name={'select-lang'}
                text={'Español'}
                checked={currentLocation === 'es'}
                onClick={changeLanguage}
            />

            <div className="settings-page__buttons">
                <Button variant={'active'} isLoading={isPending} disabled={isDisabled} onClick={acceptHandler}>
                    {t('Accept')}
                </Button>
                <Button variant="transparent" onClick={() => router.push(ROUTES.PROFILE)}>
                    {t('Back')}
                </Button>
            </div>
        </div>
    );
};

export default LanguageSettings;
