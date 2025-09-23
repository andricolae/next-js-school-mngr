"use client";
import { Calendar, momentLocalizer, View, Views, Formats } from "react-big-calendar";
import { useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import "@/components/BigCalendar.css";

const localizer = momentLocalizer(moment);

const BigCalendar = ({ data }: { data: { title: string; start: Date; end: Date }[] }) => {
    const [view, setView] = useState<View>(Views.WORK_WEEK);

    const handleOnChangeView = (selectedView: View) => {
        setView(selectedView);
    };

    const formats: Formats = {
        timeGutterFormat: (date) => moment(date).format("H:mm"),
    };

    return (
        <Calendar
            localizer={localizer}
            events={data}
            startAccessor="start"
            endAccessor="end"
            views={["work_week", "day"]}
            view={view}
            style={{ height: "100%" }}
            onView={handleOnChangeView}
            min={new Date(2025, 1, 1, 8, 0, 0)}
            max={new Date(2025, 1, 1, 19, 0, 0)}
            formats={formats}
        />
    );
};

export default BigCalendar;
