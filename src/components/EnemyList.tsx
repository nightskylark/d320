import { useEffect, useState } from "react";
import { onSnapshot, doc, deleteDoc, getDoc } from "firebase/firestore";
import { db, auth, enemiesCollection } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import AddEnemy from "./AddEnemy";
import EnemyCard from "./EnemyCard";
import EnemyDetail from "./EnemyDetail";
import type { Enemy, UserProfile } from "../types";

const EnemyList: React.FC = () => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [user, setUser] = useState<{ uid: string } | null>(null);
  const [selectedEnemyIndex, setSelectedEnemyIndex] = useState<number>(-1);

  useEffect(() => {
    const unsubscribe = onSnapshot(enemiesCollection, async (snapshot) => {
      const enemyData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEnemies(enemyData);

      const userIds = [...new Set(enemyData.map(enemy => enemy.authorUid))];
      const userProfiles = {};
      for (const userId of userIds) {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          userProfiles[userId] = userSnap.data();
        }
      }
      setUsers(userProfiles);
    });

    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => {
      unsubscribe();
      authUnsubscribe();
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (window.confirm("Удалить этого противника?")) {
      await deleteDoc(doc(db, "eotv-enemies", id));
    }
  };

  const handleNext = () => {
    setSelectedEnemyIndex((prevIndex) => (prevIndex === enemies.length - 1 ? 0 : prevIndex + 1));
  };
  
  const handlePrev = () => {
    setSelectedEnemyIndex((prevIndex) => (prevIndex === 0 ? enemies.length - 1 : prevIndex - 1));
  };

  const handleActiveChange = (index: number) => {
    return (state: boolean) => setSelectedEnemyIndex(state ? index : undefined);
  };

  const close = () => {
    setSelectedEnemyIndex(-1);
  };
  
  const selectedEnemy = selectedEnemyIndex >-1 && enemies[selectedEnemyIndex];

  return (
    <div className="flex flex-wrap gap-4 justify-center relative">
      {/* Add card */}
      {user && <AddEnemy />}

      {/* All cards */}
      {enemies.map((enemy, index) => (
          <EnemyCard
            index={index}
            enemy={enemy}
            author={users[enemy.authorUid]}
            onClick={setSelectedEnemyIndex}
            key={enemy.id}
          />
      ))}

      {/* Selected card detail */}
      {selectedEnemy && <EnemyDetail
          enemy={selectedEnemy}
          author={users[selectedEnemy.authorUid]}
          onPrev={handlePrev}
          onNext={handleNext}
          close={close}
          onDelete={() => handleDelete(selectedEnemy.id)}
        />
      }
    </div>
  );
};

export default EnemyList;
