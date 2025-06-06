import { useState, useEffect, useRef } from "react";
import { addDoc } from "firebase/firestore";
import { enemiesCollection } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import ImageDropZone from "./ImageDropZone";
import EnemyFields from "./EnemyFields";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
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
  const user = useAuth();
  const formRef = useRef<HTMLFormElement | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const newEnemy: Enemy = {
      name,
      customDescription,
      tags: selectedTags,
      imageURL,
      imageURL2,
      authorUid: user.uid,
      likedBy: [],
      createdAt: new Date().toISOString(),
    };
    await addDoc(enemiesCollection, newEnemy);
    setIsOpen(false);
    setName("");
    setCustomDescription("");
    setSelectedTags([]);
    setImageURL("");
    setImageURL2("");
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
            setIsOpen(true);
          } else {
            setLoginPrompt(true);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (user) setIsOpen(true); else setLoginPrompt(true);
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
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col sm:flex-row w-full h-full overflow-y-auto">
        <ImageDropZone imageURL={imageURL} setImageURL={setImageURL} ownerUid={user?.uid || ""} />
        <EnemyFields
          name={name}
          setName={setName}
          customDescription={customDescription}
          setCustomDescription={setCustomDescription}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
        >
          <div className="flex gap-4 py-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
              Отмена
            </button>
            <button
              type="submit"
              disabled={!user}
              className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition cursor-pointer"
            >
              <PlusIcon className="w-5 h-5" />
              Добавить
            </button>
          </div>
        </EnemyFields>
        <ImageDropZone imageURL={imageURL2} setImageURL={setImageURL2} ownerUid={user?.uid || ""} />
        </form>
      </div>
    </div>
  );
};

export default AddEnemy;
