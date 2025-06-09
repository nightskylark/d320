import { useState, useRef, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { updateProfile, User } from "firebase/auth";
import { db, auth } from "../firebase";
import { useAuth, useSetAuthUser } from "../contexts/AuthContext";
import AvatarDropZone from "./AvatarDropZone";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Props {
  onClose: () => void;
}

const ProfileDialog: React.FC<Props> = ({ onClose }) => {
  const user = useAuth();
  const setAuthUser = useSetAuthUser();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [about, setAbout] = useState("");
  const formRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    const fetchAbout = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data() as { about?: string };
        setAbout(data.about || "");
      }
    };
    fetchAbout();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    await updateProfile(user, { displayName, photoURL });
    await user.reload();
    const refreshed = auth.currentUser;
    // preserve Firebase User prototype when creating a new reference
    const clone =
      refreshed && Object.assign(Object.create(Object.getPrototypeOf(refreshed)), refreshed);
    setAuthUser(clone as User | null);
    await setDoc(doc(db, "users", user.uid), { displayName, photoURL, about }, { merge: true });
    onClose();
  };

  if (!user) return null;

  return (
    <div
      role="button"
      tabIndex={-1}
      className="fixed inset-0 z-50 p-5 bg-gray-500/70 dark:bg-black/80 flex items-center justify-center"
      onClick={onClose}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={formRef}
        role="dialog"
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md flex flex-col shadow-lg overflow-hidden p-6 items-center"
      >
        <AvatarDropZone
          avatarURL={photoURL}
          setAvatarURL={setPhotoURL}
          ownerUid={user.uid}
          className="w-32 h-32 rounded-full"
        />
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full p-2 mt-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-neonBlue"
        />
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="О себе"
          className="w-full p-2 mt-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-neonBlue"
        />
        <div className="flex gap-4 mt-6 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
            Отмена
          </button>
          <button
            type="button"
            onClick={saveProfile}
            className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-sky-400 transition cursor-pointer"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDialog;
