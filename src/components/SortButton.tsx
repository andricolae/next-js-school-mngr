"use client"

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import ReactDOM from "react-dom";
import dynamic from "next/dynamic";
const LoadingPopup = dynamic(() => import("@/components/LoadingPopup"), { ssr: false });

interface SortButtonProps {
    currentSort?: string;
}

const SortButton = ({ currentSort }: SortButtonProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const handleSort = async () => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams);

            if (!currentSort || currentSort === "desc") {
                params.set("sort", "asc");
            } else {
                params.set("sort", "desc");
            }
            params.delete("page");

            router.push(`${window.location.pathname}?${params}`);
        });
    };

    return (
        <>
            {isPending &&
                typeof window !== "undefined" &&
                ReactDOM.createPortal(<LoadingPopup />, document.getElementById("global-loading-root")!)
            }
            <button
                className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow hover:bg-yellow/80 transition-colors"
                onClick={handleSort}
                title={`Sort ${currentSort === "asc" ? "descending" : "ascending"}`}
            >
                <img src="/sort.svg" alt="Sort" width={14} height={14} />
            </button>
        </>
    );
};

export default SortButton;