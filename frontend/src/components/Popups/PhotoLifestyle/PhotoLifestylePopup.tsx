import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import Button from '@/components/UI/Button/Button';
import Input from '@/components/UI/Input/Input';
import { InputWebCam } from '@/components/UI/Input/InputWebCam/InputWebCam';

import { useModal } from '@/context/useModalContext';

import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';
import cn from '@/lib/import/classnames';
import { IUploadResponse, UPLOAD_FILE_TYPE } from '@/lib/types/services/upload.type';

import { IUploadLifeForm } from './photoLife.type';
import { UploadService } from '@/services/upload.service';

import '../popup.base.scss';
import './photoLifestylePopup.scss';

export function PhotoLifestylePopup() {
    const t = useTranslations('Popups.PhotoLifestylePopup');

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
    } = useForm<IUploadLifeForm>({
        mode: 'onChange',
        defaultValues: {
            title: null,
            about: '',
            file: null,
            file_type: UPLOAD_FILE_TYPE.LIFE,
        },
    });

    const { mutateAsync, isPending } = useMutation({
        mutationKey: ['upload-result'],
        mutationFn: async (data: IUploadLifeForm) => await UploadService.uploadResult(data, data.file as File),
    });

    const onSubmit: SubmitHandler<IUploadLifeForm> = async (data) => {
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
        <div className={cn('popup-base photo-lifestyle-popup')}>
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
                                src={'/img/uploadResult/life.svg'}
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
                                <p className="row-title">{t('Life')}:</p>
                                <InputWebCam
                                    setValue={(file: File) => {
                                        setValue('file', file, { shouldDirty: true });
                                    }}
                                    file={watch('file')}
                                />
                            </div>

                            <div className="popup-base__row">
                                <p className="row-title">{t('TitleText')}:</p>
                                <Input
                                    type="text"
                                    {...register('title', { required: true, minLength: 3, maxLength: 150 })}
                                />
                            </div>

                            <div className="popup-base__row">
                                <p className="row-title">{t('About')}:</p>
                                <Input id="about-record-input" type="text" {...register('about', { maxLength: 300 })} />
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
