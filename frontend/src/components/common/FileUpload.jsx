import React, { useRef, useState } from 'react';
import {
  DocumentIcon,
  PhotoIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

const FileUpload = ({ onFileSelect, type = "pdf", description = "" }) => {

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  return (

    <div
      onClick={() => fileInputRef.current.click()}
      className="border border-slate-700 rounded-xl p-10 flex flex-col items-center justify-center gap-5 cursor-pointer transition hover:border-indigo-500/40 hover:bg-slate-900/40"
    >

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept={type === 'pdf' ? '.pdf' : 'image/*'}
      />

      {/* Icon */}

      <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700">

        {type === 'pdf' ? (
          <DocumentIcon className="w-7 h-7 text-indigo-400" />
        ) : (
          <PhotoIcon className="w-7 h-7 text-indigo-400" />
        )}

      </div>

      {/* Upload Text */}

      <div className="text-center space-y-1">

        <p className="text-slate-100 font-medium">

          {selectedFile
            ? selectedFile.name
            : `Upload ${type.toUpperCase()} for Analysis`
          }

        </p>

        <p className="text-sm text-slate-500">

          {description ||
            (type === "pdf"
              ? "Upload suspicious documents or certificates"
              : "Upload screenshots or suspicious images")
          }

        </p>

      </div>

      {/* Upload Button */}

      <div className="flex items-center gap-2 text-sm text-slate-400">

        <CloudArrowUpIcon className="w-4 h-4" />
        <span>Select file</span>

      </div>

    </div>
  );
};

export default FileUpload;