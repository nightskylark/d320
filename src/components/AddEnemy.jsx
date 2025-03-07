import { useState, useEffect, useRef } from "react";
import { addDoc } from "firebase/firestore";
import { enemiesCollection, auth, storage } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import TagSelector from "./TagSelector";

function AddEnemy() {
  const [isOpen, setIsOpen] = useState(false);
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
  const formRef = useRef(null);

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
  
    await addDoc(enemiesCollection, newEnemy);
  
    setIsOpen(false);
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

  // Close form when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div 
      className={`relative flex flex-col items-center justify-center bg-gray-800 text-white p-4 rounded-xl shadow-lg cursor-pointer transition-all duration-300 ease-in-out 
        ${isOpen ? "scale-105 w-full max-w-lg p-8" : "w-40 h-56 aspect-[2/3] hover:scale-110"}
      `}
      onClick={() => setIsOpen(true)}
    >
      {!isOpen ? (
        <>
          <div className="w-16 h-16 flex items-center justify-center bg-neonBlue rounded-full transform transition-transform duration-300 hover:rotate-90">
            <span className="text-3xl font-bold text-darkBg">+</span>
          </div>
          <p className="mt-2 text-lg">Добавить</p>
        </>
      ) : (
        <div ref={formRef} className="w-full" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-2xl font-bold text-center mb-4">Добавить противника</h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="text" placeholder="Имя противника" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} className="w-full p-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-neonBlue" />
            <textarea placeholder="Описание" value={customDescription} onChange={(e) => setCustomDescription(e.target.value)} disabled={loading} className="w-full p-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-neonBlue" />
            <TagSelector selectedTags={selectedTags} setSelectedTags={setSelectedTags} customTags={customTags} setCustomTags={setCustomTags} />

            <input type="file" onChange={(e) => setImage(e.target.files[0])} disabled={loading} className="text-sm text-gray-400" />
            <button type="button" onClick={() => handleImageUpload(image, setImageURL, setUploadProgress)} disabled={!image || loading} className="w-full px-4 py-2 bg-neonBlue text-darkBg font-semibold rounded">
              Загрузить основное изображение
            </button>
            {uploadProgress > 0 && <p className="text-xs text-gray-300">Прогресс: {uploadProgress.toFixed(2)}%</p>}
            {imageURL && <img src={imageURL} alt="Загруженное изображение 1" className="w-full h-auto rounded-md" />}

            <input type="file" onChange={(e) => setImage2(e.target.files[0])} disabled={loading} className="text-sm text-gray-400" />
            <button type="button" onClick={() => handleImageUpload(image2, setImageURL2, setUploadProgress2)} disabled={!image2 || loading} className="w-full px-4 py-2 bg-neonBlue text-darkBg font-semibold rounded">
              Загрузить дополнительное изображение
            </button>
            {uploadProgress2 > 0 && <p className="text-xs text-gray-300">Прогресс: {uploadProgress2.toFixed(2)}%</p>}
            {imageURL2 && <img src={imageURL2} alt="Загруженное изображение 2" className="w-full h-auto rounded-md" />}

            <div className="flex gap-4">
              <button type="submit" disabled={!user || loading} className="w-full px-4 py-2 bg-green-500 text-white rounded">
                Добавить
              </button>
              <button type="button" onClick={() => setIsOpen(false)} className="w-full px-4 py-2 bg-red-500 text-white rounded">
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AddEnemy;
