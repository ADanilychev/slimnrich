'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import Button from '@/components/UI/Button/Button';
import RadioButton from '@/components/UI/RadioButton/RadioButton';

import { ROUTES } from '@/lib/constants/Routes';
import { IBasicUserData } from '@/lib/types/services/user.type';

import { useChangeSettings } from '@/hooks/react-queries/useChangeSettings';
import { useProfile } from '@/hooks/react-queries/useProfile';
import { useRouter } from '@/i18n/routing';

const NotificationSettings = () => {
    const t = useTranslations('Settings');

    const router = useRouter();
    const queryClient = useQueryClient();

    const [value, setValue] = useState(true);

    const { data, isLoading } = useProfile();

    const { mutateAsync, isPending } = useChangeSettings();

    const acceptHandler = async () => {
        await mutateAsync(
            {
                notifications: value,
            },
            {
                onSuccess() {
                    queryClient.setQueryData(['get-user-basic-data'], (oldData: IBasicUserData) => {
                        return {
                            ...oldData,
                            notifications: value,
                        };
                    });
                },
            },
        );
    };

    useEffect(() => {
        if (!data) return;

        setValue(data.notifications);
    }, [data]);

    const isDisabled = useMemo(() => {
        return data?.notifications === value;
    }, [data, value]);

    if (isLoading) return <Skeleton className="setting-type" height={250} />;

    return (
        <div className="setting-type">
            <RadioButton
                value={'on'}
                id={'ln-en'}
                name={'notification'}
                text={t('Notifications.On')}
                checked={value}
                onClick={() => setValue(true)}
            />
            <RadioButton
                value={'off'}
                id={'ln-es'}
                name={'notification'}
                text={t('Notifications.Off')}
                checked={!value}
                onClick={() => setValue(false)}
            />

            <div className="settings-page__buttons">
                <Button variant={'active'} onClick={acceptHandler} isLoading={isPending} disabled={isDisabled}>
                    {t('Accept')}
                </Button>
                <Button variant="transparent" onClick={() => router.push(ROUTES.PROFILE)}>
                    {t('Back')}
                </Button>
            </div>
        </div>
    );
};

export default NotificationSettings;
