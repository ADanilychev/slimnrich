'use client';

import { AnimatePresence, m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { PropsWithChildren, ReactNode, useEffect, useRef } from 'react';

import Button from '@/components/UI/Button/Button';
import { PlayButton } from '@/components/UI/PlayButton/PlayButton';

import cn from '@/lib/import/classnames';

import { useRouter } from '@/i18n/routing';

import './elementHint.scss';

interface Props extends PropsWithChildren {
    isActive: boolean;
    isLastElement: boolean;
    showHintUp?: boolean;
    tutorialLink?: string;
    closeHandler: () => void;
    nextHandler: () => void;
    renderHint: () => ReactNode;
}

export function ElementHint({
    children,
    isActive,
    isLastElement,
    showHintUp = false,
    tutorialLink,
    closeHandler,
    renderHint,
    nextHandler,
}: Props) {
    const t = useTranslations('ElementHint');

    const targetRef = useRef<null | HTMLDivElement>(null);
    const modalRef = useRef<null | HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (!isActive || !targetRef.current) return;

        if (showHintUp && modalRef.current) modalRef.current.scrollIntoView({ behavior: 'smooth' });
        else targetRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [isActive, targetRef]);

    return (
        <AnimatePresence>
            {!isActive && children}
            {isActive && (
                <>
                    <m.div
                        className="hint-overlay"
                        onClick={closeHandler}
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7 }}
                    />
                    <div
                        className={cn('base-element-hint', {
                            'base-element-hint__last': showHintUp || isLastElement,
                        })}
                        ref={targetRef}
                    >
                        <div className="base-element-hint__target">{children}</div>

                        <m.div
                            className="base-element-hint__modal"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.7 }}
                            ref={modalRef}
                        >
                            <Image
                                src={'/img/triangle.svg'}
                                className="base-element-hint__modal-triangle"
                                width={100}
                                height={50}
                                alt="triangle"
                            />

                            <div className="base-element-hint__modal-content">{renderHint()}</div>

                            <div className="base-element-hint__modal-buttons">
                                <Button variant="stroke" onClick={closeHandler}>
                                    {t('Skip')}
                                </Button>
                                {tutorialLink && (
                                    <PlayButton iconSize={20} onClick={() => router.push(tutorialLink)}>
                                        {t('Tutorial')}
                                    </PlayButton>
                                )}

                                <Button variant="gradient" onClick={isLastElement ? closeHandler : nextHandler}>
                                    {isLastElement ? t('Finish') : t('Next')}
                                </Button>
                            </div>
                        </m.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
