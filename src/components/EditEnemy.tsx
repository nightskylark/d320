import { useState, useEffect, useCallback, useRef } from "react";
import { doc, updateDoc, deleteField, FieldValue } from "firebase/firestore";
import { db } from "../firebase";
import { XMarkIcon } from "@heroicons/react/24/outline";
import DraftSwitch from "./DraftSwitch";
import ImageDropZone from "./ImageDropZone";
import EnemyFields from "./EnemyFields";
import type { Enemy } from "../types";

interface Props {
  enemy: Enemy;
  onClose: () => void;
}

const EditEnemy: React.FC<Props> = ({ enemy, onClose }) => {
  const [name, setName] = useState<string>(enemy.name);
  const [customDescription, setCustomDescription] = useState<string>(enemy.customDescription);
  const [selectedTags, setSelectedTags] = useState<string[]>(enemy.tags || []);
  const [imageURL, setImageURL] = useState<string>(enemy.imageURL || "");
  const [imageURL2, setImageURL2] = useState<string>(enemy.imageURL2 || "");
  const [draft, setDraft] = useState<boolean>(enemy.draft ?? true);
  const [publishError, setPublishError] = useState("");
  const initialRender = useRef(true);
  const handleDraftChange = (newDraft: boolean) => {
    if (!newDraft && !imageURL) {
      setPublishError("Чтобы опубликовать, загрузите основное изображение");
      return;
    }
    setPublishError("");
    setDraft(newDraft);
  };

  useEffect(() => {
    if (imageURL && publishError) {
      setPublishError("");
    }
  }, [imageURL, publishError]);

  const saveChanges = useCallback(async () => {
    const enemyDocRef = doc(db, "eotv-enemies", enemy.id!);
    const updatedEnemy: Partial<Omit<Enemy, 'draft'>> & { draft?: boolean | FieldValue } = {
      name,
      customDescription,
      tags: selectedTags,
      imageURL,
      imageURL2,
      draft: !!draft
    };
    if (!enemy.createdAt) {
      updatedEnemy.createdAt = new Date().toISOString();
    }
    await updateDoc(enemyDocRef, updatedEnemy);
  }, [enemy.id, name, customDescription, selectedTags, imageURL, imageURL2, draft]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      saveChanges();
    }, 800);

    return () => clearTimeout(timeout);
  }, [name, customDescription, selectedTags, imageURL, imageURL2, draft, saveChanges]);


  return (
    <div className="relative bg-white dark:bg-gray-900 rounded-2xl w-full flex flex-col sm:flex-row shadow-lg h-full max-w-7xl overflow-hidden">
      <ImageDropZone imageURL={imageURL} setImageURL={setImageURL} ownerUid={enemy.authorUid} />
      <EnemyFields
        name={name}
        setName={setName}
        customDescription={customDescription}
        setCustomDescription={setCustomDescription}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
      >
        <div className="flex flex-col gap-2 py-2">
          <div>
            <DraftSwitch draft={draft} setDraft={handleDraftChange} />
          </div>
          {publishError && (
            <span className="text-xs text-red-600" role="alert">{publishError}</span>
          )}
        </div>
      </EnemyFields>
      <ImageDropZone
        imageURL={imageURL2}
        setImageURL={setImageURL2}
        ownerUid={enemy.authorUid}
        placeholder="/eotv-enemy-location-placeholder.png"
      />

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
