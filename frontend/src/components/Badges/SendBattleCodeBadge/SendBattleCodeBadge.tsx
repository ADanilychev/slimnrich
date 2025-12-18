'use client';

import { useTranslations } from 'next-intl';

import Button from '@/components/UI/Button/Button';
import Input from '@/components/UI/Input/Input';

import { TButtonVariant } from '@/lib/types/button.type';

import '../badge.scss';
import './sendBattleCodeBadge.scss';

export function SendBattleCodeBadge({
    code,
    title,
    btnVariant = 'blue',
}: {
    code: string;
    title?: string;
    btnVariant?: TButtonVariant;
}) {
    const t = useTranslations('Badges.SendBattleCodeBadge');

    const copyHandler = async () => {
        const { toast } = await import('react-hot-toast');
        navigator.clipboard.writeText(code);

        toast.success(t('Success'));
    };

    return (
        <div className="badge send-battle-code-badge">
            <div className="badge__content">
                <p className="send-battle-code-badge__title">{title ? title : t('Title')}</p>
                <div className="send-battle-code-badge__row">
                    <Input value={code} disabled />
                    <Button variant={btnVariant} onClick={copyHandler}>
                        {t('Copy')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
