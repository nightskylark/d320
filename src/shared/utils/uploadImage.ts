import { uploadFile } from "./uploadFile";

export const uploadImage = (
  userId: string,
  file: File,
  setProgress: (p: number) => void
): Promise<string> => {
  return uploadFile(`enemies/${userId}`, file, setProgress);
};
