import { useState, useEffect, useRef } from "react";
import { addDoc } from "firebase/firestore";
import { enemiesCollection, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import TagBox from "./TagBox";
import ImageDropZone from "./ImageDropZone";
import type { Enemy } from "../types";

const AddEnemy: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [imageURL, setImageURL] = useState("");
  const [imageURL2, setImageURL2] = useState("");
  const [user, setUser] = useState<{ uid: string } | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const newEnemy: Enemy = {
      name,
      customDescription,
      tags: selectedTags,
      customTags,
      imageURL,
      imageURL2,
      authorUid: user.uid,
    };
    await addDoc(enemiesCollection, newEnemy);
    setIsOpen(false);
    setName("");
    setCustomDescription("");
    setSelectedTags([]);
    setCustomTags([]);
    setImageURL("");
    setImageURL2("");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <div
        className="relative flex flex-col items-center justify-center bg-gray-800 text-white p-4 rounded-xl shadow-lg cursor-pointer w-40 h-56 aspect-[2/3] hover:scale-110 transition-all duration-300 ease-in-out"
        onClick={() => setIsOpen(true)}
      >
        <div className="w-16 h-16 flex items-center justify-center bg-neonBlue rounded-full transform transition-transform duration-300 hover:rotate-90">
          <span className="text-3xl font-bold text-darkBg">+</span>
        </div>
        <p className="mt-2 text-lg">Добавить</p>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 p-5 bg-black flex items-center justify-center"
      onClick={() => setIsOpen(false)}
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-gray-900 rounded-2xl w-full max-w-7xl flex shadow-lg overflow-hidden"
      >
        <ImageDropZone imageURL={imageURL} setImageURL={setImageURL} ownerUid={user?.uid || ""} />
        <div className="w-4/7 flex flex-col px-6 h-full overflow-y-auto">
          <h3 className="text-xl font-bold text-center mt-4">Добавить противника</h3>
          <input
            type="text"
            placeholder="Имя противника"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 mt-4 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-neonBlue"
            required
          />
          <textarea
            placeholder="Описание"
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
          <div className="flex gap-4 py-4">
            <button type="submit" className="w-full px-4 py-2 bg-green-500 text-white rounded" disabled={!user}>
              Добавить
            </button>
            <button type="button" onClick={() => setIsOpen(false)} className="w-full px-4 py-2 bg-red-500 text-white rounded">
              Отмена
            </button>
          </div>
        </div>
        <ImageDropZone imageURL={imageURL2} setImageURL={setImageURL2} ownerUid={user?.uid || ""} />
      </form>
    </div>
  );
};

export default AddEnemy;
