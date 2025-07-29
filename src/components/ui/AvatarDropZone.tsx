import { uploadAvatar } from "../../shared/utils/uploadAvatar";
import FileDropZone from "./FileDropZone";

interface Props {
  avatarURL: string;
  setAvatarURL: (url: string) => void;
  ownerUid: string;
  className?: string;
}

const AvatarDropZone: React.FC<Props> = ({ 
  avatarURL, 
  setAvatarURL, 
  ownerUid, 
  className = ""
}) => {
  const handleUpload = (file: File, setProgress: (progress: number) => void) => {
    return uploadAvatar(ownerUid, file, setAvatarURL, setProgress);
  };

  return (
    <FileDropZone
      currentFileUrl={avatarURL}
      onFileUpload={handleUpload}
      className={className}
      accept="image/*"
      placeholder="Нажмите или перетащите файл"
    />
  );
};

export default AvatarDropZone;
