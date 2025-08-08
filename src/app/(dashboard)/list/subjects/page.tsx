import FormContainer from "@/components/FormContainer"
import Pagination from "@/components/Pagination"
import Table from "@/components/Table"
import TableSearch from "@/components/TableSearch"
import SortButton from "@/components/SortButton"
import prisma from "@/lib/prisma"
import { ITEM_PER_PAGE } from "@/lib/settings"
import { auth } from "@clerk/nextjs/server"
import { Prisma, Subject, Teacher } from "@prisma/client"
import { TokenData } from "@/lib/utils";

type SubjectList = Subject & { teachers: Teacher[] }

const SubjectListPage = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {

    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;
    const currentUserId = userId;

    const columns = [
        {
            header: "Subject Name",
            accessor: "name",
        },
        {
            header: "Teachers",
            accessor: "teachers",
            className: "hidden md:table-cell",
        },
        {
            header: "Actions",
            accessor: "actions",
        }
    ]

    const renderRow = (item: SubjectList) => (
        <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-skyLight">
            <td className="flex items-center gap-4 p-4">{item.name}</td>
            <td className="hidden md:table-cell">{item.teachers.map(teacher => teacher.name).join(", ")}</td>
            <td>
                <div className="flex items-center gap-2">
                    {role === "admin" && (
                        <>
                            <FormContainer table="subject" type="update" data={item} />
                            <FormContainer table="subject" type="delete" id={item.id} />
                        </>
                    )}
                </div>
            </td>
        </tr>
    )

    const { page, sort, ...queryParams } = searchParams;
    const p = page ? parseInt(page) : 1;

    const query: Prisma.SubjectWhereInput = {}

    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined) {
                switch (key) {
                    case "search":
                        query.name = { contains: value, mode: "insensitive" };
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
        prisma.subject.findMany({
            where: query,
            include: {
                teachers: true,
            },
            orderBy,
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (p - 1)
        }),
        prisma.subject.count({ where: query })
    ]);

    return (
        <div className='bg-white p-4 rounded-md flex-1 m-4 mt-0'>
            <div className='flex items-center justify-between'>
                <h1 className='hidden md:block text-lg font-semibold'>All Subjects</h1>
                <div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
                    <TableSearch />
                    <div className='flex items-center gap-4 self-end'>
                        <SortButton currentSort={sort} />
                        {role === "admin" && (
                            <FormContainer table="subject" type="create" />
                        )}
                    </div>
                </div>
            </div>
            <Table columns={columns} renderRow={renderRow} data={data} />
            <Pagination page={p} count={count} />
        </div>
    )
}

export default SubjectListPage