import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../firebase";

export const uploadCharacterImage = (
  showId: string,
  characterId: string,
  file: File,
  onProgress: (value: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const storageRef = ref(storage, `rpg-show/${showId}/characters/${characterId}-${Date.now()}.${extension}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};
