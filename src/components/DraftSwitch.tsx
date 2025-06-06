import { FC } from "react";
import { PencilIcon, DocumentCheckIcon } from "@heroicons/react/24/solid";

interface Props {
  draft: boolean;
  setDraft: (v: boolean) => void;
}

const DraftSwitch: FC<Props> = ({ draft, setDraft }) => {
  const knob = draft ? "" : "translate-x-8";
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        className="sr-only"
        checked={!draft}
        onChange={() => setDraft(!draft)}
      />
      <div className="relative w-16 h-8 bg-gray-300 dark:bg-gray-600 rounded-full transition-colors">
        <PencilIcon className="absolute left-1 top-1 w-5 h-5 text-gray-700 dark:text-gray-200" />
        <DocumentCheckIcon className="absolute right-1 top-1 w-5 h-5 text-green-700" />
        <div
          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${knob}`}
        />
      </div>
      <span className="text-sm">{draft ? "Черновик (виден только автору)" : "Опубликовано (виден всем)"}</span>
    </label>
  );
};

export default DraftSwitch;
