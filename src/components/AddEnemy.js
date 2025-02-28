import { useState, useEffect } from "react";
import { addDoc } from "firebase/firestore";
import { collection } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import TagSelector from "./TagSelector";

const eotvEnemiesCollection = collection(db, "eotv-enemies");

function AddEnemy() {
  const [name, setName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTags, setCustomTags] = useState([]);
  const [imageURL, setImageURL] = useState("");
  const [imageURL2, setImageURL2] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;

    if (!user) {
      console.error("Ошибка: пользователь не авторизован!");
      return;
    }

    await addDoc(eotvEnemiesCollection, {
      name,
      customDescription,
      tags: selectedTags,
      customTags,
      imageURL,
      imageURL2,
      authorUid: user.uid
    });

    setName("");
    setCustomDescription("");
    setSelectedTags([]);
    setCustomTags([]);
    setImageURL("");
    setImageURL2("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Имя противника"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <textarea
        placeholder="Описание"
        value={customDescription}
        onChange={(e) => setCustomDescription(e.target.value)}
      />

      <TagSelector
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        customTags={customTags}
        setCustomTags={setCustomTags}
      />

      <input
        type="text"
        placeholder="URL основного изображения"
        value={imageURL}
        onChange={(e) => setImageURL(e.target.value)}
      />
      <input
        type="text"
        placeholder="URL дополнительного изображения"
        value={imageURL2}
        onChange={(e) => setImageURL2(e.target.value)}
      />

      <button type="submit" disabled={!user}>Добавить</button>
    </form>
  );
}

export default AddEnemy;
