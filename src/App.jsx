import { useState, useEffect } from "react";
import { onSnapshot } from "firebase/firestore";
import { enemiesCollection, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Auth from "./components/Auth";
import AddEnemy from "./components/AddEnemy";
import EnemyList from "./components/EnemyList";
import Header from "./components/Header";

function App() {
  const [enemies, setEnemies] = useState([]);
  const [user, setUser] = useState(null);

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
    <div className="bg-darkBg text-white min-h-screen">
      <Header />
      <main className="p-6">
        <h2 className="text-3xl font-bold text-center">Каталог протвиников для игры Грань Вселенной</h2>
        <p className="text-center text-gray-400">Используйте, что найдете и делитесь своими!</p>
        {user && <AddEnemy />}
        <EnemyList enemies={enemies} />
      </main>
    </div>
  );
}

export default App;
