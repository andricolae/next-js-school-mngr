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
import { GenerateResultsPDF } from "@/components/ExportPDF";
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

    // const handleExportPdf = () => {
    //     GenerateResultsPDF(
    //         data, {
    //         companyName: "Test School",
    //         companyAddress: "Test Address, City, Country",
    //    }
    // );
    // };

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

    const { page, sort, ...queryParams } = searchParams;

    const p = page ? parseInt(page) : 1;

    const query: Prisma.ResultWhereInput = {};

    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined) {
                switch (key) {
                    case "studentId":
                        query.studentId = value;
                        break;
                    case "search":
                        query.OR = [
                            { exam: { title: { contains: value, mode: "insensitive" } } },
                            { student: { name: { contains: value, mode: "insensitive" } } },
                        ];
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
            query.OR = [
                { exam: { lesson: { teacherId: currentUserId! } } },
                { assignment: { lesson: { teacherId: currentUserId! } } },
            ];
            break;

        case "student":
            query.studentId = currentUserId!;
            break;

        case "parent":
            query.student = {
                parentId: currentUserId!,
            };
            break;
        default:
            break;
    }

    let orderBy: any = [
        { exam: { startTime: "desc" } },
        { assignment: { startDate: "desc" } }
    ];

    const shouldSortTransformed = sort !== undefined;

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
                                subject: { select: { name: true } } ,
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

    if (shouldSortTransformed && sort) {
        data.sort((a, b) => {
            const aValue = a.title.toLowerCase();
            const bValue = b.title.toLowerCase();

            if (sort === "asc") {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });
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
                            dataToExport={data} // Pasezi datele colectate de server
                            headerDetails={{ // Pasezi detaliile de antet (opțional)
                                companyName: "Numele Școlii Tale",
                                companyAddress: "Adresa Școlii Tale, Oraș, Țară",
                            }}
                        />

                         {/* <button 
                            onClick={handleExportPdf} 
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow">
                            <Image src="/download.png" alt="" width={19} height={19} />
                            
                        </button>  */}

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