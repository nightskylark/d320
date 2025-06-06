import { useEffect, useRef } from "react";

interface Props {
  about: string;
  onClose: () => void;
}

const AboutPopup: React.FC<Props> = ({ about, onClose }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
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

  if (!about) return null;

  return (
    <div
      ref={ref}
      className="absolute bottom-12 right-0 z-50 w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-4 rounded shadow"
    >
      <p className="whitespace-pre-wrap text-sm">{about}</p>
    </div>
  );
};

export default AboutPopup;
