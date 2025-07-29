import { useState } from "react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { uploadAvatar } from "../../shared/utils/uploadAvatar";

interface Props {
  avatarURL: string;
  setAvatarURL: (url: string) => void;
  ownerUid: string;
  className?: string;
}

const AvatarDropZone: React.FC<Props> = ({ avatarURL, setAvatarURL, ownerUid, className }) => {
  const [progress, setProgress] = useState(0);

  const handleFile = (file: File | null) => {
    if (!file) return;
    uploadAvatar(ownerUid, file, setAvatarURL, setProgress);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      className={`flex items-center justify-center bg-gray-200 dark:bg-gray-800 relative overflow-hidden group ${className || ''}`}
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {avatarURL && <img src={avatarURL} className="object-cover w-full h-full" alt="" />}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files && e.target.files[0])}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-gray-300 bg-black/40 opacity-100 pointer-events-none z-10">
        <ArrowUpTrayIcon className="w-8 h-8" />
        <span className="text-xs">Нажмите или перетащите файл</span>
      </div>
      {progress > 0 && progress < 100 && (
        <span className="absolute bottom-2 left-10 text-xs bg-black/60 px-1 rounded">
          {progress.toFixed(0)}%
        </span>
      )}
    </div>
  );
};

export default AvatarDropZone;
