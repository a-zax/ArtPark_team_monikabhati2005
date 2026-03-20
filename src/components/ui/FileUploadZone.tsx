"use client";

import { motion } from "framer-motion";
import { UploadCloud, File, X } from "lucide-react";
import { useState, useRef } from "react";

interface FileUploadZoneProps {
  accept: string;
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export default function FileUploadZone({ accept, onFileSelect, selectedFile }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  if (selectedFile) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative flex flex-col items-center justify-center h-[300px] glass-panel rounded-2xl border-primary/40 bg-primary/5 overflow-hidden"
      >
        <div className="absolute top-4 right-4 cursor-pointer p-2 bg-black/40 rounded-full hover:bg-black/60 transition-colors" onClick={() => onFileSelect(null)}>
          <X className="w-4 h-4 text-slate-300" />
        </div>
        <File className="w-16 h-16 text-primary mb-4" />
        <p className="text-lg font-semibold text-white truncate max-w-[80%]">{selectedFile.name}</p>
        <p className="text-sm text-slate-400 mt-2">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex flex-col items-center justify-center h-[300px] rounded-2xl border-2 border-dashed cursor-pointer transition-colors duration-300
        ${isDragging ? 'border-primary bg-primary/10' : 'border-slate-700 bg-white/5 hover:border-slate-500 hover:bg-white/10'}`}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef}
        accept={accept}
        onChange={handleFileChange}
      />
      <div className="p-4 rounded-full bg-slate-800/50 mb-4">
        <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-primary' : 'text-slate-400'}`} />
      </div>
      <p className="text-lg font-medium text-slate-200">
        Click or drag file to upload
      </p>
      <p className="text-sm text-slate-500 mt-2 text-center max-w-[80%]">
        Supported formats: PDF, DOCX, TXT. <br /> Max size: 5MB
      </p>
    </motion.div>
  );
}
