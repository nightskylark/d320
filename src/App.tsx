import { useState, useEffect } from "react";
import { onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { enemiesCollection, db } from "./firebase";
import EnemyList from "./components/EnemyList";
import EnemyDetail from "./components/EnemyDetail";
import Header from "./components/Header";
import type { Enemy, UserProfile } from "./types";
import { useAuth } from "./contexts/AuthContext";
import { fetchUserProfiles } from "./utils/fetchUserProfiles";

const App: React.FC = () => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const user = useAuth();

  useEffect(() => {
    const unsubscribe = onSnapshot(enemiesCollection, (snapshot) => {
      const enemyData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEnemies(enemyData);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const uniqueUids = [...new Set(enemies.map(e => e.authorUid))];
    fetchUserProfiles(uniqueUids).then(setProfiles);
  }, [enemies]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (window.confirm("Удалить этого противника?")) {
      await deleteDoc(doc(db, "eotv-enemies", id));
      setSelectedIndex(null);
    }
  };

  const handleNext = () => {
    if (!enemies.length || selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % enemies.length);
  };

  const handlePrev = () => {
    if (!enemies.length || selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + enemies.length) % enemies.length);
  };

  const selectedEnemy = selectedIndex !== null ? enemies[selectedIndex] : null;

  return (
    <div className="bg-slate-900 text-sky-200 min-h-screen">
      <Header />
      <main className="p-6 max-w-screen-xl mx-auto">
        <h2 className="text-3xl font-bold text-center">Каталог противников для игры Грань Вселенной</h2>
        <p className="text-center text-gray-400 p-4">Официальный сайт игры: <a className="link" href="http://eotvrpg.ru/" target="_blank">http://eotvrpg.ru/</a></p>
        <EnemyList enemies={enemies} users={profiles} onSelect={setSelectedIndex} />
      </main>
      {selectedEnemy && (
        <EnemyDetail
          enemy={selectedEnemy}
          author={profiles[selectedEnemy.authorUid]}
          onPrev={handlePrev}
          onNext={handleNext}
          close={() => setSelectedIndex(null)}
          onDelete={() => handleDelete(selectedEnemy.id!)}
        />
      )}
    </div>
  );
};

export default App;
