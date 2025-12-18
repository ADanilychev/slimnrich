import React from 'react';

import './lineStepProgress.scss';

interface ILineStepProgress {
    steps: number;
    currentStep: number;
}

const LineStepProgress: React.FC<ILineStepProgress> = ({ steps, currentStep }) => {
    const $lineWrapper = React.useRef<HTMLDivElement>(null);
    const [progressWidth, setProgressWidth] = React.useState(0);

    React.useEffect(() => {
        if (!$lineWrapper.current) return;

        const currentPoint = $lineWrapper.current?.querySelector(`[data-index="${currentStep}"]`);

        setProgressWidth((currentPoint?.getBoundingClientRect().left || 0) - 9);
    }, [currentStep, $lineWrapper]);

    return (
        <div className="line-step-progress">
            <div className="line-step-progress__wrapper" ref={$lineWrapper}>
                {Array(steps)
                    .fill(0)
                    .map((_, index) => (
                        <span className="line-step-progress__point" key={index} data-index={index + 1} />
                    ))}

                <div className="line-step-progress__line" style={{ width: progressWidth }} />
            </div>
        </div>
    );
};

export default LineStepProgress;
