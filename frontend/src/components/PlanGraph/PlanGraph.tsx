'use client';

import { useState } from 'react';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryTheme, VictoryTooltip } from 'victory';

import { CustomTooltip } from './CustomTooltip/CustomTooltip';
import { useTransformNumberSystem } from '@/hooks/useTransformNumberSystem';

import './planGraph.scss';

export function PlanGraph({ graphColor = '#9030F0B2', data }: { graphColor?: string; data: number[] }) {
    const { transformValueWithNumberSystem } = useTransformNumberSystem();

    const [selectedBar, setSelectedBar] = useState({
        x: 0,
        y: 0,
    });

    const handleBarClick = (_: any, data: any) => {
        setSelectedBar({ x: data.datum.x, y: data.datum.y || 0 });
    };

    const dataMemo = data.map((item, index) => {
        return { x: index == 0 ? 'Now' : `${index} wk`, y: item };
    });

    return (
        <div className="plan-graph">
            <div className="plan-graph__controls"></div>
            <div className="plan-graph__chart">
                <VictoryChart theme={VictoryTheme.clean}>
                    <VictoryAxis
                        style={{
                            axis: { stroke: 'transparent' },
                            ticks: { stroke: 'transparent' },
                            tickLabels: { fontSize: 14, fill: '#949494' },
                        }}
                    />
                    <VictoryBar
                        scale={{ y: 'log' }}
                        domain={{ y: [Math.max(...data), Math.min(...data) - 3] }}
                        style={{
                            data: {
                                fill: ({ datum }) => (datum.x === selectedBar.x ? '#BFBFFF' : graphColor),
                                fillOpacity: ({ datum }) => (datum.x === selectedBar.x ? '1' : '.5'),
                            },
                            labels: {
                                fontSize: '18px',
                                color: '#322B34',
                                fontWeight: 700,
                                paddingBottom: '4px',
                            },
                        }}
                        barRatio={1}
                        cornerRadius={10}
                        labels={({ datum }) => `${transformValueWithNumberSystem(datum.y, 'weight')}`}
                        labelComponent={<VictoryTooltip flyoutComponent={<CustomTooltip />} />}
                        data={dataMemo}
                        animate={{
                            duration: 500,
                            onLoad: { duration: 500 },
                        }}
                        events={[
                            {
                                target: 'data',
                                eventHandlers: {
                                    onClick: handleBarClick,
                                },
                            },
                        ]}
                    />
                </VictoryChart>
            </div>
        </div>
    );
}
