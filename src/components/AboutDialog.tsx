import { useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { UserProfile } from "../types";

interface Props {
  user: UserProfile;
  onClose: () => void;
}

const AboutDialog: React.FC<Props> = ({ user, onClose }) => {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
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

  return (
    <div
      role="button"
      tabIndex={-1}
      className="fixed inset-0 z-50 p-5 bg-gray-500 bg-opacity-75 dark:bg-black flex items-center justify-center"
      onClick={onClose}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={panelRef}
        role="dialog"
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm p-6 flex flex-col items-center"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-300 hover:text-white cursor-pointer"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold mb-2">{user.displayName}</h3>
        <p className="whitespace-pre-line text-sm text-center">{user.about || ""}</p>
      </div>
    </div>
  );
};

export default AboutDialog;
