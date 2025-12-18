'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import MainLoader from '@/components/MainLoader/MainLoader';
import PageLogo from '@/components/PageLogo/PageLogo';

import './info.scss';

const PrivacyDynamic = dynamic(() => import('./Privacy').then((mod) => mod.Privacy));
const TermsDynamic = dynamic(() => import('./Terms').then((mod) => mod.Terms));

export const Info = () => {
    const params = useSearchParams();
    const [type, setType] = useState<'privacy' | 'terms'>('privacy');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const current = params.get('type');

        if (current) {
            setType(current as 'privacy' | 'terms');
        }
        setIsLoading(false);
    }, [params]);

    if (isLoading) return <MainLoader />;

    return (
        <div className="page info-page">
            <PageLogo />
            {type === 'terms' && <TermsDynamic />}
            {type === 'privacy' && <PrivacyDynamic />}
        </div>
    );
};
