"use client";

const SubjectMaterialsButton = ({ file }: { file: string | null }) => {
    if (!file) {
        return <span className="text-gray-400">-</span>;
    }
    return (
        <a 
            href={file}
            target="_blank"
            rel="noopener noreferrer"
            title="Vezi material"
            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-skyLight hover:bg-sky transition-colors"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600"
            >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
        </a>
    );
};

export default SubjectMaterialsButton;