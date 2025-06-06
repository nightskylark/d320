export interface Enemy {
  id?: string;
  name: string;
  customDescription: string;
  tags: string[];
  imageURL: string;
  imageURL2?: string;
  authorUid: string;
  likedBy?: string[];
  createdAt?: string;
  draft?: boolean;
}

export interface UserProfile {
  displayName: string;
  photoURL: string;
}
