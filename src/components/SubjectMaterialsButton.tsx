"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { deleteSubjectMaterial } from "@/lib/actions";
import PdfPreviewModal from "@/components/PdfPreviewModal";

const SubjectMaterialsButton = ({
  file,
  subjectName,
  subjectId,
  canManage,
}: {
  file: string | null;
  subjectName: string;
  subjectId: number;
  canManage: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async (index: number) => {
    const result = await deleteSubjectMaterial(subjectId, index);
    if (result.error) {
      toast.error("Eroare la ștergerea materialului.");
    } else {
      toast.success("Material șters cu succes.");
      router.refresh();
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Vezi materiale"
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
      </button>

      {open && (
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-md relative w-fit max-w-[90%] p-5 h-fit overflow-y-auto">
            <h2 className="text-sm font-semibold mb-3">
              Materiale — {subjectName}
            </h2>

            {(() => {
              const materials = file
                ? file
                    .split("||")
                    .filter(Boolean)
                    .map((entry) => {
                      const [title, url, sizeBytesStr] = entry.split("^^");
                      return {
                        title: title ?? "",
                        url: url ?? "",
                        sizeBytes: Number(sizeBytesStr) || 0,
                      };
                    })
                : [];

              if (materials.length === 0) {
                return (
                  <p className="text-gray-400 text-sm">
                    Niciun material încărcat.
                  </p>
                );
              }

              return (
                <div className="flex flex-wrap gap-4">
                  {materials.map((m, i) => (
                    <div key={i} className="relative">
                      <PdfPreviewModal url={m.url} label={m.title} />
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => handleDelete(i)}
                          title="Șterge material"
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow hover:bg-red-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}

            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <img src="/close.svg" alt="" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default SubjectMaterialsButton;
