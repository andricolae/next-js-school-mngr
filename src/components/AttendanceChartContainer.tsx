import prisma from "@/lib/prisma"
import AttendanceChart from "./AttendanceChart"
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

    const dayMap: Record<string, string> = {
        Mon: "Luni",
        Tue: "Marți",
        Wed: "Miercuri",
        Thu: "Joi",
        Fri: "Vineri"
    }

    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const attendanceMap: { [key: string]: { prezențe: number; absențe: number } } = {
        Mon: { prezențe: 0, absențe: 0 },
        Tue: { prezențe: 0, absențe: 0 },
        Wed: { prezențe: 0, absențe: 0 },
        Thu: { prezențe: 0, absențe: 0 },
        Fri: { prezențe: 0, absențe: 0 },
    };

    responseData.forEach(item => {
        const itemDate = new Date(item.date);
        const itemDayOfWeek = itemDate.getDay();

        if (itemDayOfWeek >= 1 && itemDayOfWeek <= 5) {
            const dayName = daysOfWeek[itemDayOfWeek - 1];
            if (item.present) {
                attendanceMap[dayName].prezențe += 1;
            } else {
                attendanceMap[dayName].absențe += 1;
            }
        }
    });

    const data = daysOfWeek.map((day) => ({
        name: dayMap[day],
        prezențe: attendanceMap[day].prezențe,
        absențe: attendanceMap[day].absențe
    }));

    return (
        <div className='bg-white rounded-lg p-4 h-full'>
            <div className='flex justify-between items-center'>
                <h1 className='text-lg font-semibold'>Prezențe</h1>
                {/* <Image src="/moreDark.png" alt="" width={20} height={20} /> */}
            </div>
            <AttendanceChart data={data} />
        </div>

    )
}

export default AttendanceChartContainer