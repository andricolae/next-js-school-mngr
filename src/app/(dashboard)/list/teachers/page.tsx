import prisma from "@/lib/prisma";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Teacher, Class, Prisma, Subject } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { TokenData } from "@/lib/utils";
import dynamic from "next/dynamic";
const Table = dynamic(() => import("@/components/Table"));
const FormContainer = dynamic(() => import("@/components/FormContainer"));
const Pagination = dynamic(() => import("@/components/Pagination"), { ssr: false});
const TableSearch = dynamic(() => import("@/components/TableSearch"), { ssr: false});
const SortButton = dynamic(() => import("@/components/SortButton"), { ssr: false});

type TeacherList = Teacher & { subjects: Subject[] } & { classes: Class[] }

const TeacherListPage = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {

    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;
    const currentUserId = userId;

    const columns = [
        {
            header: "Info",
            accessor: "info",
        },
        {
            header: "ID Profesor",
            accessor: "teacherId",
            className: "hidden md:table-cell",
        },
        {
            header: "Materii",
            accessor: "subjects",
            className: "hidden md:table-cell",
        },
        {
            header: "Clase",
            accessor: "classes",
            className: "hidden md:table-cell",
        },
        {
            header: "Telefon",
            accessor: "phone",
            className: "hidden lg:table-cell",
        },
        {
            header: "Adresă",
            accessor: "address",
            className: "hidden lg:table-cell",
        },
        ...(role === "admin" ? [
            {
                header: "Acțiuni",
                accessor: "action",
            },] : []
        ),
    ]

    const renderRow = (item: TeacherList) => (
        <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-skyLight">
            <td className="flex items-center gap-4 p-4">
                <img src={item.img || "/noAvatar.svg"} alt="" width={40} height={40} className="md:hidden xl:block w-10 h-10 rounded-full object-cover" />
                <div className="flex flex-col">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.email}</p>
                </div>
            </td>
            <td className="hidden md:table-cell">{item.username}</td>
            <td className="hidden md:table-cell">{item.subjects.map(subject => subject.name).join(", ")}</td>
            <td className="hidden md:table-cell">{item.classes.map(classItem => classItem.name).join(", ")}</td>
            <td className="hidden md:table-cell">{item.phone}</td>
            <td className="hidden md:table-cell">{item.address}</td>
            <td>
                <div className="flex items-center gap-2">
                    <Link href={`/list/teachers/${item.id}`}>
                        <button className="w-7 h-7 flex items-center justify-center rounded-full bg-sky" title="Mai multe detalii">
                            <img src="/view.svg" alt="" width={16} height={16} />
                        </button>
                    </Link>
                    {role === "admin" && (
                        <>
                            <FormContainer table="teacher" type="update" data={""} id={item.id} />
                            <FormContainer table="teacher" type="delete" id={item.id} />
                        </>
                    )}
                </div>
            </td>
        </tr>
    );

    const { page, sort, ...queryParams } = searchParams;
    const p = page ? parseInt(page) : 1;

    const query: Prisma.TeacherWhereInput = {};

    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined) {
                switch (key) {
                    case "classId":
                        query.lessons = {
                            some: {
                                classId: parseInt(value),
                            },
                        };
                        break;
                    case "search":
                        query.OR = [
                            { name: { contains: value, mode: "insensitive" } },
                            { surname: { contains: value, mode: "insensitive" } },
                            { username: { contains: value, mode: "insensitive" } },
                            { email: { contains: value, mode: "insensitive" } },
                            {
                                subjects: {
                                    some: {
                                        name: { contains: value, mode: "insensitive" },
                                    },
                                },
                            },
                            {
                                classes: {
                                    some: {
                                        name: { contains: value, mode: "insensitive" },
                                    },
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
        prisma.teacher.findMany({
            where: query,
            include: {
                subjects: true,
                classes: true,
            },
            orderBy,
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (p - 1)
        }),
        prisma.teacher.count({ where: query })
    ]);

    return (
        <div className='bg-white p-4 rounded-md flex-1 m-4 mt-0'>
            <div className='flex items-center justify-between'>
                <h1 className='hidden md:block text-lg font-semibold'>Profesorii școlii</h1>
                <div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
                    <TableSearch />
                    <div className='flex items-center gap-4 self-end'>
                        <SortButton currentSort={sort} />
                        {role === "admin" && (
                            <FormContainer table="teacher" type="create" />
                        )}
                    </div>
                </div>
            </div>
            <Table columns={columns} renderRow={renderRow} data={data} />
            <Pagination page={p} count={count} />
        </div>
    )
}

export default TeacherListPage