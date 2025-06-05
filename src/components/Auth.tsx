import { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import ProfileDialog from "./ProfileDialog";
import { Cog6ToothIcon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";

const usersCollection = collection(db, "users");

const Auth: React.FC = () => {
  const user = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) return;
    const userRef = doc(usersCollection, user.uid);
    setDoc(
      userRef,
      {
        displayName: user.displayName || "Unknown",
        photoURL: user.photoURL || "",
      },
      { merge: true }
    );
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const openProfile = () => {
    setProfileOpen(true);
    setMenuOpen(false);
  };

  return (
    <div className="relative flex items-center gap-4">
      {user ? (
        <>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 focus:outline-none hover:bg-gray-200 dark:hover:bg-gray-700 rounded px-2 py-1 cursor-pointer"
          >
            <img
              src={
                user.photoURL ||
                "https://firebasestorage.googleapis.com/v0/b/d320-971d2.firebasestorage.app/o/images%2Fphoto-placeholder.webp?alt=media&token=e80d935b-9ded-4684-b359-38434c0f6d26"
              }
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-gray-600 shadow"
            />
            <span className="text-sm">{user.displayName || "Unknown"}</span>
          </button>
          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-800 rounded shadow-lg text-sm"
            >
              <button
                onClick={openProfile}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <Cog6ToothIcon className="w-5 h-5" />
                Настройки
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-400 cursor-pointer"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                Выход
              </button>
            </div>
          )}
          {profileOpen && <ProfileDialog onClose={() => setProfileOpen(false)} />}
        </>
      ) : (
        <button
          onClick={login}
          className="px-4 py-2 bg-blue-700 dark:bg-sky-300 hover:bg-blue-500 dark:hover:bg-sky-200 text-white dark:text-black font-semibold rounded transition cursor-pointer"
        >
          Войти через Google
        </button>
      )}
    </div>
  );
};

export default Auth;
