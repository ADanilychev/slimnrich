import { useMemo } from 'react';

import { IAnswerItem } from '@/lib/types/services/admin.type';

import { HorizontalBarItem } from './HorizontalBarItem/HorizontalBarItem';
import { StackBarItem } from './StackBarItem/StackBarItem';

import './metric.scss';

export function Metric({
    question,
    index,
}: {
    question: {
        bar_type: 'stack' | 'horizontal';
        question: {
            [question: string]: IAnswerItem[];
        };
    };
    index: number;
}) {
    const answerList = useMemo(() => {
        return Object.values(question.question).flat();
    }, [question]);

    return (
        <div className="metric">
            <h3 className="metric__question">
                {index + 1}. {Object.keys(question.question)[0]}
            </h3>

            <div className="metric__content">
                {question.bar_type === 'horizontal' &&
                    answerList.map((answer, index) => <HorizontalBarItem answer={answer} index={index} key={index} />)}

                {question.bar_type === 'stack' && <StackBarItem answerList={answerList} key={index} />}
            </div>
        </div>
    );
}
