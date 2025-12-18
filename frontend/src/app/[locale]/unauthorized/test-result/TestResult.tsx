'use client';

import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import BMIProgressBar from '@/components/BMIProgressBar/BMIProgressBar';
import MainLoader from '@/components/MainLoader/MainLoader';
import PageLogo from '@/components/PageLogo/PageLogo';
import Button from '@/components/UI/Button/Button';

import { BMIList } from '@/lib/configs/BMI.config';
import { ROUTES } from '@/lib/constants/Routes';
import { getBMI } from '@/lib/helpers/getBMI';

import { useNormalizeNumberSystemValues } from '@/hooks/useNormalizeNumberSystemValues';
import { useRouter } from '@/i18n/routing';
import { RegisterService } from '@/services/register.service';
import { useAppStore } from '@/store/app.store';
import { useTestStore } from '@/store/test.store';

import './testResult.scss';

const IntroductoryStoriesLazy = dynamic(() => import('./IntroductoryStories/IntroductoryStories'));

const TestResult = () => {
    const t = useTranslations('TestResult');
    const tBMI = useTranslations('BMIProgressBar.BMIList');
    const router = useRouter();

    const payloadForm = useTestStore((store) => store.stepForm);
    const setShowFirstEnterManual = useAppStore((store) => store.setShowFirstEnterManual);

    const weight = useTestStore((store) => store.stepForm.weight);
    const height = useTestStore((store) => store.stepForm.height);
    const gender = useTestStore((store) => store.stepForm.gender);

    const { normalizeValues } = useNormalizeNumberSystemValues(weight, height);

    const [showStories, setShowStories] = useState(false);

    useEffect(() => {
        if (!weight || !height) {
            router.push(ROUTES.STEP_BY_STEP_TEST);
        }
    }, [weight, height]);

    const userBMI = useMemo(() => {
        return getBMI(normalizeValues.normalize_weight, normalizeValues.normalize_height);
    }, [normalizeValues, weight, height]);

    const header = useMemo(() => {
        const data = BMIList.findLast((x) => x.from <= userBMI && x.to >= userBMI)?.title;

        if (!data) {
            if (userBMI < 16) {
                return {
                    localization: tBMI('Exhaustion').toLowerCase(),
                    default_text: 'exhaustion',
                };
            }

            if (userBMI > 40) {
                return {
                    localization: tBMI('Fatness').toLowerCase(),
                    default_text: 'fatness',
                };
            }
        }

        return {
            localization: tBMI(data).toLowerCase(),
            default_text: data?.toLowerCase(),
        };
    }, [userBMI, weight, height]);

    const { mutate, isPending } = useMutation({
        mutationKey: ['registration-user'],
        mutationFn: async () => {
            const payload = { ...payloadForm };

            payload.height = normalizeValues.normalize_height.toFixed().toString();
            payload.weight = normalizeValues.normalize_weight.toString();

            await RegisterService.Registration(payload);
        },
        onSuccess() {
            setShowStories(true);
        },
        onError: (error) => {
            console.error(error);
        },
    });

    useEffect(() => {
        setShowFirstEnterManual();
    }, []);

    if (!weight || !height) return <MainLoader />;

    return (
        <div
            className="page test-result-page hidden-scroll"
            style={{
                padding: !showStories ? 'var(--page_padding)' : 0,
            }}
        >
            {showStories && (
                <div className="stories">
                    <IntroductoryStoriesLazy onAllStoriesEnd={() => router.push(ROUTES.BATTLE)} />
                </div>
            )}

            {!showStories && (
                <>
                    <PageLogo />

                    <div className="test-result-page__header">
                        <h3>{t('Title')}</h3>

                        <h2>
                            {t.rich('Subtitle', {
                                type: header.localization,
                            })}
                        </h2>
                    </div>

                    <div className="test-result-page__content">
                        <BMIProgressBar BMI_value={userBMI} userWeight={Number(weight)} />
                        <div className="test-result-page__img">
                            <Image
                                src={`/img/BMI/${header.default_text}-${gender.toLowerCase()}.png`}
                                width={127}
                                height={334}
                                style={{
                                    height: '100%',
                                }}
                                priority
                                alt="BMI image"
                            />
                        </div>
                    </div>

                    <div className="test-result-page__controls">
                        <Button variant={'active'} onClick={() => mutate()} disabled={isPending}>
                            {t('Goal')}
                        </Button>
                        <Button variant={'transparent'} onClick={() => router.back()}>
                            {t('Back')}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default TestResult;
