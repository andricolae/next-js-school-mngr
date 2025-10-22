import dynamic from "next/dynamic";
const UserCard = dynamic(() => import("@/components/UserCard"));
const Announcements = dynamic(() => import("@/components/Announcements"));
const CountChartContainer = dynamic(() => import("@/components/CountChartContainer"));
const AttendanceChartContainer = dynamic(() => import("@/components/AttendanceChartContainer"));
const EventCalendarContainer = dynamic(() => import("@/components/EventCalendarContainer"));

const AdminPage = ({
    searchParams
}: {
    searchParams: { [keys: string]: string | undefined };
}) => {
    return (
        <div className='p-4 flex gap-4 flex-col md:flex-row'>
            <div className="w-full lg:w-2/3 flex flex-col gap-8">
                <div className="flex gap-4 justify-between flex-wrap">
                    <UserCard type="admin" />
                    <UserCard type="teacher" />
                    <UserCard type="student" />
                    <UserCard type="parent" />
                </div>
                <div className="flex gap-4 flex-col lg:flex-row">
                    <div className="w-full lg:w-1/3 h-[450px]">
                        <CountChartContainer />
                    </div>
                    <div className="w-full lg:w-2/3 h-[450px]">
                        <AttendanceChartContainer />
                    </div>
                </div>
                <div className="w-full h-[500px]">
                    {/* <FinanceChartContainer /> */}
                </div>
            </div>
            <div className="w-full lg:w-1/3 flex flex-col gap-8">
                <EventCalendarContainer searchParams={searchParams} />
                <Announcements />
            </div>
        </div>
    )
}

export default AdminPage