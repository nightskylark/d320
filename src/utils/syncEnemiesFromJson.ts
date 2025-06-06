export interface JsonEnemy {
  name: string;
  customDescription: string;
  tags: string[];
  imageURL: string;
  imageURL2?: string;
  authorUid: string;
}

import { addDoc, getDocs, query, where } from 'firebase/firestore';
import { enemiesCollection } from '../firebase';
import type { Enemy } from '../types';

export const syncEnemiesFromJson = async (uid: string) => {
  try {
    const res = await fetch('/eotv_enemies.json');
    const all: JsonEnemy[] = await res.json();
    const mine = all.filter(e => e.authorUid === uid);
    for (const enemy of mine) {
      const qs = await getDocs(query(enemiesCollection, where('name', '==', enemy.name)));
      if (qs.empty) {
        const newEnemy: Enemy = {
          ...enemy,
          customTags: [],
          likedBy: [],
          createdAt: new Date().toISOString(),
        };
        await addDoc(enemiesCollection, newEnemy);
      }
    }
  } catch (err) {
    console.error('Error syncing enemies', err);
  }
};
