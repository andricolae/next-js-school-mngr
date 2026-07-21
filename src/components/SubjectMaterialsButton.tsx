"use client";

import { useState } from "react";
import Image from "next/image";

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
        className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-sky hover:opacity-90 transition-opacity"
      >
        <Image
          src="/viewMaterials.png"
          alt="Vezi materiale"
          width={16}
          height={16}
        />
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
                  onClick={() => navigator.clipboard.writeText(file)}
                  title="Copiază link-ul"
                  className="flex-shrink-0"
                >
                  <Image
                    src="/copy.svg"
                    alt="Copy"
                    width={18}
                    height={18}
                  />
                </button>

                <a
                  href={file}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Descarcă documentul"
                  className="flex-shrink-0"
                >
                  <Image
                    src="/download.svg"
                    alt="Download"
                    width={18}
                    height={18}
                  />
                </a>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                Niciun material încărcat.
              </p>
            )}

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4"
              title="Închide"
            >
              <Image
                src="/close.svg"
                alt="Închide"
                width={14}
                height={14}
              />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SubjectMaterialsButton;