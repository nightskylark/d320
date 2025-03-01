import { useState, useEffect } from "react";
import { addDoc } from "firebase/firestore";
import { collection } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import TagSelector from "./TagSelector";

const eotvEnemiesCollection = collection(db, "eotv-enemies");

function AddEnemy({ onEnemyAdded }) {
  const [name, setName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTags, setCustomTags] = useState([]);
  const [imageURL, setImageURL] = useState("");
  const [imageURL2, setImageURL2] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !user) return;

    const newEnemy = {
      name,
      customDescription,
      tags: selectedTags,
      customTags,
      imageURL,
      imageURL2,
      authorUid: user.uid,
    };

    const docRef = await addDoc(eotvEnemiesCollection, newEnemy);

    onEnemyAdded({ id: docRef.id, ...newEnemy });

    setName("");
    setCustomDescription("");
    setSelectedTags([]);
    setCustomTags([]);
    setImageURL("");
    setImageURL2("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Имя противника" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
      <textarea placeholder="Описание" value={customDescription} onChange={(e) => setCustomDescription(e.target.value)} disabled={loading} />
      <TagSelector selectedTags={selectedTags} setSelectedTags={setSelectedTags} customTags={customTags} setCustomTags={setCustomTags} />
      <input type="text" placeholder="URL основного изображения" value={imageURL} onChange={(e) => setImageURL(e.target.value)} disabled={loading} />
      <input type="text" placeholder="URL дополнительного изображения" value={imageURL2} onChange={(e) => setImageURL2(e.target.value)} disabled={loading} />
      <button type="submit" disabled={!user || loading}>Добавить</button>
    </form>
  );
}

export default AddEnemy;
