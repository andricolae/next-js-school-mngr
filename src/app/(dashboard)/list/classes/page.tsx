import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Teacher, Class, Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { TokenData } from "@/lib/utils";
import dynamic from "next/dynamic";
const Table = dynamic(() => import("@/components/Table"));
const FormContainer = dynamic(() => import("@/components/FormContainer"));
const Pagination = dynamic(() => import("@/components/Pagination"), { ssr: false });
const TableSearch = dynamic(() => import("@/components/TableSearch"), { ssr: false });
const SortButton = dynamic(() => import("@/components/SortButton"), { ssr: false });

type ClassList = Class & { supervisor: Teacher }

const ClassListPage = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {

    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;
    const currentUserId = userId;

    const columns = [
        {
            header: "Denumire",
            accessor: "name",
        },
        {
            header: "Capacitate",
            accessor: "capacity",
            className: "hidden md:table-cell",
        },
        {
            header: "Nivel",
            accessor: "grade",
            className: "hidden md:table-cell",
        },
        {
            header: "Diriginte",
            accessor: "supervisor",
            className: "hidden md:table-cell",
        },
        ...(role === "admin" ? [{
            header: "Acțiuni",
            accessor: "actions",
        }] : []),
    ]

    const renderRow = (item: ClassList) => (
        <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-skyLight">
            <td className="flex items-center gap-4 p-4">{item.name}</td>
            <td className="hidden md:table-cell">{item.capacity}</td>
            <td className="hidden md:table-cell">{item.gradeId}</td>
            <td className="hidden md:table-cell">
                {item.supervisor?.name ? item.supervisor?.name + " " : ""}
                {item.supervisor?.surname
                    ? item.supervisor.surname
                    : ""}
            </td>
            <td>
                <div className="flex items-center gap-2">
                    {role === "admin" && (
                        <>
                            <FormContainer table="class" type="update" data={item} />
                            <FormContainer table="class" type="delete" id={item.id} />
                        </>
                    )}
                </div>
            </td>
        </tr>
    )

    const { page, sort, ...queryParams } = searchParams;
    const p = page ? parseInt(page) : 1;

    const query: Prisma.ClassWhereInput = {}

    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined) {
                switch (key) {
                    case "supervisorId":
                        query.supervisorId = value;
                        break;
                    case "search":
                        query.OR = [
                            { name: { contains: value, mode: "insensitive" } },
                            {
                                supervisor: {
                                    OR: [
                                        { name: { contains: value, mode: "insensitive" } },
                                        { surname: { contains: value, mode: "insensitive" } },
                                        { username: { contains: value, mode: "insensitive" } },
                                    ],
                                },
                            },
                        ];
                        break;
                    default:
                        break;
                }
            }
        }
    }

    let orderBy: any = { name: "asc" };
    if (sort) {
        orderBy = sort === "asc"
            ? { name: "asc" }
            : { name: "desc" };
    }

    const [data, count] = await prisma.$transaction([
        prisma.class.findMany({
            where: query,
            include: {
                supervisor: true,
            },
            orderBy,
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (p - 1)
        }),
        prisma.class.count({ where: query })
    ]);

    return (
        <div className='bg-white p-4 rounded-md flex-1 m-4 mt-0'>
            <div className='flex items-center justify-between'>
                <h1 className='hidden md:block text-lg font-semibold'>Clase</h1>
                <div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
                    <TableSearch />
                    <div className='flex items-center gap-4 self-end'>
                        <SortButton currentSort={sort} />
                        {role === "admin" && (
                            <FormContainer table="class" type="create" />
                        )}
                    </div>
                </div>
            </div>
            <Table columns={columns} renderRow={renderRow} data={data} />
            <Pagination page={p} count={count} />
        </div>
    )
}

export default ClassListPage