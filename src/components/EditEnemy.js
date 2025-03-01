import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { storage, db } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

function EditEnemy({ enemy, onClose, onUpdate }) {
  const [name, setName] = useState(enemy.name);
  const [customDescription, setCustomDescription] = useState(enemy.customDescription);
  const [image, setImage] = useState(null);
  const [image2, setImage2] = useState(null);
  const [imageURL, setImageURL] = useState(enemy.imageURL || "");
  const [imageURL2, setImageURL2] = useState(enemy.imageURL2 || "");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadProgress2, setUploadProgress2] = useState(0);

  const handleImageUpload = async (image, setImageURL, setProgress) => {
    if (!image) return;

    const storageRef = ref(storage, `enemies/${enemy.authorUid}/${image.name}`);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.error("Ошибка загрузки:", error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setImageURL(downloadURL);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedEnemy = {
      name,
      customDescription,
      imageURL,
      imageURL2,
    };

    const enemyDocRef = doc(db, "eotv-enemies", enemy.id);
    await updateDoc(enemyDocRef, updatedEnemy);

    if (onUpdate) {
      onUpdate({ id: enemy.id, ...updatedEnemy });
    }

    onClose();
  };

  return (
    <div className="edit-modal">
      <h3>Редактирование противника</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        <textarea value={customDescription} onChange={(e) => setCustomDescription(e.target.value)} />

        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        <button type="button" onClick={() => handleImageUpload(image, setImageURL, setUploadProgress)} disabled={!image}>Обновить основное изображение</button>
        {uploadProgress > 0 && <p>Прогресс загрузки: {uploadProgress.toFixed(2)}%</p>}
        {imageURL && <img src={imageURL} alt="Обновленное изображение" width={100} />}

        <input type="file" onChange={(e) => setImage2(e.target.files[0])} />
        <button type="button" onClick={() => handleImageUpload(image2, setImageURL2, setUploadProgress2)} disabled={!image2}>Обновить доп. изображение</button>
        {uploadProgress2 > 0 && <p>Прогресс загрузки: {uploadProgress2.toFixed(2)}%</p>}
        {imageURL2 && <img src={imageURL2} alt="Обновленное изображение 2" width={100} />}

        <button type="submit">Сохранить</button>
        <button type="button" onClick={onClose}>Отмена</button>
      </form>
    </div>
  );
}

export default EditEnemy;
