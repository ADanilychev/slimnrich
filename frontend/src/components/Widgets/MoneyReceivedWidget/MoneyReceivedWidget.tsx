import { useTranslations } from 'next-intl';

import { MoneyReceivedGraph } from './MoneyReceivedGraph/MoneyReceivedGraph';

import '../widgets.scss';
import './moneyReceivedWidget.scss';

export function MoneyReceivedWidget({ payload }: { payload: (number | null)[] }) {
    const t = useTranslations('MoneyReceivedWidget');
    return (
        <div className="base-battle-widget money-received-widget">
            <div className="base-battle-widget__header">
                <p className="base-battle-widget__title">{t('Title')}</p>
            </div>
            <div className="base-battle-widget__content">
                <MoneyReceivedGraph payload={payload} />
            </div>
        </div>
    );
}
