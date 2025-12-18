'use client';

import { eachDayOfInterval, endOfDay, format, isWithinInterval, startOfWeek } from 'date-fns';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { Fragment, useCallback } from 'react';

import cn from '@/lib/import/classnames';

import '../badge.scss';
import './goalForWeekBadge.scss';

export function GoalForWeekBadge({
    startDate,
    endDate,
    resultList,
}: {
    startDate: Date;
    endDate: Date;
    resultList: number[];
}) {
    const local = useLocale();
    const t = useTranslations('Badges.GoalForWeekBadge');

    const getDaysToRender = useCallback(() => {
        const weekStart = startOfWeek(startDate, { weekStartsOn: 1 });
        const weekEnd = endOfDay(endDate);

        const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
        return days.reduce(
            (acc, day) => {
                const month = format(day, 'LLLL, yyyy', { locale: require('date-fns/locale')[local] });
                if (!acc[month]) {
                    acc[month] = [];
                }
                acc[month].push(day);
                return acc;
            },
            {} as Record<string, Date[]>,
        );
    }, [startDate, endDate]);

    const isDayInPeriod = useCallback(
        (day: Date) => {
            return isWithinInterval(day, {
                start: new Date(startDate.getTime() - 24 * 60 * 60 * 1000),
                end: endDate,
            });
        },
        [startDate, endDate],
    );

    const isUploadResult = useCallback(
        (day: Date) => {
            return resultList.some((resultDate) => new Date(resultDate * 1000).toDateString() === day.toDateString());
        },
        [resultList],
    );

    return (
        <div className="badge goal-for-week-badge">
            <div className="badge__header">
                <p className="badge__title">{t('Title')}</p>
            </div>

            <div className="badge__content">
                <div className="goal-for-week-badge__month">
                    {Object.entries(getDaysToRender()).map(([month, days]) => (
                        <Fragment key={month}>
                            <p className="goal-for-week-badge__month-name">{month}</p>

                            <div className="goal-for-week-badge__month-wrappers">
                                {days.map((day, index) => (
                                    <div
                                        key={index}
                                        className={cn('goal-for-week-badge__month-day', {
                                            'goal-for-week-badge__month-day_current':
                                                day.toDateString() === new Date().toDateString(),
                                            'goal-for-week-badge__month-day_other': !isDayInPeriod(day),
                                            'goal-for-week-badge__month-day_empty':
                                                isDayInPeriod(day) &&
                                                !isUploadResult(day) &&
                                                day.getTime() < new Date().getTime(),
                                            'goal-for-week-badge__month-day_uploaded':
                                                isDayInPeriod(day) && isUploadResult(day),
                                        })}
                                    >
                                        {isDayInPeriod(day) && isUploadResult(day) && (
                                            <Image src={'/img/ok.svg'} width={10} height={10} alt="upload" />
                                        )}
                                        {day.getDate()}
                                    </div>
                                ))}
                            </div>
                        </Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}
