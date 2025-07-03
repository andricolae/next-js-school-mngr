import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import SortButton from "@/components/SortButton";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import FilterForm from "@/components/forms/FilterForm";
import FormContainer from "@/components/FormContainer";
import { TokenData } from "@/lib/utils";
import DownloadButton from "@/components/DownloadButton";

type ResultList = {
    id: number;
    title: string;
    studentName: string;
    studentSurname: string;
    teacherName: string;
    teacherSurname: string;
    score: number;
    className: string;
    startTime: Date;
    subject: string;
};

const ResultListPage = async ({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) => {
    const { userId, sessionClaims } = await auth();
    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;
    const currentUserId = userId;

   
    const [subjectsData, classesData, studentsData, teachersData] = await Promise.all([
        prisma.subject.findMany({ select: { id: true, name: true } }),
        prisma.class.findMany({ select: { id: true, name: true } }),
        prisma.student.findMany({
            select: { id: true, name: true, surname: true }
        }),
        prisma.teacher.findMany({
            select: { id: true, name: true, surname: true }
        }),
    ]);

    const subjects = subjectsData.map(s => ({ id: String(s.id), name: s.name })); 
    const classes = classesData.map(c => ({ id: String(c.id), name: c.name }));   
    const formattedStudents = studentsData.map(s => ({ id: s.id, name: `${s.name} ${s.surname}` })); 
    const formattedTeachers = teachersData.map(t => ({ id: t.id, name: `${t.name} ${t.surname}` })); 

    const columns = [
        {
            header: "Title",
            accessor: "title",
        },
        {
            header: "Subject",
            accessor: "subject",
        },
        {
            header: "Student",
            accessor: "student",
        },
        {
            header: "Score",
            accessor: "score",
            className: "hidden md:table-cell",
        },
        {
            header: "Teacher",
            accessor: "teacher",
            className: "hidden md:table-cell",
        },
        {
            header: "Class",
            accessor: "class",
            className: "hidden md:table-cell",
        },
        {
            header: "Date",
            accessor: "date",
            className: "hidden md:table-cell",
        },
        ...(role === "admin" || role === "teacher"
            ? [
                {
                    header: "Actions",
                    accessor: "action",
                },
            ]
            : []),
    ];

    const renderRow = (item: ResultList) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-skyLight"
        >
            <td className="flex items-center gap-4 p-4">{item.title}</td>
            <td>{item.subject}</td>
            <td>{item.studentName + " " + item.studentSurname}</td>
            <td className="hidden md:table-cell">{item.score}</td>
            <td className="hidden md:table-cell">
                {item.teacherName + " " + item.teacherSurname}
            </td>
            <td className="hidden md:table-cell">{item.className}</td>
            <td className="hidden md:table-cell">
                {new Intl.DateTimeFormat("en-US").format(item.startTime)}
            </td>
            <td>
                <div className="flex items-center gap-2">
                    {(role === "admin" || role === "teacher") && (
                        <>
                            <FormContainer table="result" type="update" data={item} />
                            <FormContainer table="result" type="delete" id={item.id} />
                        </>
                    )}
                </div>
            </td>
        </tr>
    );


    const { page, sort, sortDate, sortGrade, ...queryParams } = searchParams;
    const p = page ? parseInt(page) : 1;

    
    const query: Prisma.ResultWhereInput = {};
    const andConditions: Prisma.ResultWhereInput[] = [];

    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined && value !== '') {
                switch (key) {
                    case "studentId":
                       
                        const studentIds = value.split(',').filter(id => id.trim() !== '');
                        if (studentIds.length > 0) {
                            andConditions.push({ studentId: { in: studentIds } });
                        }
                        break;
                        
                    case "teacherId":
                        
                        const teacherIds = value.split(',').filter(id => id.trim() !== '');
                        if (teacherIds.length > 0) {
                            andConditions.push({
                                OR: [
                                    { exam: { lesson: { teacherId: { in: teacherIds } } } },
                                    { assignment: { lesson: { teacherId: { in: teacherIds } } } }
                                ]
                            });
                        }
                        break;
                        
                    case "subjectId":
                      
                        const subjectIds = value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                        if (subjectIds.length > 0) {
                            andConditions.push({
                                OR: [
                                    { exam: { lesson: { subjectId: { in: subjectIds } } } },
                                    { assignment: { lesson: { subjectId: { in: subjectIds } } } }
                                ]
                            });
                        }
                        break;
                        
                    case "classId":
                     
                        const classIds = value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                        if (classIds.length > 0) {
                            andConditions.push({
                                OR: [
                                    { exam: { lesson: { classId: { in: classIds } } } },
                                    { assignment: { lesson: { classId: { in: classIds } } } }
                                ]
                            });
                        }
                        break;
                        
                    case "title":
                        
                        andConditions.push({
                            OR: [
                                { exam: { title: { contains: value, mode: "insensitive" } } },
                                { assignment: { title: { contains: value, mode: "insensitive" } } }
                            ]
                        });
                        break;
                        
                    case "search":
                       
                        andConditions.push({
                            OR: [
                                { exam: { title: { contains: value, mode: "insensitive" } } },
                                { assignment: { title: { contains: value, mode: "insensitive" } } },
                                { student: { name: { contains: value, mode: "insensitive" } } },
                                { student: { surname: { contains: value, mode: "insensitive" } } }
                            ]
                        });
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
            andConditions.push({
                OR: [
                    { exam: { lesson: { teacherId: currentUserId! } } },
                    { assignment: { lesson: { teacherId: currentUserId! } } }
                ]
            });
            break;
        case "student":
            andConditions.push({ studentId: currentUserId! });
            break;
        case "parent":
            andConditions.push({
                student: {
                    parentId: currentUserId!,
                }
            });
            break;
        default:
            break;
    }


    if (andConditions.length > 0) {
        query.AND = andConditions;
    }


    let orderBy: any = [
        { exam: { startTime: "desc" } },
        { assignment: { startDate: "desc" } }
    ];


    if (sortDate && sortDate !== '') {
        switch (sortDate) {
            case 'date_asc':
                orderBy = [
                    { exam: { startTime: "asc" } },
                    { assignment: { startDate: "asc" } }
                ];
                break;
            case 'date_desc':
                orderBy = [
                    { exam: { startTime: "desc" } },
                    { assignment: { startDate: "desc" } }
                ];
                break;
        }
    }

  
    const shouldSortByScore = sortGrade && sortGrade !== '';
    const shouldSortByTitle = sort !== undefined;
    const shouldSortTransformed = shouldSortByTitle || shouldSortByScore;

   
    const [dataRes, count] = await prisma.$transaction([
        prisma.result.findMany({
            where: query,
            include: {
                student: { select: { name: true, surname: true } },
                exam: {
                    include: {
                        lesson: {
                            select: {
                                class: { select: { name: true } },
                                teacher: { select: { name: true, surname: true } },
                                subject: { select: { name: true } },
                            },
                        },
                    },
                },
                assignment: {
                    include: {
                        lesson: {
                            select: {
                                class: { select: { name: true } },
                                teacher: { select: { name: true, surname: true } },
                                subject: { select: { name: true } },
                            },
                        },
                    },
                },
            },
            orderBy: shouldSortTransformed ? undefined : orderBy,
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (p - 1),
        }),
        prisma.result.count({ where: query }),
    ]);

   
    let data = dataRes.map((item) => {
        const assessment = item.exam || item.assignment;

        if (!assessment) return null;

        const isExam = "startTime" in assessment;

        return {
            id: item.id,
            title: assessment.title,
            studentName: item.student.name,
            studentSurname: item.student.surname,
            teacherName: assessment.lesson.teacher.name,
            teacherSurname: assessment.lesson.teacher.surname,
            score: item.score,
            className: assessment.lesson.class.name,
            startTime: isExam ? assessment.startTime : assessment.startDate,
            studentId: item.studentId,
            examId: item.examId,
            assignmentId: item.assignmentId,
            subject: assessment.lesson.subject.name,
        };
    }).filter(Boolean) as ResultList[];

 
    if (shouldSortTransformed) {
        if (shouldSortByTitle && sort) {
            
            data.sort((a, b) => {
                const aValue = a.title.toLowerCase();
                const bValue = b.title.toLowerCase();
                return sort === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            });
        } else if (shouldSortByScore) {
            
            data.sort((a, b) => {
                if (sortGrade === 'score_asc') {
                    return a.score - b.score;
                } else if (sortGrade === 'score_desc') {
                    return b.score - a.score;
                }
                return 0;
            });
        }
    }

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <SortButton currentSort={sort} />
                        <FilterForm
                            currentFilters={searchParams}
                            subjects={subjects}
                            classes={classes}
                            students={formattedStudents}
                            teachers={formattedTeachers}
                        />
                        
                        <DownloadButton
                            dataToExport={data}
                            headerDetails={{
                                companyName: "Test School",
                                companyAddress: "Test Street 123, Test City",
                            }}
                        />

                        {(role === "admin" || role === "teacher") && (
                            <FormContainer table="result" type="create" />
                        )}
                    </div>
                </div>
            </div>
            <Table columns={columns} renderRow={renderRow} data={data} />
            <Pagination page={p} count={count} />
        </div>
    );
};

export default ResultListPage;