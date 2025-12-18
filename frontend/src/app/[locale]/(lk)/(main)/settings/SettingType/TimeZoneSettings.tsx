import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import Button from '@/components/UI/Button/Button';
import TimeZoneInput from '@/components/UI/Input/TimeZoneInput/TimeZoneInput';

import { ROUTES } from '@/lib/constants/Routes';
import { IBasicUserData } from '@/lib/types/services/user.type';

import { useChangeSettings } from '@/hooks/react-queries/useChangeSettings';
import { useProfile } from '@/hooks/react-queries/useProfile';
import { useRouter } from '@/i18n/routing';
import { RegisterService } from '@/services/register.service';

const TimeZoneSettings = () => {
    const t = useTranslations('Settings');

    const router = useRouter();
    const queryClient = useQueryClient();

    const [timeZoneValue, setTimeZoneValue] = useState(0);

    const { mutateAsync, isPending } = useChangeSettings();

    const { data: profileData, isLoading: isProfileLoading } = useProfile();

    const { data: timezonesData, isLoading: isTimezonesLoading } = useQuery({
        queryKey: ['fetch-timezones'],
        queryFn: () => RegisterService.getTimeZones(),
        staleTime: 60000,
    });

    const acceptHandler = async () => {
        await mutateAsync(
            {
                timezone: timeZoneValue,
            },
            {
                onSuccess() {
                    queryClient.setQueryData(['get-user-basic-data'], (oldData: IBasicUserData) => {
                        return {
                            ...oldData,
                            timezone: timeZoneValue,
                        };
                    });
                },
            },
        );
    };

    const isDisabled = useMemo(() => {
        return profileData?.timezone === timeZoneValue;
    }, [profileData, timeZoneValue]);

    useEffect(() => {
        if (!profileData) return;

        setTimeZoneValue(profileData?.timezone || 0);
    }, [profileData]);

    if (isTimezonesLoading || isProfileLoading) return <Skeleton className="setting-type" height={200} />;

    return (
        <div className="setting-type">
            <TimeZoneInput
                value={timeZoneValue}
                setValue={(value) => {
                    setTimeZoneValue(value || 0);
                }}
                timeZoneList={timezonesData || []}
            />

            <div className="settings-page__buttons">
                <Button variant={'active'} isLoading={isPending} onClick={acceptHandler} disabled={isDisabled}>
                    {t('Accept')}
                </Button>
                <Button variant="transparent" onClick={() => router.push(ROUTES.PROFILE)}>
                    {t('Back')}
                </Button>
            </div>
        </div>
    );
};

export default TimeZoneSettings;
