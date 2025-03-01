import { useState, useEffect } from "react";
import { addDoc } from "firebase/firestore";
import { enemiesCollection, auth, storage } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import TagSelector from "./TagSelector";

function AddEnemy({ onEnemyAdded }) {
  const [name, setName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTags, setCustomTags] = useState([]);
  const [image, setImage] = useState(null);
  const [image2, setImage2] = useState(null);
  const [imageURL, setImageURL] = useState("");
  const [imageURL2, setImageURL2] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadProgress2, setUploadProgress2] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleImageUpload = async (image, setImageURL, setProgress) => {
    if (!image) return;

    const storageRef = ref(storage, `enemies/${user.uid}/${image.name}`);
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
  
    const docRef = await addDoc(enemiesCollection, newEnemy);
  
    if (onEnemyAdded) {
      onEnemyAdded({ id: docRef.id, ...newEnemy });
    }
  
    setName("");
    setCustomDescription("");
    setSelectedTags([]);
    setCustomTags([]);
    setImage(null);
    setImage2(null);
    setImageURL("");
    setImageURL2("");
    setUploadProgress(0);
    setUploadProgress2(0);
  };  

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Имя противника" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
      <textarea placeholder="Описание" value={customDescription} onChange={(e) => setCustomDescription(e.target.value)} disabled={loading} />
      <TagSelector selectedTags={selectedTags} setSelectedTags={setSelectedTags} customTags={customTags} setCustomTags={setCustomTags} />

      <input type="file" onChange={(e) => setImage(e.target.files[0])} disabled={loading} />
      <button type="button" onClick={() => handleImageUpload(image, setImageURL, setUploadProgress)} disabled={!image || loading}>Загрузить основное изображение</button>
      {uploadProgress > 0 && <p>Прогресс загрузки: {uploadProgress.toFixed(2)}%</p>}
      {imageURL && <img src={imageURL} alt="Загруженное изображение 1" width={100} />}

      <input type="file" onChange={(e) => setImage2(e.target.files[0])} disabled={loading} />
      <button type="button" onClick={() => handleImageUpload(image2, setImageURL2, setUploadProgress2)} disabled={!image2 || loading}>Загрузить дополнительное изображение</button>
      {uploadProgress2 > 0 && <p>Прогресс загрузки: {uploadProgress2.toFixed(2)}%</p>}
      {imageURL2 && <img src={imageURL2} alt="Загруженное изображение 2" width={100} />}

      <button type="submit" disabled={!user || loading}>Добавить</button>
    </form>
  );
}

export default AddEnemy;
