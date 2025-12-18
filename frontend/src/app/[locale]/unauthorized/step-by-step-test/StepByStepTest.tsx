'use client';

import { useTranslations } from 'next-intl';
import { Fragment, useMemo } from 'react';

import LineStepProgress from '@/components/LineStepPregress/LineStepProgress';
import MainLoader from '@/components/MainLoader/MainLoader';
import PageLogo from '@/components/PageLogo/PageLogo';
import BaseHint from '@/components/UI/BaseHint/BaseHint';
import Button from '@/components/UI/Button/Button';
import InputWithTitle from '@/components/UI/Input/InputWithTitle/InputWithTitle';
import TimeZoneInput from '@/components/UI/Input/TimeZoneInput/TimeZoneInput';
import RadioButton from '@/components/UI/RadioButton/RadioButton';

import { ROUTES } from '@/lib/constants/Routes';
import { getBMI } from '@/lib/helpers/getBMI';
import { ITestForm } from '@/lib/types/TestStore.type';
import { ITimeZoneItem } from '@/lib/types/timezone.type';

import { useGetQuestions } from './useGetQuestions';
import { useNormalizeNumberSystemValues } from '@/hooks/useNormalizeNumberSystemValues';
import { useRouter } from '@/i18n/routing';
import { useTestStore } from '@/store/test.store';

import './stepByStepTest.scss';

