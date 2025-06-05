import TagBox from "./TagBox";
import type { FC, ReactNode } from "react";

interface Props {
  name: string;
  setName: (name: string) => void;
  customDescription: string;
  setCustomDescription: (value: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  customTags: string[];
  setCustomTags: (tags: string[]) => void;
  children?: ReactNode;
}

const EnemyFields: FC<Props> = ({
  name,
  setName,
  customDescription,
  setCustomDescription,
  selectedTags,
  setSelectedTags,
  customTags,
  setCustomTags,
  children,
}) => (
  <div className="w-full sm:w-4/7 flex flex-col px-6 h-full overflow-y-auto">
    <input
      type="text"
      placeholder="Имя противника"
      value={name}
      onChange={(e) => setName(e.target.value)}
      className="w-full p-2 mt-4 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-neonBlue"
      required
    />
    <textarea
      placeholder="Описание"
      value={customDescription}
      onChange={(e) => setCustomDescription(e.target.value)}
      className="w-full p-2 mt-4 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-neonBlue flex-1 resize-none"
    />
    <TagBox
      selectedTags={selectedTags}
      setSelectedTags={setSelectedTags}
      customTags={customTags}
      setCustomTags={setCustomTags}
    />
    {children}
  </div>
);

export default EnemyFields;
