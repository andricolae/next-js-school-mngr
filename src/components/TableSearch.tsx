'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTransition } from "react";
import ReactDOM from "react-dom";
import dynamic from "next/dynamic";
const LoadingPopup = dynamic(() => import("@/components/LoadingPopup"), { ssr: false });

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
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [search]);

    return (
        <form onSubmit={(e) => e.preventDefault()} className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
            <img src="/search.svg" alt="" width={14} height={14} />
            <input
                type="text"
                placeholder="Căutare..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[200px] p-2 bg-transparent outline-none"
            />
            {isPending &&
                typeof window !== "undefined" &&
                ReactDOM.createPortal(<LoadingPopup />, document.getElementById("global-loading-root")!)
            }
        </form>
    );
};

export default TableSearch;
