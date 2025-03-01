import { useState } from "react";
import Upload from "./components/Upload";
import Auth from "./components/Auth";
import AddEnemy from "./components/AddEnemy";
import EnemyList from "./components/EnemyList";


function App() {
  const [enemies, setEnemies] = useState([]);

  const handleEnemyAdded = (newEnemy) => {
    setEnemies((prevEnemies) => [...prevEnemies, newEnemy]);
  };

  return (
    <div>
      <h1>d320</h1>
      <Auth />
      <h1>Catalog</h1>
      <Upload />
      <AddEnemy onEnemyAdded={handleEnemyAdded} />
      <EnemyList enemies={enemies} />
    </div>
  );
}

export default App;

