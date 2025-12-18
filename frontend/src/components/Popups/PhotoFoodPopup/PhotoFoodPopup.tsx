import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import Button from '@/components/UI/Button/Button';
import Input from '@/components/UI/Input/Input';
import { InputWebCam } from '@/components/UI/Input/InputWebCam/InputWebCam';
import { SelectInput } from '@/components/UI/Input/SelectInput/SelectInput';

import { useModal } from '@/context/useModalContext';

import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';
import cn from '@/lib/import/classnames';
import { IUploadResponse, UPLOAD_FILE_TYPE } from '@/lib/types/services/upload.type';

import { IUploadFoodForm } from './photoFood.type';
import { UploadService } from '@/services/upload.service';

import '../popup.base.scss';
import './photoFoodPopup.scss';

export function PhotoFoodPopup() {
    const t = useTranslations('Popups.PhotoFoodPopup');

    const { togglePopup } = useModal();
    const [showStatusPage, setShowStatusPage] = useState(false);
    const queryClient = useQueryClient();
    const [responseData, setResponseData] = useState<IUploadResponse | null>(null);

    const {
        register,
        setValue,
        getValues,
        watch,
        handleSubmit,
        formState: { isValid, isDirty },
    } = useForm<IUploadFoodForm>({
        mode: 'onChange',
        defaultValues: {
            food_time: 'Breakfast',
            calories: null,
            about: '',
            file: null,
            file_type: UPLOAD_FILE_TYPE.FOOD,
        },
    });

    const { mutateAsync, isPending } = useMutation({
        mutationKey: ['upload-result'],
        mutationFn: async (data: IUploadFoodForm) => await UploadService.uploadResult(data, data.file as File),
    });

    const onSubmit: SubmitHandler<IUploadFoodForm> = async (data) => {
        await mutateAsync(data, {
            onError: async (error) => {
                await ApiErrorHandler(error, 'Api error!');
            },
            onSuccess: (response) => {
                setShowStatusPage(true);
                setResponseData(response);
                queryClient.invalidateQueries({ queryKey: ['fetch-stats-data'] });
            },
        });
    };

    return (
        <div className={cn('popup-base photo-food-popup')}>
            <div className="popup-base__modal">
                <div className="popup-base__header">
                    <p>{t('Title')}</p>
                </div>
                <AnimatePresence>
                    {showStatusPage && (
                        <m.div
                            className="popup-base__content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            exit={{ opacity: 0 }}
                        >
                            <p className="popup-base__status">{t('Status')}</p>

                            <Image
                                className="popup-base__banner"
                                src={'/img/uploadResult/food.svg'}
                                width={311}
                                height={68}
                                quality={90}
                                alt="success"
                            />

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

                            <Button variant={'active'} onClick={() => togglePopup(false)}>
                                {t('Ok')}
                            </Button>
                        </m.div>
                    )}

                    {!showStatusPage && (
                        <m.form
                            className="popup-base__content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <div className="popup-base__row">
                                <p className="row-title">{t('Food')}:</p>
                                <InputWebCam
                                    setValue={(file: File) => {
                                        setValue('file', file, { shouldDirty: true });
                                    }}
                                    file={watch('file')}
                                />
                            </div>
                            <div className="popup-base__row">
                                <p className="row-title">{t('Time')}:</p>
                                <SelectInput
                                    data={['Breakfast', 'Lunch', 'Dinner', 'Snack']}
                                    selectedElement={watch('food_time')}
                                    onSelectHandler={(value) => setValue('food_time', value)}
                                    render={(item) => (
                                        <p style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>{t(item)}</p>
                                    )}
                                    displayFn={(item) => `${t(item)}`}
                                />
                            </div>

                            <div className="popup-base__row">
                                <p className="row-title">{t('Calory')}:</p>
                                <Input
                                    id="calory-record-input"
                                    {...register('calories', {
                                        required: true,
                                        valueAsNumber: true,
                                        validate: (value) => (value ?? 0) > 0,
                                    })}
                                    type="number"
                                    step={0.01}
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
                                {t('Send')}
                            </Button>
                        </m.form>
                    )}
                </AnimatePresence>

                <div className="triangle"></div>
            </div>
        </div>
    );
}
