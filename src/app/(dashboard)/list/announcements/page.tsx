import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Announcement, Class, Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import SortButton from "@/components/SortButton";
import { TokenData } from "@/lib/utils";

type AnnouncementList = Announcement & { class: Class };
const AnnouncementListPage = async ({
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

	const columns = [
		{
			header: "Title",
			accessor: "title",
		},
		{
			header: "Description",
			accessor: "description",
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
		...(role === "admin"
			? [
				{
					header: "Actions",
					accessor: "action",
				},
			]
			: []),
	];

	const renderRow = (item: AnnouncementList) => (
		<tr
			key={item.id}
			className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-skyLight"
		>
			<td className="flex items-center gap-4 p-4">{item.title}</td>
			<td>{item.description}</td>
			<td>
				{item.classId === null
				  ? "School-wide announcement"
				  : item.class?.name || "-"}
			</td>
			<td className="hidden md:table-cell">
				{new Intl.DateTimeFormat("en-US").format(item.date)}
			</td>
			<td>
				<div className="flex items-center gap-2">
					{role === "admin" && (
						<>
							<FormContainer table="announcement" type="delete" id={item.id} />
							<FormContainer table="announcement" type="update" data={item} />
						</>
					)}
				</div>
			</td>
		</tr>
	);
	const { page, sort, ...queryParams } = searchParams;

	const p = page ? parseInt(page) : 1;

	const query: Prisma.AnnouncementWhereInput = {};

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

	const roleConditions = {
		teacher: { lessons: { some: { teacherId: currentUserId! } } },
		student: { students: { some: { id: currentUserId! } } },
		parent: { students: { some: { parentId: currentUserId! } } },
	};

	query.OR = [
		{ classId: null },
		{ class: roleConditions[role as keyof typeof roleConditions] || {}, },
	];

	let orderBy: any = { date: "desc" };
	if (sort) {
		orderBy = sort === "asc" ? { title: "asc" } : { title: "desc" };
	}

	const [data, count] = await prisma.$transaction([
		prisma.announcement.findMany({
			orderBy,
			where: {
				...(role !== "admin" && {
					OR: [
						{ classId: null },
						{ class: roleConditions[role as keyof typeof roleConditions] || {} }
					],
				})
			},
			include: {
				class: true,
			},
			take: ITEM_PER_PAGE,
			skip: ITEM_PER_PAGE * (p - 1),
		}),
		prisma.announcement.count({
			where: {
				...(role !== "admin" && {
					OR: [
						{ classId: null },
						{ class: roleConditions[role as keyof typeof roleConditions] || {} }
					],
				})
			},
		}),
	]);

	return (
		<div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
			<div className="flex items-center justify-between">
				<h1 className="hidden md:block text-lg font-semibold">
					All Announcements
				</h1>
				<div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
					<TableSearch />
					<div className="flex items-center gap-4 self-end">
						{/* <button className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow">
                            <Image src="/filter.png" alt="" width={14} height={14} />
                        </button> */}
						{/* <button className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow">
                            <Image src="/sort.png" alt="" width={14} height={14} />
                        </button> */}
						<SortButton currentSort={sort} />
						{role === "admin" && (
							<FormContainer table="announcement" type="create" />
						)}
					</div>
				</div>
			</div>
			<Table columns={columns} renderRow={renderRow} data={data} />
			<Pagination page={p} count={count} />
		</div>
	);
};

export default AnnouncementListPage;