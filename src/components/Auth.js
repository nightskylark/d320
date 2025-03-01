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
    <div>
      {user ? (
        <>
          <p>Вы вошли как {user.displayName}</p>
          <button onClick={logout}>Выйти</button>
        </>
      ) : (
        <button onClick={login}>Войти через Google</button>
      )}
    </div>
  );
}

export default Auth;
