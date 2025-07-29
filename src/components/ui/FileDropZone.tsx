import { useState } from "react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

interface FileDropZoneProps {
  currentFileUrl?: string;
  onFileUpload: (file: File, setProgress: (progress: number) => void) => Promise<void>;
  className?: string;
  accept?: string;
  placeholder?: string;
  placeholderImage?: string;
  showProgress?: boolean;
  children?: React.ReactNode;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
  currentFileUrl,
  onFileUpload,
  className = '',
  accept = "image/*",
  placeholder = "Click or drag file here",
  placeholderImage,
  showProgress = true,
  children
}) => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    
    setIsUploading(true);
    setProgress(0);
    
    try {
      await onFileUpload(file, setProgress);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const displayImage = currentFileUrl || placeholderImage;

  return (
    <div
      className={`flex items-center justify-center bg-gray-200 dark:bg-gray-800 relative overflow-hidden group ${className}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {displayImage && (
        <img 
          src={displayImage} 
          className="object-cover w-full h-full" 
          alt="" 
        />
      )}
      
      <input
        type="file"
        accept={accept}
        onChange={(e) => handleFile(e.target.files?.[0] || null)}
        className="absolute inset-0 opacity-0 cursor-pointer"
        disabled={isUploading}
      />
      
      {children || (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-gray-300 bg-black/40 opacity-100 pointer-events-none z-10">
          <ArrowUpTrayIcon className="w-8 h-8" />
          <span className="text-xs">{placeholder}</span>
        </div>
      )}
      
      {showProgress && progress > 0 && progress < 100 && (
        <span className="absolute bottom-2 left-2 text-xs bg-black/60 px-1 rounded">
          {progress.toFixed(0)}%
        </span>
      )}
    </div>
  );
};

export default FileDropZone;
