import prisma from "@/lib/prisma"
import AttendanceChart from "./AttendanceChart"
import Image from "next/image"
const AttendanceChartContainer = async () => {

    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - daysSinceMonday);

    const responseData = await prisma.attendance.findMany({
        where: {
            date: {
                gte: lastMonday
            },
        },
        select: {
            date: true,
            present: true,
        },
    });

    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const attendanceMap: { [key: string]: { present: number; absent: number } } = {
        Mon: { present: 0, absent: 0 },
        Tue: { present: 0, absent: 0 },
        Wed: { present: 0, absent: 0 },
        Thu: { present: 0, absent: 0 },
        Fri: { present: 0, absent: 0 },
    };

    responseData.forEach(item => {
        const itemDate = new Date(item.date);
        const itemDayOfWeek = itemDate.getDay();

        if (itemDayOfWeek >= 1 && itemDayOfWeek <= 5) {
            const dayName = daysOfWeek[itemDayOfWeek - 1];
            if (item.present) {
                attendanceMap[dayName].present += 1;
            } else {
                attendanceMap[dayName].absent += 1;
            }
        }
    });

    const data = daysOfWeek.map((day) => ({
        name: day,
        present: attendanceMap[day].present,
        absent: attendanceMap[day].absent
    }));

    return (
        <div className='bg-white rounded-lg p-4 h-full'>
            <div className='flex justify-between items-center'>
                <h1 className='text-lg font-semibold'>Attendance</h1>
                {/* <Image src="/moreDark.png" alt="" width={20} height={20} /> */}
            </div>
            <AttendanceChart data={data} />
        </div>

    )
}

export default AttendanceChartContainer