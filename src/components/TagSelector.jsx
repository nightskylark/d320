import { useEffect, useState, useCallback } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase";

const tagsCollection = collection(db, "eotv-enemy-tags");

function TagSelector({ selectedTags, setSelectedTags, customTags, setCustomTags }) {
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    const fetchTags = async () => {
      const querySnapshot = await getDocs(tagsCollection);
      setAvailableTags(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchTags();
  }, []);

  const handleTagChange = useCallback((e) => {
    const selectedValue = e.target.value;
    if (selectedValue && !selectedTags.includes(selectedValue)) {
      setSelectedTags(prev => [...prev, selectedValue]);
    }
  }, [selectedTags, setSelectedTags]);

  const handleCustomTagChange = useCallback((e) => {
    setCustomTags(e.target.value.split(",").map(tag => tag.trim()));
  }, [setCustomTags]);

  return (
    <div>
      <label>Выберите теги:</label>
      <select onChange={handleTagChange}>
        <option value="">-- Выбрать --</option>
        {availableTags.map(tag => (
          <option key={tag.id} value={tag.slug}>{tag.name}</option>
        ))}
      </select>

      <label>Пользовательские теги (через запятую):</label>
      <input type="text" value={customTags.join(", ")} onChange={handleCustomTagChange} />
      
      <p>Выбранные теги: {selectedTags.join(", ")}</p>
    </div>
  );
}

export default TagSelector;
