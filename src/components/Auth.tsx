import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const usersCollection = collection(db, "users");

const Auth: React.FC = () => {
  const user = useAuth();

  useEffect(() => {
    if (!user) return;
    const userRef = doc(usersCollection, user.uid);
    setDoc(userRef, {
      displayName: user.displayName || "Unknown",
      photoURL: user.photoURL || "",
    }, { merge: true });
  }, [user]);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <img
            src={user.photoURL || "https://firebasestorage.googleapis.com/v0/b/d320-971d2.firebasestorage.app/o/images%2Fphoto-placeholder.webp?alt=media&token=e80d935b-9ded-4684-b359-38434c0f6d26"}
            alt="Avatar"
            className="w-10 h-10 rounded-full border border-gray-600 shadow"
          />
          <button
            onClick={logout}
            className="text-sm text-red-500 hover:text-red-400 transition"
          >
            Выйти
          </button>
        </>
      ) : (
        <button
          onClick={login}
          className="px-4 py-2 bg-neonBlue text-darkBg font-semibold rounded hover:bg-opacity-80 transition"
        >
          Войти
        </button>
      )}
    </div>
  );
};

export default Auth;
