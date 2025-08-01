import FormContainer from "@/components/FormContainer"
import Pagination from "@/components/Pagination"
import Table from "@/components/Table"
import TableSearch from "@/components/TableSearch"
import SortButton from "@/components/SortButton"
import prisma from "@/lib/prisma"
import { ITEM_PER_PAGE } from "@/lib/settings"
import { auth } from "@clerk/nextjs/server"
import { Class, Event, Prisma } from "@prisma/client"
import { TokenData } from "@/lib/utils";

type EventList = Event & { class: Class };

const EventListPage = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
    
    const { userId, sessionClaims } = await auth();
    let tokenData;
	if (sessionClaims !== null) {
		tokenData = sessionClaims as unknown as TokenData;
	}
	let role = tokenData?.userPblcMtdt?.role;
    const currentUserId = userId;

    const columns = [
        {
            header: "Title",
            accessor: "title",
        },
        {
            header: "Class",
            accessor: "class",
        },
        {
            header: "Date",
            accessor: "date",
            className: "hidden md:table-cell",
        },
        {
            header: "Start Time",
            accessor: "startTime",
            className: "hidden md:table-cell",
        },
        {
            header: "End Time",
            accessor: "endTime",
            className: "hidden md:table-cell",
        },
        ...(role === "admin" ? [{
            header: "Actions",
            accessor: "actions",
        }] : []),
    ]

    const renderRow = (item: EventList) => (
        <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-skyLight">
            <td className="flex items-center gap-4 p-4">{item.title}</td>
            <td>
                {item.classId === null
                ? "School-wide event"
                : item.class?.name || "-"}
            </td>
            <td className="hidden md:table-cell">{new Intl.DateTimeFormat("en-UK").format(item.startTime)}</td>
            <td className="hidden md:table-cell">{item.startTime.toLocaleTimeString("en-UK", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            })}</td>
            <td className="hidden md:table-cell">{item.endTime.toLocaleTimeString("en-UK", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            })}</td>
            <td>
                <div className="flex items-center gap-2">
                    {(role === "admin" || role === "teacher") && (
                        <>
                            <FormContainer table="event" type="delete" id={item.id} />
                            <FormContainer table="event" type="update" data={item} />
                        </>
                    )}
                </div>
            </td>
        </tr>
    )

    const { page, sort, ...queryParams } = searchParams;
    const p = page ? parseInt(page) : 1;

    const query: Prisma.EventWhereInput = {};
    
    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined) {
                switch (key) {
                    case "search":
                        query.title = { contains: value, mode: "insensitive" };
                        break;
                    default:
                        break;
                }
            }
        }
    }

    if (role !== "admin") {
        const roleConditions = {
            teacher: { lessons: { some: { teacherId: currentUserId! } } },
            student: { students: { some: { id: currentUserId! } } },
            parent: { students: { some: { parentId: currentUserId! } } },
        };

        query.OR = [
            { classId: null },
            { class: roleConditions[role as keyof typeof roleConditions] || {} },
        ];
    }

    let orderBy: any = { startTime: "asc" };
    if (sort) {
        orderBy = sort === "asc" ? { title: "asc" } : { title: "desc" };
    }

    const [data, count] = await prisma.$transaction([
        prisma.event.findMany({
            where: query,
            include: {
                class: true,
            },
            orderBy,
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (p - 1)
        }),
        prisma.event.count({ where: query })
    ]);

    return (
        <div className='bg-white p-4 rounded-md flex-1 m-4 mt-0'>
            <div className='flex items-center justify-between'>
                <h1 className='hidden md:block text-lg font-semibold'>All Events</h1>
                <div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
                    <TableSearch />
                    <div className='flex items-center gap-4 self-end'>
                        <SortButton currentSort={sort} />
                        {(role === "admin" || role === "teacher") && (
                            <FormContainer table="event" type="create" />
                        )}
                    </div>
                </div>
            </div>
            <Table columns={columns} renderRow={renderRow} data={data} />
            <Pagination page={p} count={count} />
        </div>
    )
}

export default EventListPage
