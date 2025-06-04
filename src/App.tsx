import { useState, useEffect } from "react";
import { onSnapshot } from "firebase/firestore";
import { enemiesCollection, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import EnemyList from "./components/EnemyList";
import Header from "./components/Header";
import type { Enemy } from "./types";

const App: React.FC = () => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [user, setUser] = useState<{ uid: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(enemiesCollection, (snapshot) => {
      const enemyData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEnemies(enemyData);
    });

    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => {
      unsubscribe();
      authUnsubscribe();
    };
  }, []);

  return (
    <div className="bg-slate-900 text-sky-200 min-h-screen">
      <Header />
      <main className="p-6 max-w-screen-xl mx-auto">
        <h2 className="text-3xl font-bold text-center">Каталог противников для игры Грань Вселенной</h2>
        <p className="text-center text-gray-400 p-4">Официальный сайт игры: <a className="link" href="http://eotvrpg.ru/" target="_blank">http://eotvrpg.ru/</a></p>
        <EnemyList enemies={enemies} />
      </main>
    </div>
  );
};

export default App;
