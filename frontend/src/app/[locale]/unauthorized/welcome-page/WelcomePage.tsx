'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';

import PageLogo from '@/components/PageLogo/PageLogo';
import SelectLanguageButton from '@/components/SelectLanguageButton/SelectLanguageButton';
import Button from '@/components/UI/Button/Button';
import Checkbox from '@/components/UI/Checkbox/CheckBox';

import { useModal } from '@/context/useModalContext';

import { ROUTES } from '@/lib/constants/Routes';
import { PopupTypes } from '@/lib/types/ModalContext.type';

import { LentaSkeleton } from './Lenta/LentaSkeleton';
import { Link } from '@/i18n/routing';
import { useRouter } from '@/i18n/routing';
import { TermsService } from '@/services/terms.service';

import './welcomePage.scss';

const InstaStoriesLazy = dynamic(() => import('@/app/[locale]/unauthorized/welcome-page/InstaStories/InstaStories'));
const LentaLazy = dynamic(() => import('./Lenta/Lenta'), {
    loading: () => <LentaSkeleton />,
});

interface IWelcomePage {
    showWelcomeStoriesParam: boolean;
}

const WelcomePage: React.FC<IWelcomePage> = ({ showWelcomeStoriesParam = true }) => {
    const router = useRouter();
    const t = useTranslations('WelcomePage');
    const { togglePopup } = useModal();

    const [showWelcomeStories, setShowWelcomeStories] = React.useState<boolean>(showWelcomeStoriesParam);
    const [isConfirmPrivacyAndRule, setIsConfirmPrivacyAndRule] = React.useState(false);

    const onAllStoriesEnd = () => {
        router.push(ROUTES.WELCOME_PAGE());
        setShowWelcomeStories(false);
    };

    const startTest = () => {
        router.push(ROUTES.STEP_BY_STEP_TEST);
    };

    const { data } = useQuery({
        queryKey: ['get-user-accept-terms'],
        queryFn: async () => await TermsService.getTermsInfo(),
    });

    const { mutate } = useMutation({
        mutationKey: ['fetch-accept-user-terms'],
        mutationFn: async () => await TermsService.acceptTerms(),
        onSuccess: (data) => {
            setIsConfirmPrivacyAndRule(data.result);
        },
        onError: () => {},
    });

    useEffect(() => {
        setIsConfirmPrivacyAndRule(data?.result || false);
    }, [data]);

    return (
        <div
            className={classNames('page welcome-page')}
            style={{
                padding: !showWelcomeStories ? 'var(--page_padding)' : 0,
            }}
        >
            <SelectLanguageButton
                onClick={() => {
                    togglePopup(true, PopupTypes.SelectLanguageModal);
                }}
            />

            {!showWelcomeStories && (
                <Button variant="active" disabled={!isConfirmPrivacyAndRule} onClick={startTest}>
                    {t('Start')}
                </Button>
            )}

            {showWelcomeStories && <InstaStoriesLazy onAllStoriesEnd={onAllStoriesEnd} />}

            {!showWelcomeStories && (
                <div className="welcome-page__start">
                    <div className="start-container__top">
                        <PageLogo />

                        <div className="start-container__text">
                            <h3>{t('title')}</h3>

                            <h2>{t('SubTitle')}</h2>

                            <p>{t('Description')}</p>
                        </div>

                        <div className="start-container__checkbox">
                            <Checkbox
                                isChecked={isConfirmPrivacyAndRule}
                                checkHandler={() => {
                                    mutate();
                                }}
                            >
                                <p>
                                    {t('Agree')} <Link href={ROUTES.INFO('privacy')}>{t('Privacy')}</Link> {t('And')}{' '}
                                    <Link href={ROUTES.INFO('terms')}>{t('Terms')}</Link>
                                </p>
                            </Checkbox>
                        </div>
                    </div>
                    <div className="start-container__bottom">
                        <LentaLazy />
                    </div>
                </div>
            )}
        </div>
    );
};

export default WelcomePage;
