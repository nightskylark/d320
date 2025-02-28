import Upload from "./components/Upload";
import Auth from "./components/Auth";
import AddEnemy from "./components/AddEnemy";
import EnemyList from "./components/EnemyList";


function App() {
  return (
    <div>
      <h1>d320</h1>
      <Auth />

      <h1>Catalog</h1>
      <Upload />
      <AddEnemy />
      <EnemyList />
    </div>
  );
}

export default App;
