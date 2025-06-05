import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { auth } from "../firebase";

interface Props {
  open: boolean;
  message?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const LoginPrompt: React.FC<Props> = ({ open, message = "Для продолжения необходима авторизация", onClose, onSuccess }) => {
  if (!open) return null;

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <div
      role="button"
      tabIndex={-1}
      className="fixed inset-0 z-[60] p-5 bg-black flex items-center justify-center"
      onClick={onClose}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        role="dialog"
        onClick={(e) => e.stopPropagation()}
        className="relative bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-300 hover:text-white cursor-pointer"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
        <p>{message}</p>
        <button
          onClick={login}
          className="px-4 py-2 bg-neonBlue text-darkBg font-semibold rounded hover:bg-opacity-80 transition cursor-pointer"
        >
          Войти через Google
        </button>
      </div>
    </div>
  );
};

export default LoginPrompt;
