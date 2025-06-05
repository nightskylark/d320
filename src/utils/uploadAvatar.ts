import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export const uploadAvatar = (
  userId: string,
  file: File,
  setURL: (url: string) => void,
  setProgress: (p: number) => void
) => {
  const storageRef = ref(storage, `avatars/${userId}/${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on(
    "state_changed",
    snapshot => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setProgress(progress);
    },
    error => {
      console.error("Ошибка загрузки:", error);
    },
    async () => {
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      setURL(downloadURL);
    }
  );
};
