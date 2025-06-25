"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const EventCalendar = () => {
    const [value, onChange] = useState<Value>(new Date());
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (value instanceof Date && mounted) {
            router.push(`?date=${value}`);
        }
    }, [value, router, mounted]);

    if (!mounted) {
        return <div className="h-64 bg-gray-100 animate-pulse rounded-md" />;
    }

    return <Calendar onChange={onChange} value={value} locale="en-US" />
}

export default EventCalendar