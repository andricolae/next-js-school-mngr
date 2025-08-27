'use client';

import { useAuth } from "@clerk/nextjs";
import { usePathname } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import { TokenData } from "@/lib/utils";

const menuItems = [
    {
        icon: "/home.png",
        label: "Acasă",
        href: "/",
        visible: ["admin", "teacher", "student", "parent"],
    },
    {
        icon: "/teacher.png",
        label: "Profesori",
        href: "/list/teachers",
        visible: ["admin", "teacher"],
    },
    {
        icon: "/student.png",
        label: "Elevi",
        href: "/list/students",
        visible: ["admin", "teacher"],
    },
    {
        icon: "/parent.png",
        label: "Părinți",
        href: "/list/parents",
        visible: ["admin", "teacher"],
    },
    {
        icon: "/subject.png",
        label: "Materii",
        href: "/list/subjects",
        visible: ["admin"],
    },
    {
        icon: "/class.png",
        label: "Clase",
        href: "/list/classes",
        visible: ["admin", "teacher"],
    },
    {
        icon: "/lesson.png",
        label: "Ore",
        href: "/list/lessons",
        visible: ["admin", "teacher"],
    },
    {
        icon: "/exam.png",
        label: "Teste",
        href: "/list/exams",
        visible: ["admin", "teacher", "student", "parent"],
    },
    {
        icon: "/assignment.png",
        label: "Teme",
        href: "/list/assignments",
        visible: ["admin", "teacher", "student", "parent"],
    },
    {
        icon: "/result.png",
        label: "Rezultate",
        href: "/list/results",
        visible: ["admin", "teacher", "student", "parent"],
    },
    {
        icon: "/attendance.png",
        label: "Prezență",
        href: "/list/attendance",
        visible: ["admin", "teacher", "student", "parent"],
    },
    {
        icon: "/calendar.png",
        label: "Evenimente",
        href: "/list/events",
        visible: ["admin", "teacher", "student", "parent"],
    },
    {
        icon: "/announcement.png",
        label: "Anunțuri",
        href: "/list/announcements",
        visible: ["admin", "teacher", "student", "parent"],
    },
];

const Menu = () => {
    const { userId, sessionClaims } = useAuth();
    const currentPath = usePathname();

    let tokenData;
    if (sessionClaims !== null) {
        tokenData = sessionClaims as unknown as TokenData;
    }
    let role = tokenData?.userPblcMtdt?.role;

    const isActiveLink = (href: string) => {
        if (!currentPath) return false;

        if (href === "/") {
            return !currentPath.startsWith("/list");
        }
        return currentPath === href || currentPath.startsWith(href + "/");
    };


    return (
        <div className="mt-4 text-sm">
            {menuItems.map((item) => {
                if (item.visible.includes(role!)) {
                    const isActive = isActiveLink(item.href);
                    return (
                        <div className="my-2" key={item.label}>
                            <Link href={item.href}
                                key={item.label}
                                className={`flex items-center justify-center lg:justify-start gap-4 py-2 md:px-2 rounded-md transition-colors ${isActive
                                    ? "bg-skyLight text-sky-600 font-medium"
                                    : "text-gray-500 hover:bg-skyLight"
                                    }`}
                            >
                                <Image src={item.icon} alt="" width={20} height={20} />
                                <span className="hidden lg:block">{item.label}</span>
                            </Link>
                        </div>
                    )
                }
            })}
        </div>
    )
}

export default Menu