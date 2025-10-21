import dynamic from "next/dynamic";
const EventCalendar = dynamic(() => import("@/components/EventCalendar"), { ssr: false });
const EventList = dynamic(() => import("@/components/EventList"), { ssr: false });

const EventCalendarContainer = async ({
    searchParams
}: {
    searchParams: { [keys: string]: string | undefined };
}) => {

    const { date } = searchParams;

    return (
        <div className='bg-white p-4 rounded-md'>
            <EventCalendar />
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold my-4">Evenimente</h1>
                {/* <img src="/moreDark.svg" alt="" width={20} height={20} /> */}
            </div>
            <div className="flex flex-col gap-4">
                <EventList dateParam={date} />
            </div>
        </div>
    )
}

export default EventCalendarContainer