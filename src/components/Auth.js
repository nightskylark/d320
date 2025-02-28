import { useState, useEffect } from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

function Auth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // Отписываемся при размонтировании
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Ошибка входа:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <div>
      {user ? (
        <>
          <p>Вы вошли как {user.displayName || user.email}</p>
          <button onClick={logout}>Выйти</button>
        </>
      ) : (
        <button onClick={login}>Войти через Google</button>
      )}
    </div>
  );
}

export default Auth;
