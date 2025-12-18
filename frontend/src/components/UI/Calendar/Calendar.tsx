import {
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isEqual,
    isSameMonth,
    isWeekend,
    isWithinInterval,
    startOfMonth,
    startOfWeek,
} from 'date-fns';
import { useLocale } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu';

import cn from '@/lib/import/classnames';

import Button from '../Button/Button';

import './calendar.scss';

interface Props {
    startDateDefault?: Date;
    endDateDefault?: Date;
    updateStartDate: (date: Date | null) => void;
    updateEndDate: (date: Date | null) => void;
}

const Calendar: React.FC<Props> = ({ startDateDefault, endDateDefault, updateStartDate, updateEndDate }) => {
    const local = useLocale();
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysToRender = useCallback(() => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);

        const start = startOfWeek(monthStart, { weekStartsOn: 1 });
        const end = endOfWeek(monthEnd, { weekStartsOn: 1 });

        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    const changeMonth = (direction: 'next' | 'prev') => {
        setCurrentDate(
            (prev) => new Date(prev.getFullYear(), direction === 'next' ? prev.getMonth() + 1 : prev.getMonth() - 1, 1),
        );
    };

    const setDatePeriod = (date: Date) => {
        if (endDateDefault && isEqual(endDateDefault, date)) {
            updateEndDate(null);
            return;
        }

        if (startDateDefault && isEqual(startDateDefault, date)) {
            updateStartDate(null);
            return;
        }

        if (!startDateDefault) {
            updateStartDate(date);
        } else if (!endDateDefault) {
            if (startDateDefault > date) {
                updateStartDate(date);
                updateEndDate(startDateDefault);
            } else {
                updateEndDate(date);
            }
        } else {
            updateStartDate(date);
            updateEndDate(null);
        }
    };

    return (
        <div className="calendar-ui">
            <div className="calendar-ui__body">
                <div className="calendar-ui__month">
                    <div className="calendar-ui__month-header">
                        <Button
                            className="calendar-ui__month-button"
                            variant="blue"
                            onClick={() => changeMonth('prev')}
                        >
                            <LuArrowLeft />
                        </Button>
                        <div className="calendar-ui__month-name">
                            {format(currentDate, 'LLLL, yyyy', { locale: require('date-fns/locale')[local] })}
                        </div>
                        <Button
                            className="calendar-ui__month-button"
                            variant="blue"
                            onClick={() => changeMonth('next')}
                        >
                            <LuArrowRight />
                        </Button>
                    </div>

                    <div className="calendar-ui__wrapper">
                        {getDaysToRender().map((day) => (
                            <div
                                className={cn('calendar-ui__day', {
                                    'calendar-ui__day_other': !isSameMonth(day, currentDate),
                                    'calendar-ui__day_weekend': isWeekend(day),
                                    'calendar-ui__day_start': startDateDefault && isEqual(startDateDefault, day),
                                    'calendar-ui__day_end': endDateDefault && isEqual(endDateDefault, day),
                                    'calendar-ui__day_selected':
                                        startDateDefault &&
                                        endDateDefault &&
                                        isWithinInterval(day, {
                                            start: startDateDefault,
                                            end: endDateDefault,
                                        }),
                                })}
                                key={day.toString()}
                                onClick={() => setDatePeriod(day)}
                            >
                                {day.getDate()}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
