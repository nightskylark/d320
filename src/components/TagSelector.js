import { useEffect, useState } from "react";
import { getDocs } from "firebase/firestore";
import { tagsCollection } from "../firebase";

function TagSelector({ selectedTags, setSelectedTags, customTags, setCustomTags }) {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    const fetchTags = async () => {
      const querySnapshot = await getDocs(tagsCollection);
      setTags(querySnapshot.docs.map(doc => doc.data()));
    };
    fetchTags();
  }, []);

  const handleTagClick = (slug) => {
    if (selectedTags.includes(slug)) {
      setSelectedTags(selectedTags.filter(tag => tag !== slug));
    } else {
      setSelectedTags([...selectedTags, slug]);
    }
  };

  const handleAddCustomTag = () => {
    if (newTag.trim() && !customTags.includes(newTag.trim())) {
      setCustomTags([...customTags, newTag.trim()]);
      setNewTag("");
    }
  };

  return (
    <div>
      <h4>Выберите теги:</h4>
      <div>
        {tags.map(tag => (
          <button
            key={tag.slug}
            onClick={() => handleTagClick(tag.slug)}
            style={{ background: selectedTags.includes(tag.slug) ? "lightblue" : "white" }}
          >
            {tag.name}
          </button>
        ))}
      </div>

      <h4>Добавить свой тег:</h4>
      <input
        type="text"
        placeholder="Введите свой тег"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
      />
      <button onClick={handleAddCustomTag}>Добавить</button>

      <h4>Выбранные теги:</h4>
      <p>Стандартные: {selectedTags.join(", ")}</p>
      <p>Свои: {customTags.join(", ")}</p>
    </div>
  );
}

export default TagSelector;
