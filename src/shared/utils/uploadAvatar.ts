import { uploadFile } from "./uploadFile";

export const uploadAvatar = (
  userId: string,
  file: File,
  setProgress: (p: number) => void
): Promise<string> => {
  return uploadFile(`avatars/${userId}`, file, setProgress);
};