const StepByStepTest = () => {
    const t = useTranslations('StepByStepTest');

    const router = useRouter();
    const { data: questions, isLoading } = useGetQuestions();

    const { step, stepForm, setStep, updateStepForm } = useTestStore();
    const weight = useTestStore((store) => store.stepForm.weight);
    const height = useTestStore((store) => store.stepForm.height);

    const { normalizeValues } = useNormalizeNumberSystemValues(stepForm.weight, stepForm.height);

    const goBackHandler = () => {
        if (step === 1) {
            router.push(ROUTES.WELCOME_PAGE(false));
            return;
        }

        setStep(step - 1);
    };

    const goNext = (skip: boolean = false) => {
        if (skip && questions) {
            const question = questions[step - 1];
            if (question.max_select === 1) {
                updateStepForm({ [question.key as keyof ITestForm]: 'skip' });
            } else {
                updateCheckboxValues('skip', stepForm[question.key as keyof ITestForm] as any[], (value) =>
                    updateStepForm({
                        [question.key as keyof ITestForm]: value,
                    }),
                );
            }
        }
        if (step === STEP_COUNT) {
            router.push(ROUTES.TEST_RESULT);
            return;
        }

        setStep(step + 1);
    };

    const STEP_COUNT = useMemo(() => {
        return questions?.length;
    }, [questions]);

    const updateCheckboxValues = (value: any, store: any[], dispatch: React.Dispatch<React.SetStateAction<any>>) => {
        if (store.includes(value)) {
            const newData = store.filter((x) => x !== value);
            dispatch([...newData]);
        } else {
            dispatch([...store, value]);
        }
    };

    const isValidUserBMI = useMemo(() => {
        if (!weight.length || !height.length) return false;

        if (normalizeValues.normalize_height < 55 || normalizeValues.normalize_height > 280) return false;

        const userBMI = getBMI(normalizeValues.normalize_weight, normalizeValues.normalize_height);
        if (userBMI < 16 || userBMI > 230) return false;

        return true;
    }, [weight, height]);

    console.log(stepForm);

    if (isLoading) return <MainLoader />;

    return (
        <div className="page sbs-test">
            <PageLogo />

            <div className="sbs-test__progress">
                <LineStepProgress steps={questions?.length || 0} currentStep={step} />
            </div>

            <div className="sbs-test__content">
                {questions?.map((q, index) => (
                    <Fragment key={q.key}>
                        {index + 1 === step && (
                            <div className="sbs-test__step">
                                <h2>{q.title}</h2>
                                <small>{q.subtitle}</small>

                                <div className="rb-wrapper">
                                    {q.key !== 'timezone' && !q.free_input && (
                                        <>
                                            {q.answers.map((answer) => (
                                                <Fragment key={answer.value}>
                                                    <RadioButton
                                                        type={q.max_select === 1 ? 'radio' : 'checkbox'}
                                                        value={answer.value}
                                                        id={answer.value}
                                                        name={q.key}
                                                        text={answer.text}
                                                        checked={
                                                            q.max_select === 1
                                                                ? stepForm[q.key as keyof ITestForm] == answer.value
                                                                : (
                                                                      stepForm[q.key as keyof ITestForm] as string[]
                                                                  )?.includes(answer.value)
                                                        }
                                                        onChange={(value) => {
                                                            if (q.key === 'numbers') {
                                                                updateStepForm({
                                                                    weight: '',
                                                                    height: '',
                                                                });
                                                            }
                                                            if (q.max_select === 1) {
                                                                updateStepForm({
                                                                    [q.key as keyof ITestForm]: value,
                                                                });
                                                            } else {
                                                                updateCheckboxValues(
                                                                    value,
                                                                    stepForm[q.key as keyof ITestForm] as any[],
                                                                    (value) =>
                                                                        updateStepForm({
                                                                            [q.key as keyof ITestForm]: value,
                                                                        }),
                                                                );
                                                            }
                                                        }}
                                                        key={answer.value}
                                                    />

                                                    {answer.another_button &&
                                                        (stepForm[q.key as keyof ITestForm] == answer.value ||
                                                            (stepForm[q.key as keyof ITestForm] as string[])?.includes(
                                                                answer.value,
                                                            )) && (
                                                            <div className="another-block">
                                                                <InputWithTitle
                                                                    title={t('Option')}
                                                                    type="text"
                                                                    value={
                                                                        stepForm[
                                                                            (q.key + '_description') as keyof ITestForm
                                                                        ] || ''
                                                                    }
                                                                    onChange={(event) =>
                                                                        updateStepForm({
                                                                            [(q.key +
                                                                                '_description') as keyof ITestForm]:
                                                                                event.target.value.trim(),
                                                                        })
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                </Fragment>
                                            ))}
                                        </>
                                    )}

                                    {q.key === 'weight_height' && q.free_input && (
                                        <>
                                            <InputWithTitle
                                                title={`${t('HeightInput')} (${stepForm.numbers})`}
                                                type="number"
                                                isError={!isValidUserBMI && weight.length > 0 && height.length > 0}
                                                value={stepForm.height}
                                                onChange={(event) => updateStepForm({ height: event.target.value })}
                                            />

                                            <InputWithTitle
                                                title={`${t('WeightInput')} (${stepForm.numbers})`}
                                                type="number"
                                                isError={!isValidUserBMI && weight.length > 0 && height.length > 0}
                                                value={stepForm.weight}
                                                onChange={(event) => updateStepForm({ weight: event.target.value })}
                                            />

                                            {!isValidUserBMI && weight.length > 0 && height.length > 0 && (
                                                <BaseHint type="error">
                                                    <div>
                                                        {t.rich('Error', {
                                                            p: (chunks) => <p>{chunks}</p>,
                                                        })}
                                                    </div>
                                                </BaseHint>
                                            )}
                                        </>
                                    )}

                                    {q.key === 'timezone' && (
                                        <>
                                            <TimeZoneInput
                                                timeZoneList={q.answers[0].answers as ITimeZoneItem[]}
                                                value={stepForm.timezone}
                                                setValue={(value) => updateStepForm({ timezone: value })}
                                            />

                                            {stepForm.timezone !== null && (
                                                <BaseHint type="success">
                                                    <div>
                                                        <p>
                                                            {t('TimeZone')}
                                                            <b>
                                                                {' '}
                                                                {
                                                                    (q.answers[0].answers as ITimeZoneItem[]).find(
                                                                        (x) => x.value === stepForm.timezone,
                                                                    )?.text
                                                                }
                                                            </b>
                                                        </p>
                                                    </div>
                                                </BaseHint>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </Fragment>
                ))}
            </div>

            <div className="sbs-test__controls">
                <Button
                    variant={'active'}
                    onClick={() => goNext(false)}
                    disabled={
                        (step === 1 && !stepForm.gender.length) ||
                        (step === 2 && !stepForm.age.length) ||
                        (step === 3 && stepForm.numbers === null) ||
                        (step === 4 && !stepForm.timezone) ||
                        (step === 5 && !isValidUserBMI) ||
                        (step === 6 &&
                            (stepForm.physical.length === 0 ||
                                (stepForm.physical === 'another' && stepForm.physical_description.length === 0))) ||
                        (step === 7 &&
                            (stepForm.sport.length === 0 ||
                                (stepForm.sport === 'another' && stepForm.sport_description.length === 0))) ||
                        (step === 8 &&
                            (stepForm.nutrition.length === 0 ||
                                (stepForm.nutrition.includes('another') &&
                                    stepForm.nutrition_description.length === 0))) ||
                        (step === 9 && stepForm.body_type.length === 0) ||
                        (step === 10 && stepForm.allergies.length === 0) ||
                        (step === 11 && stepForm.chronic_diseases.length === 0) ||
                        (step === 12 && stepForm.bad_habits.length === 0) ||
                        (step === 13 && stepForm.motivation.length === 0) ||
                        (step === 14 &&
                            (stepForm.interests.length === 0 ||
                                (stepForm.interests.includes('another') &&
                                    stepForm.interests_description.length === 0))) ||
                        (step === STEP_COUNT && stepForm.family.length === 0)
                    }
                >
                    {step === STEP_COUNT ? t('BMI') : t('Next')}
                </Button>
                <div className="test-controls--with-skip">
                    <Button variant={'transparent'} id="goBackBtn" onClick={goBackHandler}>
                        {t('Back')}
                    </Button>
                    {[9, 10, 11, 12].includes(step) && (
                        <Button variant={'transparent'} id="skipBtn" onClick={() => goNext(true)}>
                            {t('Skip')}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StepByStepTest;
