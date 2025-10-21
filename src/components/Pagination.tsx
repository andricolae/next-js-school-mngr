"use client"

import { ITEM_PER_PAGE } from "@/lib/settings";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import dynamic from "next/dynamic";
import ReactDOM from "react-dom";
const LoadingPopup = dynamic(() => import("@/components/LoadingPopup"), { ssr: false });


const Pagination = ({ page, count }: { page: number; count: number }) => {

    const router = useRouter()

    const hasPrev = ITEM_PER_PAGE * (page - 1) > 0;
    const hasNext = ITEM_PER_PAGE * (page - 1) + ITEM_PER_PAGE < count;
    const [isPending, startTransition] = useTransition();

    const changePage = (newPage: number) => {
        startTransition(() => {
            const params = new URLSearchParams(window.location.search);
            params.set("page", newPage.toString());
            router.push(`${window.location.pathname}?${params}`);
        });
    }

    return (
        <div className='p-4 flex items-center justify-between text-gray-400'>
            <button
                disabled={!hasPrev}
                className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => changePage(page - 1)}
            >
                Înapoi
            </button>
            {isPending &&
                typeof window !== "undefined" &&
                ReactDOM.createPortal(<LoadingPopup />, document.getElementById("global-loading-root")!)
            }
            <div className="flex items-center gap-2">
                {Array.from(
                    { length: Math.ceil(count / ITEM_PER_PAGE) },
                    (_, index) => {
                        const pageIndex = index + 1;
                        return (
                            <button
                                key={pageIndex}
                                className={`px-2 rounded-sm ${page === pageIndex ? "bg-sky" : ""}`}
                                onClick={() => changePage(pageIndex)}
                            >
                                {pageIndex}
                            </button>
                        );
                    }
                )}
            </div>
            <button
                disabled={!hasNext}
                className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => changePage(page + 1)}
            >
                Înainte
            </button>
        </div>
    )
}

export default Pagination