import Image from 'next/image';

import cn from '@/lib/import/classnames';
import { IAchievementItem } from '@/lib/types/services/achievement.type';

import './achievementItem.scss';

const AchievementItem = ({ data, isReceived = false }: { data: IAchievementItem; isReceived?: boolean }) => {
    return (
        <div className={cn('achievement-item', { 'achievement-item_received': isReceived })}>
            {isReceived && (
                <Image
                    className="achievement-item__received-img"
                    src={'/img/achievements/received.svg'}
                    height={18}
                    width={18}
                    alt="received"
                />
            )}
            <div className="achievement-item__img">
                <Image src={data.favicon} height={60} width={60} alt="ach" />
            </div>
            <p className="achievement-item__title">{data.title}</p>
            <small className="achievement-item__sub" dangerouslySetInnerHTML={{ __html: data.subtitle }}></small>
        </div>
    );
};

export default AchievementItem;
