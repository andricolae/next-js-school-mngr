import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { TokenData } from "@/lib/utils";
import dynamic from "next/dynamic";
import { availableModules } from "@/lib/modules";
const Table = dynamic(() => import("@/components/Table"));
const FormContainer = dynamic(() => import("@/components/FormContainer"));
const Pagination = dynamic(() => import("@/components/Pagination"), { ssr: false });
const TableSearch = dynamic(() => import("@/components/TableSearch"), { ssr: false });
const SortButton = dynamic(() => import("@/components/SortButton"), { ssr: false });
const FilterForm = dynamic(() => import("@/components/forms/FilterForm"), { ssr: false });

const ExamListPage = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {

    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;
    const currentUserId = userId;

    const [classesData, teachersData, subjectsData] = await Promise.all([
        prisma.class.findMany({ select: { id: true, name: true } }),
        prisma.teacher.findMany({ select: { id: true, name: true, surname: true } }),
        prisma.subject.findMany({ select: { id: true, name: true } })
    ]);

    const classes = classesData.map(c => ({ id: String(c.id), name: c.name }));
    const formattedTeachers = teachersData.map(t => ({ id: t.id, name: `${t.name} ${t.surname}` }));
    const subjects = subjectsData.map(s => ({ id: String(s.id), name: s.name }));

    const columns = [
        {
            header: "Materie",
            accessor: "name",
        },
        ...(role === "parent"
            ? [
                {
                    header: "Elev",
                    accessor: "student",
                },
            ]
            : []),
        {
            header: "Clasa",
            accessor: "class",
        },
        {
            header: "Profesor",
            accessor: "teacher",
            className: "hidden md:table-cell",
        },
        {
            header: "Data",
            accessor: "date",
            className: "hidden md:table-cell",
        },
        ...(role === "admin" || role === "teacher" ? [{
            header: "Acțiuni",
            accessor: "actions",
        }] : []),
    ]

    const renderRow = (item: any) => (
        <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-skyLight">
            <td className="flex items-center gap-4 p-4">{item.lesson.subject.name}</td>
            {role === "parent" && <td>{item.lesson.class.students[0].name}</td>}
            <td>{item.lesson.class.name}</td>
            <td className="hidden md:table-cell">{item.lesson.teacher.name + " " + item.lesson.teacher.surname}</td>
            <td className="hidden md:table-cell">{new Intl.DateTimeFormat("ro-RO").format(item.startTime)}</td>
            <td>
                <div className="flex items-center gap-2">
                    {(role === "admin" || role === "teacher") && (
                        <>
                            <FormContainer table="exam" type="update" data={item} />
                            <FormContainer table="exam" type="delete" id={item.id} />
                        </>
                    )}
                </div>
            </td>
        </tr>
    )


    const { page, sort, ...queryParams } = searchParams;
    const p = page ? parseInt(page) : 1;

    const queryConditions: Prisma.ExamWhereInput[] = [];

    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined) {
                switch (key) {
                    case "classId": {
                        const classIds = value.split(',').map(v => parseInt(v));
                        queryConditions.push({ lesson: { classId: { in: classIds } } });
                        break;
                    }
                    case "teacherId": {
                        const teacherIds = value.split(',');
                        queryConditions.push({ lesson: { teacherId: { in: teacherIds } } });
                        break;
                    }
                    case "subjectId": {
                        const subjectIds = value.split(',').map(v => parseInt(v));
                        queryConditions.push({ lesson: { subjectId: { in: subjectIds } } });
                        break;
                    }
                    case "moduleId": {
                        const selectedModuleId = parseInt(value);
                        const selectedModule = availableModules.find(mod => mod.id === selectedModuleId);
                        if (selectedModule) {
                            const moduleStartDate = new Date(selectedModule.startDate);
                            const moduleEndDate = new Date(selectedModule.endDate);
                            moduleEndDate.setHours(23, 59, 59, 999);

                            queryConditions.push({
                                startTime: {
                                    gte: moduleStartDate,
                                    lte: moduleEndDate,
                                },
                            });
                        }
                        break;
                    }
                    case "search":
                        queryConditions.push({
                            OR: [
                                {
                                    title: { contains: value, mode: "insensitive" },
                                },
                                {
                                    lesson: {
                                        is: {
                                            name: { contains: value, mode: "insensitive" },
                                        },
                                    },
                                },
                                {
                                    lesson: {
                                        is: {
                                            subject: {
                                                is: {
                                                    name: { contains: value, mode: "insensitive" },
                                                },
                                            },
                                        },
                                    },
                                },
                                {
                                    lesson: {
                                        is: {
                                            class: {
                                                is: {
                                                    name: { contains: value, mode: "insensitive" },
                                                },
                                            },
                                        },
                                    },
                                },
                                {
                                    lesson: {
                                        is: {
                                            teacher: {
                                                is: {
                                                    OR: [
                                                        { name: { contains: value, mode: "insensitive" } },
                                                        { surname: { contains: value, mode: "insensitive" } },
                                                        { username: { contains: value, mode: "insensitive" } },
                                                    ],
                                                },
                                            },
                                        },
                                    },
                                },
                            ]
                        })
                        break;
                    default:
                        break;
                }
            }
        }
    }

    const query: Prisma.ExamWhereInput = {
        AND: queryConditions.length > 0 ? queryConditions : undefined
    };
    query.lesson = {};

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

    let orderBy: any = { startTime: "asc" };
    if (sort) {
        orderBy = sort === "asc"
            ? { lesson: { subject: { name: "asc" } } }
            : { lesson: { subject: { name: "desc" } } };
    }

    const [data, count] = await prisma.$transaction([
        prisma.exam.findMany({
            where: query,
            include: {
                lesson: {
                    select: {
                        subject: { select: { name: true } },
                        teacher: { select: { name: true, surname: true } },
                        class: {
                            select: {
                                id: true,
                                name: true,
                                students: {
                                    where: {
                                        parentId: `${userId}`,
                                    },
                                    select: {
                                        id: true,
                                        name: true,
                                        surname: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy,
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (p - 1),
        }),
        prisma.exam.count({ where: query }),
    ]);

    return (
        <div className='bg-white p-4 rounded-md flex-1 m-4 mt-0'>
            <div className='flex items-center justify-between'>
                <h1 className='hidden md:block text-lg font-semibold'>Teste</h1>
                <div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
                    <TableSearch />
                    <div className='flex items-center gap-4 self-end'>
                        <SortButton currentSort={sort} />
                        <FilterForm
                            currentFilters={searchParams}
                            classes={classes}
                            teachers={formattedTeachers}
                            subjects={subjects}
                            modules={availableModules}
                        />
                        {(role === "admin" || role === "teacher") && (
                            <FormContainer table="exam" type="create" />
                        )}
                    </div>
                </div>
            </div>
            <Table columns={columns} renderRow={renderRow} data={data} />
            <Pagination page={p} count={count} />
        </div>
    )
}

export default ExamListPage