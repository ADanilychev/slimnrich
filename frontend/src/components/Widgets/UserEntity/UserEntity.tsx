import { useMemo } from 'react';

import { UserFrame } from '@/components/UserFrame/UserFrame';

import { WEIGHT_SYSTEM } from '@/lib/constants/NumberSystem';

import { useTransformNumberSystem } from '@/hooks/useTransformNumberSystem';

import './userEntity.scss';

export function UserEntity({
    direction = 'row',
    text,
    weight_kg,
    achievementCount = 0,
    avatarSrc,
    isUnknown = false,
    goToProfile,
}: {
    direction?: 'row-reverse' | 'row';
    text: string;
    weight_kg: number;
    achievementCount?: number;
    avatarSrc?: string;
    isUnknown?: boolean;
    goToProfile?: () => void;
}) {
    const { currentNumberSystem, transformToIb } = useTransformNumberSystem();

    const weight = useMemo(() => {
        if (currentNumberSystem.weight === WEIGHT_SYSTEM.IB) return transformToIb(weight_kg);
        return weight_kg;
    }, [weight_kg]);

    return (
        <div
            className="user-entity"
            style={{
                flexDirection: direction,
            }}
        >
            <UserFrame
                width={46}
                height={46}
                achievementCount={isUnknown ? undefined : achievementCount}
                src={isUnknown ? undefined : avatarSrc}
                goToProfile={goToProfile}
            />
            <div className="user-entity__info">
                <small>{text}</small>
                <p>
                    {isUnknown ? <b>?</b> : <b>{weight}</b>} {currentNumberSystem.weight}
                </p>
            </div>
        </div>
    );
}
