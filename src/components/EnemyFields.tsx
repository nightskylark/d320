import TagBox from "./TagBox";
import MarkdownEditor from "./MarkdownEditor";
import type { FC, ReactNode } from "react";

interface Props {
  name: string;
  setName: (name: string) => void;
  customDescription: string;
  setCustomDescription: (value: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  children?: ReactNode;
}

const EnemyFields: FC<Props> = ({
  name,
  setName,
  customDescription,
  setCustomDescription,
  selectedTags,
  setSelectedTags,
  children,
}) => (
  <div className="w-full sm:w-4/7 flex flex-col px-6 h-full">
    <input
      type="text"
      placeholder="Имя противника"
      value={name}
      onChange={(e) => setName(e.target.value)}
      className="w-full p-2 mt-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-neonBlue"
      required
    />
    <MarkdownEditor value={customDescription} onChange={setCustomDescription} />
    <div className="mt-auto flex flex-col">
      <TagBox
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
      />
      {children}
    </div>
  </div>
);

export default EnemyFields;
