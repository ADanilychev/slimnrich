import { VictoryTooltipProps } from 'victory';

export function CustomTooltip(props: VictoryTooltipProps) {
    return (
        <svg
            width={46}
            height={42}
            viewBox="0 0 46 42"
            fill="none"
            x={(props.center?.x || 0) - 46 / 2}
            y={(props.center?.y || 0) - 38 / 2}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M22.5 42L16.0048 30.75L28.9952 30.75L22.5 42Z" y={-5} fill="#322B34" />
        </svg>
    );
}
