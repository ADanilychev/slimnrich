import Image from 'next/image';
import { ChangeEvent, Dispatch, SetStateAction, useRef, useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';

import { IEditProfileForm } from '@/lib/types/services/user.type';

export function UploaderImage({
    setValue,
    imagePreview,
    setImagePreview,
}: {
    avatar?: string;
    imagePreview: string | ArrayBuffer | null | undefined;
    setValue: UseFormSetValue<IEditProfileForm>;
    setImagePreview: Dispatch<SetStateAction<string | ArrayBuffer | null | undefined>>;
}) {
    const filePickerRef = useRef<HTMLInputElement | null>(null);

    const selectImage = () => {
        if (!filePickerRef) return;
        filePickerRef.current?.click();
    };

    const previewFile = (event: ChangeEvent<HTMLInputElement>) => {
        const reader = new FileReader();

        const file = event.target.files && event.target.files[0];

        if (file) {
            setValue('file', file, { shouldDirty: true });
            reader.readAsDataURL(file);
        }

        reader.onload = (readerEvent) => {
            setImagePreview(readerEvent.target?.result);
        };
    };

    return (
        <div className="edit-profile-modal__avatar">
            <input ref={filePickerRef} type="file" accept="image/*" hidden onChange={previewFile} />

            <div className="edit-profile-modal__wrapper-image" onClick={selectImage}>
                <Image
                    width={90}
                    height={90}
                    src={(imagePreview as string) || '/img/avatar.png'}
                    quality={100}
                    alt="avatar"
                />
            </div>

            <Image
                id="avatar-ico"
                width={32}
                height={32}
                src={'/img/profileControls/edit-profile-avatar.svg'}
                quality={90}
                alt="ico"
                onClick={selectImage}
            />
        </div>
    );
}
