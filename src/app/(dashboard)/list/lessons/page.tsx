import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Lesson, Subject, Teacher, Class, Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { TokenData } from "@/lib/utils";
import { availableModules } from "@/lib/modules";
import { deleteSelectedLessons } from "@/lib/actions";
import dynamic from "next/dynamic";
const Table = dynamic(() => import("@/components/Table"));
const FormContainer = dynamic(() => import("@/components/FormContainer"));
const Pagination = dynamic(() => import("@/components/Pagination"), { ssr: false });
const TableSearch = dynamic(() => import("@/components/TableSearch"), { ssr: false });
const SortButton = dynamic(() => import("@/components/SortButton"), { ssr: false });
const BulkDeleteForm = dynamic(() => import("@/components/forms/BulkDeleteForm"), { ssr: false });
const LessonFilterForm = dynamic(() => import("@/components/forms/LessonFilterForm"), { ssr: false });

type LessonList = Lesson & { subject: Subject } & { class: Class } & { teacher: Teacher }

const LessonListPage = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {

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
        {
            header: "Clasă",
            accessor: "class",
        },
        {
            header: "Profesor",
            accessor: "teacher",
            className: "hidden md:table-cell",
        },
        {
            header: "Ora de început",
            accessor: "startTime",
        },
        ...(role === "admin" || role === "teacher" ? [{
            header: "Acțiuni",
            accessor: "actions",
        }] : []),
    ]

    const renderRow = (item: LessonList) => (
        <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-skyLight">
            <td className="flex items-center gap-4 p-4">
                <input type="checkbox" name="lessonIds" value={item.id}></input>
                {item.subject.name}
            </td>
            <td>{item.class.name}</td>
            <td className="hidden md:table-cell">{item.teacher.name + " " + item.teacher.surname}</td>
            <td>
                {item.startTime ? item.startTime.toLocaleString('ro-RO', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Europe/Bucharest'
                }) : 'N/A'}
            </td>
            <td>
                <div className="flex items-center gap-2">
                    {role === "admin" && (
                        <>
                            <FormContainer table="lesson" type="update" data={item} />
                            <FormContainer table="lesson" type="delete" id={item.id} />
                        </>
                    )}
                </div>
            </td>
        </tr>
    )

    const { page, sort, ...queryParams } = searchParams;
    const p = page ? parseInt(page) : 1;

    const queryConditions: Prisma.LessonWhereInput[] = [];


    const hasSpecificFilters = queryParams.classId || queryParams.teacherId || queryParams.subjectId || queryParams.search || queryParams.moduleId;


    if (!hasSpecificFilters) {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);

        queryConditions.push({ startTime: { gte: startOfToday } });
        queryConditions.push({ startTime: { lt: startOfTomorrow } });
    }

    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined && value !== '') {
                switch (key) {
                    case "classId": {
                        const classIds = value.split(',').map(v => parseInt(v));
                        queryConditions.push({ classId: { in: classIds } });
                        break;
                    }
                    case "teacherId": {
                        const teacherIds = value.split(',');
                        queryConditions.push({ teacherId: { in: teacherIds } });
                        break;
                    }
                    case "subjectId": {
                        const subjectIds = value.split(',').map(v => parseInt(v));
                        queryConditions.push({ subjectId: { in: subjectIds } });
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
                    case "search": {
                        queryConditions.push({
                            OR: [
                                { name: { contains: value, mode: "insensitive" } },
                                { subject: { name: { contains: value, mode: "insensitive" } } },
                                { teacher: { name: { contains: value, mode: "insensitive" } } },
                                { teacher: { surname: { contains: value, mode: "insensitive" } } },
                                { class: { name: { contains: value, mode: "insensitive" } } },
                            ]
                        });
                        break;
                    }
                    default:
                        break;
                }
            }
        }
    }


    const query: Prisma.LessonWhereInput = {
        AND: queryConditions.length > 0 ? queryConditions : undefined
    };


    const orderBy: Prisma.LessonOrderByWithRelationInput[] = [
        { startTime: "asc" },
        { subject: { name: "asc" } }
    ];

    let whereClause = { ...query };

    if (role === "teacher") {
        whereClause.teacherId = currentUserId?.toString();
    }

    const [data, count] = await prisma.$transaction([
        prisma.lesson.findMany({
            where: whereClause,
            include: {
                subject: { select: { name: true } },
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
            },
            orderBy,
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (p - 1)
        }),
        prisma.lesson.count({ where: whereClause })
    ]);

    const title = hasSpecificFilters ? "Ore filtrate" : "Orele de azi";
    // const selectedIds = data.map(item => item.id);

    return (
        <div className='bg-white p-4 rounded-md flex-1 m-4 mt-0'>
            <div className='flex items-center justify-between'>
                <h1 className='hidden md:flex items-center gap-2 text-lg font-semibold'>
                    {title}
                    <BulkDeleteForm
                        formActionWrapper={deleteSelectedLessons}
                        table="lesson"
                    />
                </h1>
                <div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
                    <TableSearch />
                    <div className='flex items-center gap-4 self-end'>
                        <SortButton currentSort={sort} />
                        <LessonFilterForm
                            currentFilters={searchParams}
                            classes={classes}
                            teachers={formattedTeachers}
                            subjects={subjects}
                            modules={availableModules}
                        />
                        {role === "admin" && (
                            <FormContainer table="lesson" type="create" />
                        )}
                    </div>
                </div>
            </div>
            <Table columns={columns} renderRow={renderRow} data={data} />
            <Pagination page={p} count={count} />
        </div>
    )
};

export default LessonListPage;
