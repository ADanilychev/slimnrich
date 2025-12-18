import '../admin-badge.scss';
import './answerUserTestBadge.scss';

export function AnswerUserTestBadge({
    test,
}: {
    test: {
        [key: string]: {
            answer: string;
            title: string;
        };
    };
}) {
    return (
        <div className="admin-badge answer-user-test-badge">
            <div className="admin-badge__header">
                <p className="admin-badge__title">Answers to the test</p>
            </div>
            <div className="admin-badge__content">
                {Object.entries(test).map(([key, item]) => (
                    <div className="answer-user-test-badge__row" key={key}>
                        <p>{item.title}:</p>
                        <b>{item.answer}</b>
                    </div>
                ))}
            </div>
        </div>
    );
}
