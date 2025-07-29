import { useState, useCallback } from "react";
import { useFixedTags } from "../../contexts/TagContext";

interface Props {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
}

const TagBox: React.FC<Props> = ({ selectedTags, setSelectedTags }) => {
  const availableTags = useFixedTags().map(name => ({ name }));
  const [input, setInput] = useState("");

  const allSuggestions = Array.from(new Set([...availableTags.map(t => t.name)]));
  const filteredSuggestions = allSuggestions.filter(tag =>
    tag.toLowerCase().includes(input.toLowerCase()) && !selectedTags.includes(tag)
  );

  const addTag = useCallback((tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (!selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
    }
  }, [selectedTags, setSelectedTags, availableTags]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
      setInput("");
    }
  }, [input, addTag]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (allSuggestions.includes(value)) {
      addTag(value);
      setInput("");
    } else {
      setInput(value);
    }
  }, [allSuggestions, addTag]);

  const removeTag = useCallback((tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  }, [selectedTags, setSelectedTags]);

  return (
    <div className="py-4">
      <label className="block text-sm mb-1">Теги</label>
      <div className="flex flex-wrap gap-1 bg-gray-200 dark:bg-gray-700 p-2 rounded">
        {selectedTags.map(tag => (
          <span key={tag} className="bg-gray-300 dark:bg-gray-600 px-2 py-1 rounded text-xs flex items-center gap-1">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="text-red-400 hover:text-white">×</button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          list="tag-suggestions"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="bg-transparent outline-none flex-1 text-sm text-gray-900 dark:text-white"
        />
        <datalist id="tag-suggestions">
          {filteredSuggestions.map(tag => (
            <option key={tag} value={tag} />
          ))}
        </datalist>
      </div>
    </div>
  );
};

export default TagBox;
