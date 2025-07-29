import { uploadImage } from "../../shared/utils/uploadImage";
import FileDropZone from "./FileDropZone";

interface Props {
  imageURL: string;
  setImageURL: (url: string) => void;
  ownerUid: string;
  className?: string;
  placeholder?: string;
}

const ImageDropZone: React.FC<Props> = ({ 
  imageURL, 
  setImageURL, 
  ownerUid, 
  className = "w-full sm:w-1/4",
  placeholder
}) => {
  const handleUpload = (file: File, setProgress: (progress: number) => void) => {
    return uploadImage(ownerUid, file, setImageURL, setProgress);
  };

  return (
    <FileDropZone
      currentFileUrl={imageURL}
      onFileUpload={handleUpload}
      className={className}
      accept="image/*"
      placeholder="Нажмите или перетащите файл"
      placeholderImage={placeholder || "/eotv-enemy-placeholder.png"}
    />
  );
};

export default ImageDropZone;
