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
  const handleUpload = async (
    file: File,
    setProgress: (progress: number) => void
  ) => {
    const url = await uploadAvatar(ownerUid, file, setProgress);
    setAvatarURL(url);
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
