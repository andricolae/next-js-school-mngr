"use client"

import { useState } from "react";

const getPdfThumbnailUrl = (url: string) => {
    if (!url) return "";
    return url.replace(/\.pdf(\?|$)/i, ".png$1");
};

const getFileNameFromUrl = (url: string) => {
    if (!url) return "Document";
    try {
        const decodedUrl = decodeURIComponent(url);
        const parts = decodedUrl.split("/");
        const fileNameWithExt = parts[parts.length - 1];
        const fileName = fileNameWithExt.split("?")[0].replace(/\.pdf$/i, "");
        return fileName.replace(/[-_]/g, " ");
    } catch {
        return "Material Curs";
    }
};

const PdfPreviewModal = ({
    url,
    label,
}: {
    url: string;
    label?: string;
}) => {
    const [open, setopen] = useState(false);
    const displayTitle = label || getFileNameFromUrl(url);

    return (
        <>
            
            <div
                onClick={() => setopen(true)}
                className="group flex flex-col items-center gap-2 cursor-pointer flex-shrink-0 transition-all duration-300 w-36"
            >
               
                <div className="w-36 h-48 relative rounded-lg shadow-md border border-gray-200 bg-white overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                    <img
                        src={getPdfThumbnailUrl(url)}
                        alt={displayTitle}
                        className="w-full h-full object-contain p-1" 
                        onError={(e) => {
                           
                            (e.target as HTMLImageElement).src = "https://placehold.co/150x200/ffffff/000000?text=PDF";
                        }}
                    />
                </div>

                <span 
                    className="text-blue-600 font-semibold text-xs text-center line-clamp-2 hover:underline leading-tight w-full px-1"
                    title={displayTitle}
                >
                    {displayTitle}
                </span>
            </div>

           
            {open && (
                <div
                    className="w-screen h-screen fixed left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
                    onClick={() => setopen(false)}
                >
                    <div
                        className="bg-white rounded-md relative w-[95%] sm:w-[750px] h-[85%] p-4 flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-gray-600 truncate pr-4">{displayTitle}</span>
                            <div className="flex items-center gap-4 flex-shrink-0">
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-2 px-3 border border-blue-500 rounded shadow transition"
                                >
                                    Deschide în tab nou
                                </a>
                                <div
                                    className="cursor-pointer p-1 hover:bg-gray-100 rounded"
                                    onClick={() => setopen(false)}
                                >
                                    <img src="/close.svg" alt="Close" className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                        <iframe
                            src={url}
                            title="Previzualizare PDF"
                            className="w-full h-full border rounded-md"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default PdfPreviewModal;