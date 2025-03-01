import { useState, useEffect } from "react";
import { onSnapshot } from "firebase/firestore";
import { enemiesCollection } from "./firebase";
import Auth from "./components/Auth";
import AddEnemy from "./components/AddEnemy";
import EnemyList from "./components/EnemyList";

function App() {
  const [enemies, setEnemies] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(enemiesCollection, (snapshot) => {
      const enemyData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEnemies(enemyData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h1>d320</h1>
      <Auth />
      <h1>Catalog</h1>
      <AddEnemy />
      <EnemyList enemies={enemies} />
    </div>
  );
}

export default App;
