import { useState, useEffect } from "react";
import { onSnapshot } from "firebase/firestore";
import { enemiesCollection, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Auth from "./components/Auth";
import AddEnemy from "./components/AddEnemy";
import EnemyList from "./components/EnemyList";

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
    <div>
      <h1>d320</h1>
      <Auth />
      <h1>Catalog</h1>
      
      {/* Показываем форму только если пользователь авторизован */}
      {user && <AddEnemy />}

      <EnemyList enemies={enemies} />
    </div>
  );
}

export default App;
