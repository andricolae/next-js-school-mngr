import FormContainer from "@/components/FormContainer"
import Pagination from "@/components/Pagination"
import Table from "@/components/Table"
import TableSearch from "@/components/TableSearch"
import SortButton from "@/components/SortButton"
import prisma from "@/lib/prisma"
import { ITEM_PER_PAGE } from "@/lib/settings"
import { auth } from "@clerk/nextjs/server"
import { Assignment, Class, Prisma, Subject, Teacher } from "@prisma/client"
import Image from "next/image"
import { TokenData } from "@/lib/utils";

type AssignmentList = Assignment & {
    lesson: {
        subject: Subject,
        class: Class,
        teacher: Teacher
    }
}

const AssignmentListPage = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {

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
            header: "Class",
            accessor: "class",
        },
        {
            header: "Teacher",
            accessor: "teacher",
            className: "hidden md:table-cell",
        },
        {
            header: "Due Date",
            accessor: "dueDate",
            className: "hidden md:table-cell",
        },
        ...(role === "admin" || role === "teacher" ? [{
            header: "Actions",
            accessor: "actions",
        }] : []),
    ]

    const renderRow = (item: AssignmentList) => (
        <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-skyLight">
            <td className="flex items-center gap-4 p-4">{item.lesson.subject.name}</td>
            <td>{item.lesson.class.name}</td>
            <td className="hidden md:table-cell">{item.lesson.teacher.name + " " + item.lesson.teacher.surname}</td>
            <td className="hidden md:table-cell">{new Intl.DateTimeFormat("en-UK").format(item.dueDate)}</td>
            <td>
                <div className="flex items-center gap-2">
                    {(role === "admin" || role === "teacher") && (
                        <>
                            <FormContainer table="assignment" type="update" data={item} />
                            <FormContainer table="assignment" type="delete" id={item.id} />
                        </>
                    )}
                </div>
            </td>
        </tr>
    )

    const { page, sort, ...queryParams } = searchParams;
    const p = page ? parseInt(page) : 1;

    const query: Prisma.AssignmentWhereInput = {};

    query.lesson = {};

    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined) {
                switch (key) {
                    case "classId":
                        query.lesson.classId = parseInt(value);
                        break;
                    case "teacherId":
                        query.lesson.teacherId = value;
                        break;
                    case "search":
                        query.lesson.subject = {
                            name: { contains: value, mode: "insensitive" }
                        };
                        break;
                    default:
                        break;
                }
            }
        }
    }

    switch (role) {
        case "admin":
            break;
        case "teacher":
            query.lesson.teacherId = currentUserId!;
            break;
        case "student":
            query.lesson.class = {
                students: {
                    some: {
                        id: currentUserId!,
                    }
                }
            };
            break;
        case "parent":
            query.lesson.class = {
                students: {
                    some: {
                        parentId: currentUserId!,
                    }
                }
            };
            break;
        default:
            break;
    }

    let orderBy: any = { dueDate: "asc" };
    if (sort) {
        orderBy = sort === "asc"
            ? { lesson: { subject: { name: "asc" } } }
            : { lesson: { subject: { name: "desc" } } };
    }

    const [data, count] = await prisma.$transaction([
        prisma.assignment.findMany({
            where: query,
            include: {
                lesson: {
                    select: {
                        subject: { select: { name: true } },
                        teacher: { select: { name: true, surname: true } },
                        class: { select: { name: true } },
                    }
                }
            },
            orderBy,
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (p - 1)
        }),
        prisma.assignment.count({ where: query })
    ]);

    return (
        <div className='bg-white p-4 rounded-md flex-1 m-4 mt-0'>
            <div className='flex items-center justify-between'>
                <h1 className='hidden md:block text-lg font-semibold'>All Assignments</h1>
                <div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
                    <TableSearch />
                    <div className='flex items-center gap-4 self-end'>
                        <SortButton currentSort={sort} />
                        {(role === "admin" || role === "teacher") && (
                            <FormContainer table="assignment" type="create" />
                        )}
                    </div>
                </div>
            </div>
            <Table columns={columns} renderRow={renderRow} data={data} />
            <Pagination page={p} count={count} />
        </div>
    )
}

export default AssignmentListPage