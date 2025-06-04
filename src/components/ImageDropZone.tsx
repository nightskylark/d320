import { useState } from "react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { uploadImage } from "../utils/uploadImage";

interface Props {
  imageURL: string;
  setImageURL: (url: string) => void;
  ownerUid: string;
  className?: string;
}

const ImageDropZone: React.FC<Props> = ({ imageURL, setImageURL, ownerUid, className }) => {
  const [progress, setProgress] = useState(0);

  const handleFile = (file: File | null) => {
    if (!file) return;
    uploadImage(ownerUid, file, setImageURL, setProgress);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      className={`w-3/14 flex items-center justify-center bg-gray-800 relative overflow-hidden group ${className || ""}`}
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {imageURL && <img src={imageURL} className="object-cover w-full h-full" alt="" />}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files && e.target.files[0])}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-gray-300 bg-black/40 opacity-0 group-hover:opacity-100 pointer-events-none transition z-10">
        <ArrowUpTrayIcon className="w-8 h-8" />
        <span className="text-xs">Нажмите или перетащите файл</span>
      </div>
      {progress > 0 && progress < 100 && (
        <span className="absolute bottom-2 left-2 text-xs bg-black/60 px-1 rounded">
          {progress.toFixed(0)}%
        </span>
      )}
    </div>
  );
};

export default ImageDropZone;
