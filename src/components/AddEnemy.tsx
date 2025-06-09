import { useState, useEffect, useRef } from "react";
import { addDoc } from "firebase/firestore";
import { enemiesCollection } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import ImageDropZone from "./ImageDropZone";
import EnemyFields from "./EnemyFields";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import DraftSwitch from "./DraftSwitch";
import LoginPrompt from "./LoginPrompt";
import type { Enemy } from "../types";

const AddEnemy: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [name, setName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imageURL, setImageURL] = useState("");
  const [imageURL2, setImageURL2] = useState("");
  const [draft, setDraft] = useState(true);
  const [publishError, setPublishError] = useState("");
  const handleDraftChange = (newDraft: boolean) => {
    if (!newDraft && !imageURL) {
      setPublishError("Чтобы опубликовать, загрузите основное изображение");
      return;
    }
    setPublishError("");
    setDraft(newDraft);
  };
  const user = useAuth();
  const formRef = useRef<HTMLFormElement | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!draft && !imageURL) {
      setPublishError("Чтобы опубликовать, загрузите основное изображение");
      return;
    }
    const newEnemy: Enemy = {
      name,
      customDescription,
      tags: selectedTags,
      imageURL,
      imageURL2,
      authorUid: user.uid,
      likedBy: [],
      createdAt: new Date().toISOString(),
      ...(draft ? { draft: true } : {})
    };
    await addDoc(enemiesCollection, newEnemy);
    setIsOpen(false);
    setName("");
    setCustomDescription("");
    setSelectedTags([]);
    setImageURL("");
    setImageURL2("");
    setDraft(true);
    setPublishError("");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    } else {
      setPublishError("");
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  if (loginPrompt) {
    return (
      <LoginPrompt
        open={loginPrompt}
        onClose={() => setLoginPrompt(false)}
        onSuccess={() => setIsOpen(true)}
        message="Для добавления врага необходима авторизация"
      />
    );
  }

  if (!isOpen) {
    return (
      <div
        role="button"
        tabIndex={0}
        className="group relative flex flex-col items-center justify-center bg-white text-gray-900 dark:bg-gray-800 dark:text-white p-4 rounded-xl shadow-lg cursor-pointer w-full sm:w-40 sm:h-56 aspect-[2/3] hover:scale-110 transition-all duration-300 ease-in-out"
        onClick={() => {
          if (user) {
            setDraft(true);
            setPublishError("");
            setIsOpen(true);
          } else {
            setLoginPrompt(true);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (user) { setDraft(true); setPublishError(""); setIsOpen(true); } else setLoginPrompt(true);
          }
        }}
      >
        <div className="w-16 h-16 flex items-center justify-center bg-neonBlue rounded-full transform transition-transform duration-300 group-hover:rotate-90">
          <span className="text-3xl font-bold text-darkBg">+</span>
        </div>
        <p className="mt-2 text-lg">Добавить</p>
        {!user && (
          <span className="text-xs text-gray-400">Требует авторизации</span>
        )}
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={-1}
      className="fixed inset-0 z-50 p-5  bg-gray-500 dark:bg-black flex items-center justify-center"
      onClick={() => setIsOpen(false)}
    >
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <div
          role="dialog"
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-7xl flex flex-col sm:flex-row shadow-lg overflow-hidden h-full"
        >
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col sm:flex-row w-full h-full">
        <ImageDropZone imageURL={imageURL} setImageURL={setImageURL} ownerUid={user?.uid || ""} />
        <EnemyFields
          name={name}
          setName={setName}
          customDescription={customDescription}
          setCustomDescription={setCustomDescription}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
        >
          <div className="flex flex-col gap-2 py-4">
            <div className="flex items-center gap-4">
              <DraftSwitch draft={draft} setDraft={handleDraftChange} />
              <button
                type="submit"
                disabled={!user || (!draft && !imageURL)}
                className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-sky-400 transition cursor-pointer disabled:opacity-50"
              >
                <PlusIcon className="w-5 h-5" />
                Добавить
              </button>
            </div>
            {publishError && (
              <span className="text-xs text-red-600" role="alert">{publishError}</span>
            )}
          </div>
        </EnemyFields>
        <ImageDropZone
          imageURL={imageURL2}
          setImageURL={setImageURL2}
          ownerUid={user?.uid || ""}
          placeholder="/eotv-enemy-location-placeholder.png"
        />
        </form>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute top-2 right-2 text-gray-300 hover:text-white cursor-pointer"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default AddEnemy;
