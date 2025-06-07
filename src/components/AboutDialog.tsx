import { useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { UserProfile } from "../types";

interface Props {
  user: UserProfile;
  anchor: DOMRect;
  onClose: () => void;
}

const AboutDialog: React.FC<Props> = ({ user, anchor, onClose }) => {
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
      ref={panelRef}
      role="dialog"
      className="fixed z-50 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-4 shadow-lg"
      style={{ top: anchor.bottom + 4, left: anchor.left }}
    >
      <button
        onClick={onClose}
        className="absolute top-1 right-1 text-gray-400 hover:text-gray-700"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
      <h3 className="text-sm font-bold mb-2">{user.displayName}</h3>
      <p className="whitespace-pre-line text-xs max-w-xs">{user.about || ""}</p>
    </div>
  );
};

export default AboutDialog;
