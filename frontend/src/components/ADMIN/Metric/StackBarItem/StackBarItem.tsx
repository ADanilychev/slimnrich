import { COLORS, IAnswerItem } from '@/lib/types/services/admin.type';

import './stackBarItem.scss';

export function StackBarItem({ answerList }: { answerList: IAnswerItem[] }) {
    return (
        <div className="stack-bar-diagram-item">
            <div className="stack-bar-diagram-item__line">
                {answerList.map((a, index) => (
                    <div
                        key={index}
                        style={{
                            background: COLORS[index],
                            width: `${a.score}%`,
                        }}
                    />
                ))}
            </div>
            <div className="stack-bar-diagram-item__info">
                {answerList.map((a, index) => (
                    <div className="stack-bar-diagram-item__legend" key={index}>
                        <span
                            style={{
                                background: COLORS[index],
                            }}
                        />
                        <p>{a.title}:</p>
                        <b
                            style={{
                                color: COLORS[index],
                            }}
                        >
                            {a.score}%
                        </b>
                    </div>
                ))}
            </div>
        </div>
    );
}
