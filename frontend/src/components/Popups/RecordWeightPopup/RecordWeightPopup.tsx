import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import Button from '@/components/UI/Button/Button';
import Input from '@/components/UI/Input/Input';
import { InputUploadFile } from '@/components/UI/Input/InputUploadFile/InputUploadFile';
import { InputWebCam } from '@/components/UI/Input/InputWebCam/InputWebCam';

import { useModal } from '@/context/useModalContext';

import { WEIGHT_SYSTEM } from '@/lib/constants/NumberSystem';
import { getBMI } from '@/lib/helpers/getBMI';
import cn from '@/lib/import/classnames';
import { IUploadResponse, UPLOAD_FILE_TYPE } from '@/lib/types/services/upload.type';

import { IUploadWeightForm } from './recordWeight.type';
import { useValidateWeightBase } from '@/hooks/form-validators/useValidateWeightBase';
import { useProfile } from '@/hooks/react-queries/useProfile';
import { useTransformNumberSystem } from '@/hooks/useTransformNumberSystem';
import { UploadService } from '@/services/upload.service';

import '../popup.base.scss';
import './recordWeightPopup.scss';

interface Props {
    className?: string;
}

export function RecordWeightPopup({ className }: Props) {
    const t = useTranslations('Popups.RecordWeightPopup');
    const tValidateWeightBase = useTranslations('ValidateWeightBase');

    const { data } = useProfile();
    const { togglePopup } = useModal();
    const queryClient = useQueryClient();
    const { validateWeightBase } = useValidateWeightBase();

    const [showStatusPage, setShowStatusPage] = useState(false);
    const [tooltipMessage, setTooltipMessage] = useState<string | null>(null);

    const [responseData, setResponseData] = useState<IUploadResponse | null>(null);

    const { transformToKg, currentNumberSystem, transformValueWithNumberSystem } = useTransformNumberSystem();
    const {
        register,
        setValue,
        getValues,
        watch,
        handleSubmit,
        formState: { isValid, isDirty, errors },
    } = useForm<IUploadWeightForm>({
        mode: 'onChange',
        defaultValues: {
            weight: null,
            file: null,
            about: '',
            file_type: UPLOAD_FILE_TYPE.WEIGHT,
        },
    });

    const { mutateAsync, isPending, isError } = useMutation({
        mutationKey: ['upload-result'],
        mutationFn: async (data: IUploadWeightForm) => await UploadService.uploadResult(data, data.file as File),
    });

    const onSubmit: SubmitHandler<IUploadWeightForm> = async (data) => {
        await mutateAsync(
            {
                ...data,
                weight:
                    currentNumberSystem.weight === WEIGHT_SYSTEM.IB
                        ? Number(transformToKg(data.weight as number))
                        : (data.weight as number),
            },
            {
                onError: async () => {
                    setShowStatusPage(true);
                },
                onSuccess: (response) => {
                    setShowStatusPage(true);
                    setResponseData(response);
                    queryClient.invalidateQueries({ queryKey: ['fetch-stats-data'] });
                },
            },
        );
    };

    const validateWeight = useCallback(
        (value?: number | null) => {
            setTooltipMessage(null);

            let result = validateWeightBase(value ?? 0, false);

            if (typeof result == 'string') {
                setTooltipMessage(result);
            } else if (value) {
                const weight = currentNumberSystem.weight === WEIGHT_SYSTEM.IB ? Number(transformToKg(value)) : value;
                const height = data?.height_cm || 0;

                const bmi = getBMI(weight, height);

                if (bmi < 16) setTooltipMessage(tValidateWeightBase('Error'));
            }

            return result;
        },
        [validateWeightBase],
    );

    const isLostWeight = (responseData?.change ?? 0) < 0;

    return (
        <div className={cn('popup-base record-weight-popup', className)}>
            <div className="popup-base__modal">
                <div className="popup-base__header">
                    <p>{t('Title')}</p>
                </div>
                <AnimatePresence>
                    {showStatusPage && (
                        <m.div
                            className="popup-base__content popup-base__content_finished"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            exit={{ opacity: 0 }}
                        >
                            {isError && <p className="popup-base__status">{t('Status')}</p>}
                            {!isError && (
                                <>
                                    <p className="popup-base__status">
                                        {isLostWeight && (
                                            <>
                                                {t.rich('LostTrue', {
                                                    br: () => <br />,
                                                })}
                                            </>
                                        )}
                                        {!isLostWeight && <>{t('LostFalse')}</>}
                                    </p>
                                    <p className="popup-base__result">
                                        {t.rich('Result', {
                                            lost: isLostWeight
                                                ? transformValueWithNumberSystem(responseData?.change, 'weight')
                                                : `0${currentNumberSystem.weight}`,
                                            weight: transformValueWithNumberSystem(
                                                (data?.weight_kg ?? 0) + (responseData?.change ?? 0),
                                                'weight',
                                            ),
                                            b: (chunks) => <b>{chunks}</b>,
                                        })}
                                    </p>
                                    <Image
                                        className="popup-base__banner"
                                        src={`/img/uploadResult/${isLostWeight ? 'weight-lost' : 'weight'}.svg`}
                                        width={311}
                                        height={68}
                                        quality={90}
                                        alt="success"
                                    />

                                    {isLostWeight && (
                                        <p className="popup-base__receive">
                                            {t.rich('Received', {
                                                bonus: responseData?.bonus,
                                                image: () => (
                                                    <Image
                                                        src={`/img/currency/crystals.svg`}
                                                        height={18}
                                                        width={18}
                                                        alt="crystals"
                                                    />
                                                ),
                                            })}
                                        </p>
                                    )}
                                </>
                            )}

                            <Button variant={'active'} onClick={() => togglePopup(false)}>
                                {t('Ok')}
                            </Button>
                        </m.div>
                    )}

                    {!showStatusPage && (
                        <m.form
                            className="popup-base__content"
                            onSubmit={handleSubmit(onSubmit)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="popup-base__row">
                                <p className="row-title">{t('Scales')}:</p>
                                <InputWebCam
                                    setValue={(file: File) => {
                                        setValue('file', file, { shouldDirty: true });
                                    }}
                                    file={watch('file')}
                                />
                            </div>
                            <div className="popup-base__row">
                                <p className="row-title">
                                    {t('Weight')} ({currentNumberSystem.weight}):
                                </p>
                                <Input
                                    id="weight-record-input"
                                    placeholder={`0`}
                                    type="number"
                                    step={0.01}
                                    isError={!!errors.weight}
                                    showErrorTooltip={true}
                                    errorMessage={tooltipMessage}
                                    {...register('weight', {
                                        required: true,
                                        validate: (v) => validateWeight(v),
                                    })}
                                />
                            </div>

                            <div className="popup-base__row">
                                <p className="row-title">{t('About')}:</p>
                                <Input id="about-record-input" {...register('about')} type="text" />
                            </div>

                            <Button
                                variant={'active'}
                                disabled={!isValid || !isDirty || getValues('file') === null}
                                isLoading={isPending}
                            >
                                {t('Accept')}
                            </Button>
                        </m.form>
                    )}
                </AnimatePresence>

                <div className="triangle"></div>
            </div>
        </div>
    );
}
