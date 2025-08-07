'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'; //linie noua 
import LoadingPopup from "@/components/LoadingPopup";
import { useTransition } from "react";

const TableSearch = () => {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            startTransition(() => {
                const params = new URLSearchParams(window.location.search);

                if (search.trim() === '') {
                    params.delete('search');
                } else {
                    params.set('search', search.trim());
                }

                router.push(`${window.location.pathname}?${params.toString()}`);
            });
        }, 300); // debounce 300ms

        return () => clearTimeout(delayDebounce);
    }, [search]);

    return (
        <form onSubmit={(e) => e.preventDefault()} className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
            <Image src="/search.png" alt="" width={14} height={14} />
            <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[200px] p-2 bg-transparent outline-none"
            />
            {isPending && <LoadingPopup />}
        </form>
    );
};

export default TableSearch;
