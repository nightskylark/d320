import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

function EditEnemy({ enemy, onClose, onUpdate }) {
  const [name, setName] = useState(enemy.name);
  const [customDescription, setCustomDescription] = useState(enemy.customDescription);
  const [imageURL, setImageURL] = useState(enemy.imageURL || "");
  const [imageURL2, setImageURL2] = useState(enemy.imageURL2 || "");

  const handleSave = async () => {
    const enemyRef = doc(db, "eotv-enemies", enemy.id);
    await updateDoc(enemyRef, {
      name,
      customDescription,
      imageURL,
      imageURL2,
    });

    onUpdate({ ...enemy, name, customDescription, imageURL, imageURL2 });

    onClose();
};

  return (
    <div className="modal">
      <h3>Редактировать противника</h3>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      <textarea value={customDescription} onChange={(e) => setCustomDescription(e.target.value)} />
      <input type="text" value={imageURL} onChange={(e) => setImageURL(e.target.value)} placeholder="URL основного изображения" />
      <input type="text" value={imageURL2} onChange={(e) => setImageURL2(e.target.value)} placeholder="URL доп. изображения" />
      <button onClick={handleSave}>Сохранить</button>
      <button onClick={onClose}>Отмена</button>
    </div>
  );
}

export default EditEnemy;
