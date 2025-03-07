import { useEffect, useState } from "react";
import { onSnapshot, doc, deleteDoc, getDoc } from "firebase/firestore";
import { db, auth, enemiesCollection } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import AddEnemy from "./AddEnemy";
import EnemyCard from "./EnemyCard";

function EnemyList() {
  const [enemies, setEnemies] = useState([]);
  const [users, setUsers] = useState({});
  const [user, setUser] = useState(null);
  const [selectedEnemyIndex, setSelectedEnemyIndex] = useState(null);

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

  const handleDelete = async (id) => {
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

  const handleActiveChange = (index) => {
    return (state) => setSelectedEnemyIndex(state ? index : undefined);
  };

  const close = () => {
    setSelectedEnemyIndex(null);
  };

  return (
    <div className="flex flex-wrap gap-4 justify-center relative">
      {/* Add card */}
      {user && <AddEnemy />}

      {enemies.map((enemy, index) => (
          <EnemyCard
            index={index}
            isSelected={selectedEnemyIndex === index}
            enemy={enemy}
            author={users[enemy.authorUid]}
            onClick={setSelectedEnemyIndex}
            onPrev={handlePrev}
            onNext={handleNext}
            close={close}
            onDelete={() => handleDelete(enemy.id)}
            key={enemy.id}
          />
      ))}
    </div>
  );
}

export default EnemyList;
