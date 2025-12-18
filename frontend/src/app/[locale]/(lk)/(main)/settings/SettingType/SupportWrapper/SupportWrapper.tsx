import { SUPPORT_TAB } from '@/lib/constants/Routes';

import { SupportFAQ } from './SupportFAQ/SupportFAQ';
import { SupportHistory } from './SupportHistory';

import './supportWrapper.scss';

export function SupportWrapper({ supportTab }: { supportTab: SUPPORT_TAB }) {
    return (
        <div className="support-wrapper">
            {supportTab === SUPPORT_TAB.HISTORY && <SupportHistory />}
            {supportTab === SUPPORT_TAB.FAQ && <SupportFAQ />}
        </div>
    );
}
