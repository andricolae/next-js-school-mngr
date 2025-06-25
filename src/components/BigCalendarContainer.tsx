import prisma from "@/lib/prisma";
import BigCalendar from "./BigCalendar";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";

const BigCalendarContainer = async (
    { type, id, }
        :
        {
            type: "teacherId" | "classId";
            id: string | number;
        }) => {

    const dataRes = await prisma.lesson.findMany({
        where: {
            ...(type === "teacherId"
                ? { teacherId: id as string }
                : { classId: id as number }),
        },
    });

    const data = dataRes.map(lesson => ({
        title: lesson.name,
        start: new Date(new Date(lesson.startTime).getTime() - 3 * 60 * 60 * 1000),
        end: new Date(new Date(lesson.endTime).getTime() - 3 * 60 * 60 * 1000),
    }));

    const schedule = adjustScheduleToCurrentWeek(data);

    return (
        <div className=''><BigCalendar data={data} /></div>
    )
}

export default BigCalendarContainer