import type { Metadata } from 'next';

import { BalanceHistory } from './BalanceHistory';

export const metadata: Metadata = {
    title: '',
    description: '',
};

export default function Page() {
    return <BalanceHistory />;
}
