import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import type { UserProfile } from "../types";

export const fetchUserProfiles = async (uids: string[]): Promise<Record<string, UserProfile>> => {
  const profiles: Record<string, UserProfile> = {};
  await Promise.all(
    uids.map(async (uid) => {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        profiles[uid] = snap.data() as UserProfile;
      }
    })
  );
  return profiles;
};
