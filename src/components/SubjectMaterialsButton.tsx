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
            className="
                inline-flex
                items-center
                justify-center
                w-7
                h-7
                rounded-full
                bg-sky
                /* hover:bg-blue-700*/
                transition-all
                duration-200
                shadow-md
                hover:shadow-lg
                hover:scale-105
            "
        >
            <img
                src="/viewMaterials.png"
                alt="Vezi material"
                className="w-5 h-5 object-contain"
            />
        </a>
    );
};

export default SubjectMaterialsButton;