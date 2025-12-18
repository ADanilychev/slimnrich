import { useTranslations } from 'next-intl';

import Button from '@/components/UI/Button/Button';

import { useRouter } from '@/i18n/routing';

const GetMoneyBlock = () => {
    const t = useTranslations('Pages.GetMoneyPage');
    const router = useRouter();

    return (
        <div className="rules-block">
            <div className="rules-block__text">
                <div className="rules-block__scroll document-plate">
                    {t.rich('Content', {
                        content: (chunks) => <div className="text-block">{chunks}</div>,
                        title: (chunks) => <p>{chunks}</p>,
                        text: (chunks) => <small>{chunks}</small>,
                        b: (chunks) => <b>{chunks}</b>,
                    })}
                </div>
            </div>

            <Button variant={'stroke'} onClick={() => router.back()}>
                {t('Back')}
            </Button>
        </div>
    );
};

export default GetMoneyBlock;
