import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { SubmitHandler, useForm } from 'react-hook-form';

import { InputUploadFile } from '@/components/UI/Input/InputUploadFile/InputUploadFile';

import { ApiErrorHandler } from '@/lib/helpers/api-error.helper';
import { IMessageData } from '@/lib/types/services/chat.type';

import { ChatService } from '@/services/chat.service';

import './chatTextarea.scss';

export function ChatTextarea({ chatId }: { chatId: string | number }) {
    const t = useTranslations('ChatTextarea');
    const queryClient = useQueryClient();
    const {
        register,
        watch,
        setValue,
        handleSubmit,
        getValues,
        reset,
        formState: { isValid },
    } = useForm<IMessageData>({
        mode: 'onChange',
        defaultValues: {
            chat_id: Number(chatId),
            file: null,
        },
    });

    const { mutateAsync, isPending } = useMutation({
        mutationKey: ['send-chat-message'],
        mutationFn: async (data: IMessageData) => {
            if (data.file) await ChatService.sendPhoto(data);
            else await ChatService.sendMessage(data);
        },
    });

    const onSubmit: SubmitHandler<IMessageData> = async (data) => {
        await mutateAsync(data, {
            onSuccess: async () => {
                queryClient.invalidateQueries({ queryKey: ['get-chat-history'] });
                reset({
                    chat_id: chatId,
                    text: '',
                });
            },
            onError: async (error) => await ApiErrorHandler(error, 'Api error'),
        });
    };

    return (
        <form className="chat-editor" onSubmit={handleSubmit(onSubmit)}>
            {!watch('file') && (
                <textarea
                    placeholder={t('Placeholder')}
                    rows={2}
                    {...register('text', {
                        minLength: 3,
                        maxLength: 512,
                        validate: (value) => {
                            if (!value.trim().length && !watch('file')) return false;
                            else return true;
                        },
                    })}
                />
            )}

            <InputUploadFile
                setValue={(file: File) => setValue('file', file, { shouldDirty: true })}
                file={watch('file') || null}
                showUploadTextHint={false}
                iconSize={20}
            />
            <button disabled={isPending || (!isValid && getValues('file') === null)} type="submit">
                <Image src={'/img/support-chat/send.svg'} height={30} width={30} alt="send" quality={100} />
            </button>
        </form>
    );
}
