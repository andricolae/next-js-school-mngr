"use client"

import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar'
import moment from 'moment'
import "react-big-calendar/lib/css/react-big-calendar.css"
import { useEffect, useState } from 'react';

const localizer = momentLocalizer(moment)

const BigCalendar = ({
    data
}: {
    data: { title: string; start: Date; end: Date }[]
}) => {
    const [view, setView] = useState<View>(Views.WORK_WEEK)
    const [events, setEvents] = useState<any[]>([])

    useEffect(() => {
        const formattedEvents = data.map(event => {
            const start = new Date(event.start);
            const end = new Date(event.end);

            return {
                title: event.title,
                start,
                end
            };
        });

        setEvents(formattedEvents);
    }, [data]);

    const handleOnChangeView = (selectedView: View) => {
        setView(selectedView);
    };


    return (
        <Calendar
            localizer={localizer}
            events={data}
            startAccessor="start"
            endAccessor="end"
            views={["work_week", "day"]}
            view={view}
            style={{ height: "98%" }}
            onView={handleOnChangeView}
            min={new Date(2025, 1, 1, 8, 0, 0)}
            max={new Date(2025, 1, 1, 17, 0, 0)}
        />
    );
}

export default BigCalendar;