import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

const usersCollection = collection(db, "users");

function Auth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userRef = doc(usersCollection, currentUser.uid);
        await setDoc(userRef, {
          displayName: currentUser.displayName || "Unknown",
          photoURL: currentUser.photoURL || "",
        }, { merge: true });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {user ? (
        <>
          <img
            src={user.photoURL || "https://firebasestorage.googleapis.com/v0/b/d320-971d2.firebasestorage.app/o/images%2Fphoto-placeholder.webp?alt=media&token=e80d935b-9ded-4684-b359-38434c0f6d26"}
            alt="Avatar"
            style={{ width: 40, height: 40, borderRadius: "50%" }}
          />
          <span>{user.displayName}</span>
          <button onClick={logout}>Выйти</button>
        </>
      ) : (
        <button onClick={login}>Войти через Google</button>
      )}
    </div>
  );
}

export default Auth;
