import { useState, useEffect, useCallback, useRef } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { storage, db } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { XMarkIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import TagBox from "./TagBox";
import type { Enemy } from "../types";

interface Props {
  enemy: Enemy;
  onClose: () => void;
}

const EditEnemy: React.FC<Props> = ({ enemy, onClose }) => {
  const [name, setName] = useState<string>(enemy.name);
  const [customDescription, setCustomDescription] = useState<string>(enemy.customDescription);
  const [selectedTags, setSelectedTags] = useState<string[]>(enemy.tags || []);
  const [customTags, setCustomTags] = useState<string[]>(enemy.customTags || []);
  const [imageURL, setImageURL] = useState<string>(enemy.imageURL || "");
  const [imageURL2, setImageURL2] = useState<string>(enemy.imageURL2 || "");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadProgress2, setUploadProgress2] = useState<number>(0);
  const initialRender = useRef(true);

  const handleImageUpload = useCallback(
    async (
      image: File | null,
      setImageURL: (url: string) => void,
      setProgress: (p: number) => void
    ) => {
      if (!image) return;

      const storageRef = ref(storage, `enemies/${enemy.authorUid}/${image.name}`);
      const uploadTask = uploadBytesResumable(storageRef, image);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.error("Ошибка загрузки:", error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setImageURL(downloadURL);
        }
      );
    },
    [enemy.authorUid]
  );

  const saveChanges = useCallback(async () => {
    const enemyDocRef = doc(db, "eotv-enemies", enemy.id);
    const updatedEnemy: Partial<Enemy> = {
      name,
      customDescription,
      tags: selectedTags,
      customTags,
      imageURL,
      imageURL2,
    };
    await updateDoc(enemyDocRef, updatedEnemy);
  }, [enemy.id, name, customDescription, selectedTags, customTags, imageURL, imageURL2]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      saveChanges();
    }, 800);

    return () => clearTimeout(timeout);
  }, [name, customDescription, selectedTags, customTags, imageURL, imageURL2, saveChanges]);

  const onFileSelect = (file: File | null, side: "left" | "right") => {
    if (side === "left") {
      handleImageUpload(file, setImageURL, setUploadProgress);
    } else {
      handleImageUpload(file, setImageURL2, setUploadProgress2);
    }
  };

  const renderDropZone = (
    currentUrl: string,
    progress: number,
    onSelect: (file: File | null) => void,
    side: "left" | "right"
  ) => (
    <div
      className="w-3/14 flex items-center justify-center bg-gray-800 relative overflow-hidden group"
      onDrop={(e) => {
        e.preventDefault();
        onSelect(e.dataTransfer.files[0]);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      {currentUrl && (
        <img src={currentUrl} className="object-cover w-full h-full" alt="" />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onSelect(e.target.files && e.target.files[0])}
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

  return (
    <div className="relative bg-gray-900 rounded-2xl w-full flex shadow-lg h-full max-w-7xl overflow-hidden">
      {renderDropZone(imageURL, uploadProgress, (f) => onFileSelect(f, "left"), "left")}
      <div className="w-4/7 flex flex-col px-6 h-full overflow-y-auto">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mt-4 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-neonBlue"
        />
        <textarea
          value={customDescription}
          onChange={(e) => setCustomDescription(e.target.value)}
          className="w-full p-2 mt-4 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-neonBlue flex-1 resize-none"
        />
        <TagBox
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          customTags={customTags}
          setCustomTags={setCustomTags}
        />
      </div>
      {renderDropZone(imageURL2, uploadProgress2, (f) => onFileSelect(f, "right"), "right")}

      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-300 hover:text-white cursor-pointer"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
    </div>
  );
}

export default EditEnemy;
