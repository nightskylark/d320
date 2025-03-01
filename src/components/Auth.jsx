import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

function Auth() {
  const user = auth.currentUser;

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
            src={user.photoURL || "/placeholder-avatar.png"}
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
}

export default Auth;
