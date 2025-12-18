import Image from 'next/image';

import { BattleType } from '@/lib/configs/Battle.config';

import './battleImage.scss';

export function BattleImage({
    battle_type,
    size = 77,
    border_width = 8,
}: {
    battle_type: BattleType;
    size?: number;
    border_width?: number;
}) {
    return (
        <div
            className="battle-image"
            style={{
                width: `calc(${size}px + ${border_width}px)`,
                height: `calc(${size}px + ${border_width}px)`,
            }}
        >
            <Image src={`/img/battle/${battle_type}.svg`} width={size} height={size} quality={55} alt={battle_type} />
        </div>
    );
}
