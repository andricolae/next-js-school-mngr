"use client";

import { useState } from "react";

const SubjectMaterialsButton = ({
  file,
  subjectName,
}: {
  file: string | null;
  subjectName: string;
}) => {
  const [open, setOpen] = useState(false);

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
          <div className="bg-white rounded-md relative w-[30%] p-5 h-fit overflow-y-auto">
            <h2 className="text-sm font-semibold mb-3">
              Materiale — {subjectName}
            </h2>

            {file ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-gray-50 rounded-md text-sm truncate">
                  {file}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(file);
                  }}
                  title="Copiază link-ul"
                  className="flex-shrink-0"
                >
                  <img
                    src="/copy.svg"
                    alt="copy icon"
                    width={18}
                    height={18}
                  ></img>
                </button>

                <div className="flex items-center gap-2">
                  {/*buton de preview */}

                  <a
                    href={file}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Descarcă documentul"
                  >
                    <img
                      src="/download.svg"
                      alt="download icon"
                      width={18}
                      height={18}
                    />
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Niciun material încărcat.</p>
            )}

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
