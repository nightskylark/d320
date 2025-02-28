import { useState } from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";

function Auth() {
  const [user, setUser] = useState(null);

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Ошибка входа:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
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
