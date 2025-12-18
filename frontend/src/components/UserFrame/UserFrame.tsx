import Image from 'next/image';

import './userFrame.scss';

export function UserFrame({
    width = 29,
    height = 29,
    src = '/img/header/avatar.svg',
    achievementCount = 0,
    goToProfile,
}: {
    width?: number;
    height?: number;
    src?: string;
    achievementCount?: number;
    goToProfile?: () => void;
}) {
    return (
        <div className="user-frame" onClick={goToProfile}>
            <div className="user-frame__wrapper">
                <Image src={src} height={width} width={height} quality={90} alt="avatar" />
            </div>

            <span className="user-frame__span">{achievementCount}</span>
        </div>
    );
}
