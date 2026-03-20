"use client";

import { motion } from "framer-motion";
import { File, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";

interface FileUploadZoneProps {
  accept: string;
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export default function FileUploadZone({
  accept,
  onFileSelect,
  selectedFile,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => fileInputRef.current?.click();

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      onFileSelect(event.dataTransfer.files[0]);
    }
  };

  if (selectedFile) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative flex h-[300px] flex-col items-center justify-center overflow-hidden rounded-[24px] border border-primary/30 bg-primary/8"
      >
        <button
          type="button"
          onClick={() => onFileSelect(null)}
          className="absolute right-4 top-4 rounded-full bg-black/35 p-2 text-slate-300 transition-colors hover:bg-black/55 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mb-4 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-primary">
          <File className="h-10 w-10" />
        </div>
        <p className="max-w-[80%] truncate text-lg font-semibold text-white">{selectedFile.name}</p>
        <p className="mt-2 text-sm text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
        <p className="mt-4 text-sm text-slate-400">Resume file attached. You can keep or replace it.</p>
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={openPicker}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`flex h-[300px] w-full flex-col items-center justify-center rounded-[24px] border-2 border-dashed px-6 text-center transition-colors ${
        isDragging
          ? "border-primary bg-primary/10"
          : "border-slate-700 bg-white/5 hover:border-slate-500 hover:bg-white/8"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={(event) => {
          if (event.target.files && event.target.files.length > 0) {
            onFileSelect(event.target.files[0]);
          }
        }}
      />
      <div className="mb-4 rounded-full border border-white/10 bg-slate-900/70 p-4">
        <UploadCloud className={`h-10 w-10 ${isDragging ? "text-primary" : "text-slate-400"}`} />
      </div>
      <p className="text-lg font-semibold text-slate-100">Click or drag a resume file here</p>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-400">
        Supported formats: PDF, DOCX, TXT. Maximum upload size: 5 MB.
      </p>
    </motion.button>
  );
}
