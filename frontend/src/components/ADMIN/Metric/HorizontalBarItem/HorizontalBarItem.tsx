import { COLORS, IAnswerItem } from '@/lib/types/services/admin.type';

import './horizontalBarItem.scss';

export function HorizontalBarItem({ answer, index }: { answer: IAnswerItem; index: number }) {
    return (
        <div className="horizontal-bar-diagram-item" key={answer.title}>
            <p className="horizontal-bar-diagram-item__title">{answer.title}</p>
            <div>
                <small
                    style={{
                        background: COLORS[index],
                        width: `${answer.score}%`,
                    }}
                ></small>

                <p
                    className="horizontal-bar-diagram-item__info"
                    style={{
                        color: COLORS[index],
                    }}
                >
                    {(answer as IAnswerItem).score} %
                </p>
            </div>
        </div>
    );
}
