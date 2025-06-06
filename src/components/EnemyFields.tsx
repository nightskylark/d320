import TagBox from "./TagBox";
import MDEditor from "@uiw/react-md-editor";
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
  <div className="w-full sm:w-4/7 flex flex-col px-6 h-full overflow-y-auto">
    <input
      type="text"
      placeholder="Имя противника"
      value={name}
      onChange={(e) => setName(e.target.value)}
      className="w-full p-2 mt-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-neonBlue"
      required
    />
    <div className="mt-4 flex-1">
      <MDEditor
        value={customDescription}
        onChange={(val) => setCustomDescription(val || "")}
        preview="edit"
        height={200}
      />
    </div>
    <TagBox
      selectedTags={selectedTags}
      setSelectedTags={setSelectedTags}
    />
    {children}
  </div>
);

export default EnemyFields;
