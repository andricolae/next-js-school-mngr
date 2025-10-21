import dynamic from "next/dynamic";
import { auth } from "@clerk/nextjs/server";
const Announcements = dynamic(() => import("@/components/Announcements"), { ssr: false });
const BigCalendarContainer = dynamic(() => import("@/components/BigCalendarContainer"), { ssr: false });
const EventCalendarContainer = dynamic(() => import("@/components/EventCalendarContainer"), { ssr: false });

const TeacherPage = async ({
    searchParams
}: {
    searchParams: { [keys: string]: string | undefined };
}) => {

    const { userId } = await auth()

    return (
        <div className='flex-1 p-4 flex gap-4 flex-col xl:flex-row'>
            <div className="w-full xl:w-2/3">
                <div className="h-full bg-white p-4 rounded-md">
                    <h1 className="text-xl font-semibold">Orar</h1>
                    <BigCalendarContainer type="teacherId" id={userId!} />
                </div>
            </div>
            <div className="w-full xl:w-1/3 flex flex-col gap-8">
                <EventCalendarContainer searchParams={searchParams} />

                <Announcements />
            </div>
        </div>
    )
}

export default TeacherPage