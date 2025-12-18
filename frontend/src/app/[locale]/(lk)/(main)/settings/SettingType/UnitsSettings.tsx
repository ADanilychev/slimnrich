import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import Button from '@/components/UI/Button/Button';
import RadioButton from '@/components/UI/RadioButton/RadioButton';

import { INumberSystem } from '@/lib/constants/NumberSystem';
import { ROUTES } from '@/lib/constants/Routes';
import { IBasicUserData } from '@/lib/types/services/user.type';

import { useChangeSettings } from '@/hooks/react-queries/useChangeSettings';
import { useProfile } from '@/hooks/react-queries/useProfile';
import { useRouter } from '@/i18n/routing';
import { RegisterService } from '@/services/register.service';

const UnitsSettings = () => {
    const t = useTranslations('Settings');

    const router = useRouter();
    const queryClient = useQueryClient();

    const [currentNs, setCurrentNS] = useState(INumberSystem.KG_CM);

    const { mutateAsync, isPending } = useChangeSettings();
    const { data: profileData, isLoading: isProfileLoading } = useProfile();
    const { data: nsData, isLoading: isNsLoading } = useQuery({
        queryKey: ['fetch-units'],
        queryFn: () => RegisterService.getNumberSystems(),
        staleTime: 60000,
    });

    const isDisabled = useMemo(() => {
        return currentNs === profileData?.numbers_system;
    }, [currentNs, profileData]);

    const acceptHandler = () => {
        mutateAsync(
            {
                numbers: currentNs,
            },
            {
                onSuccess() {
                    queryClient.setQueryData(['get-user-basic-data'], (oldData: IBasicUserData) => {
                        return {
                            ...oldData,
                            numbers_system: currentNs,
                        };
                    });

                    queryClient.invalidateQueries({ queryKey: ['fetch-stats-data'] });
                },
            },
        );
    };

    useEffect(() => {
        if (!profileData) return;
        setCurrentNS(profileData.numbers_system);
    }, [profileData, profileData]);

    if (isNsLoading || isProfileLoading) return <Skeleton height={250} />;

    return (
        <div className="setting-type">
            {nsData?.map((item, index) => (
                <RadioButton
                    value={item.value}
                    id={item.text}
                    name={'ns'}
                    text={item.text}
                    checked={currentNs === item.value}
                    onChange={(value) => {
                        setCurrentNS(value);
                    }}
                    key={index}
                />
            ))}

            <div className="settings-page__buttons">
                <Button variant={'active'} disabled={isDisabled} isLoading={isPending} onClick={acceptHandler}>
                    {t('Accept')}
                </Button>
                <Button variant="transparent" onClick={() => router.push(ROUTES.PROFILE)}>
                    {t('Back')}
                </Button>
            </div>
        </div>
    );
};

export default UnitsSettings;
