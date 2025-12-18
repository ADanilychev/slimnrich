import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { LuImagePlus, LuLoader, LuRefreshCcw } from 'react-icons/lu';
import Webcam from 'react-webcam';

import cn from '@/lib/import/classnames';

import Button from '../../Button/Button';

import './inputWebCam.scss';

interface Props {
    setValue: (file: File) => void;
    file: File | null;
    showUploadTextHint?: boolean;
    iconSize?: number;
}

const videoConstraints = {
    width: 1280,
    height: 720,
    resetCameraView: false,
};

export function InputWebCam({ setValue, file, showUploadTextHint = true, iconSize = 15 }: Props) {
    const t = useTranslations('InputWebCam');
    const [isLoading, setIsLoading] = useState(false);
    const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

    const [currentFacingMode, setCurrentFacingMode] = useState<'environment' | 'user'>('environment');

    const webcamRef = useRef<Webcam | null>(null);
    const [webcamEnabled, setWebcamEnabled] = useState(false);

    const capture = useCallback(() => {
        if (!webcamRef.current) return;
        setWebcamEnabled(false);
        setIsLoading(true);
        setTimerId(null);

        const imageSrc = webcamRef.current.getScreenshot();

        if (imageSrc) {
            fetch(imageSrc)
                .then((res) => res.blob())
                .then((blob) => {
                    const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
                    setValue(file);
                });
        }

        const id = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        setTimerId(id);
        setWebcamEnabled(false);
    }, [webcamRef]);

    const [devices, setDevices] = useState<MediaDeviceInfo | null>(null);

    const videoConstraintsMemo = useMemo(() => {
        if (currentFacingMode === 'environment') {
            return {
                ...videoConstraints,
                facingMode: 'environment',
                video: { facingMode: { ideal: 'environment' } },
            };
        }
        return {
            ...videoConstraints,
            facingMode: 'user',
        };
    }, [currentFacingMode]);

    const handleDevices = useCallback(
        (mediaDevices: MediaDeviceInfo[]) => {
            const videoinput = mediaDevices.filter(({ kind }) => kind === 'videoinput');
            const backCamera = videoinput.findLast(({ label }) => label.includes('back')) || videoinput[0];

            setDevices(backCamera);
        },
        [setDevices],
    );

    useEffect(() => {
        if (!navigator.mediaDevices?.enumerateDevices) {
            toast.error('You may have limited access to the camera. Please check it and try again.');
        } else {
            navigator.mediaDevices.enumerateDevices().then(handleDevices);
        }
    }, [handleDevices]);

    useEffect(() => {
        return () => {
            setTimerId(null);
        };
    }, []);

    return (
        <div
            className={cn('input-web-cam base-input', {
                'input-web-cam': (file && !isLoading) || isLoading,
            })}
        >
            {webcamEnabled &&
                createPortal(
                    <div className="webcam-overlay">
                        <Webcam
                            audio={false}
                            height={1000}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            width={1000}
                            screenshotQuality={1}
                            forceScreenshotSourceSize={true}
                            videoConstraints={{ ...videoConstraintsMemo, deviceId: devices?.deviceId }}
                            disablePictureInPicture={true}
                        />
                        <div
                            className="webcam-overlay__changeCamera"
                            onClick={() =>
                                currentFacingMode === 'environment'
                                    ? setCurrentFacingMode('user')
                                    : setCurrentFacingMode('environment')
                            }
                        >
                            <LuRefreshCcw color="white" size={23} />
                        </div>

                        <div className="webcam-overlay__capture" onClick={capture}>
                            <span />
                        </div>

                        <Button variant="stroke" onClick={() => setWebcamEnabled(false)}>
                            {t('Cancel')}
                        </Button>
                    </div>,
                    document.body,
                )}
            <label
                htmlFor="weight-images"
                className={'input-web-cam__area'}
                onClick={() => setWebcamEnabled(!webcamEnabled)}
            >
                {file && !isLoading ? (
                    <>
                        <p>{file.name}</p>

                        <svg
                            width={iconSize}
                            height={iconSize}
                            viewBox="0 0 16 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M6.47344 8.85L4.86094 7.2375C4.72344 7.1 4.54844 7.03125 4.33594 7.03125C4.12344 7.03125 3.94844 7.1 3.81094 7.2375C3.67344 7.375 3.60469 7.55 3.60469 7.7625C3.60469 7.975 3.67344 8.15 3.81094 8.2875L5.94844 10.425C6.09844 10.575 6.27344 10.65 6.47344 10.65C6.67344 10.65 6.84844 10.575 6.99844 10.425L11.2359 6.1875C11.3734 6.05 11.4422 5.875 11.4422 5.6625C11.4422 5.45 11.3734 5.275 11.2359 5.1375C11.0984 5 10.9234 4.93125 10.7109 4.93125C10.4984 4.93125 10.3234 5 10.1859 5.1375L6.47344 8.85ZM7.52344 15C6.48594 15 5.51094 14.803 4.59844 14.409C3.68594 14.015 2.89219 13.4808 2.21719 12.8063C1.54219 12.1318 1.00794 11.338 0.614439 10.425C0.220939 9.512 0.0239384 8.537 0.0234384 7.5C0.0229384 6.463 0.219939 5.488 0.614439 4.575C1.00894 3.662 1.54319 2.86825 2.21719 2.19375C2.89119 1.51925 3.68494 0.985 4.59844 0.591C5.51194 0.197 6.48694 0 7.52344 0C8.55994 0 9.53494 0.197 10.4484 0.591C11.3619 0.985 12.1557 1.51925 12.8297 2.19375C13.5037 2.86825 14.0382 3.662 14.4332 4.575C14.8282 5.488 15.0249 6.463 15.0234 7.5C15.0219 8.537 14.8249 9.512 14.4324 10.425C14.0399 11.338 13.5057 12.1318 12.8297 12.8063C12.1537 13.4808 11.3599 14.0152 10.4484 14.4097C9.53694 14.8042 8.56194 15.001 7.52344 15Z"
                                fill="#05C338"
                            />
                        </svg>
                    </>
                ) : isLoading ? (
                    <>
                        <p>{t('Loading')}</p>
                        <LuLoader className="input-web-cam__loader" size={iconSize} />
                    </>
                ) : (
                    <>
                        {showUploadTextHint && <p>{t('Placeholder')}</p>}
                        <LuImagePlus size={iconSize} />
                    </>
                )}
            </label>
        </div>
    );
}
