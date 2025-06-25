"use client"

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

interface SortButtonProps {
    currentSort?: string;
}

const SortButton = ({ currentSort }: SortButtonProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSort = () => {
        const params = new URLSearchParams(searchParams);
        
        if (!currentSort || currentSort === "desc") {
            params.set("sort", "asc");
        } else {
            params.set("sort", "desc");
        }
        
        params.delete("page");
        
        router.push(`${window.location.pathname}?${params}`);
    };

    return (
        <button 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow hover:bg-yellow/80 transition-colors"
            onClick={handleSort}
            title={`Sort ${currentSort === "asc" ? "descending" : "ascending"}`}
        >
            <Image src="/sort.png" alt="Sort" width={14} height={14} />
        </button>
    );
};

export default SortButton;