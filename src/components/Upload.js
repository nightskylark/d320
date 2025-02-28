import { useState } from "react";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function Upload() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");

  const uploadFile = async () => {
    if (!file) return;

    const storageRef = ref(storage, `images/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    setUrl(downloadURL);
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={uploadFile}>Upload</button>
      {url && <img src={url} alt="Uploaded file" width={200} />}
    </div>
  );
}

export default Upload;
