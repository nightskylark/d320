import { useEffect, useState } from "react";
import { getDocs, doc, deleteDoc } from "firebase/firestore";
import { enemiesCollection } from "../firebase";
import ReactMarkdown from "react-markdown";
import { db } from "../firebase";
import EditEnemy from "./EditEnemy";

function EnemyList() {
  const [enemies, setEnemies] = useState([]);
  const [editingEnemy, setEditingEnemy] = useState(null); // Противник, которого редактируем

  useEffect(() => {
    const fetchEnemies = async () => {
      const querySnapshot = await getDocs(enemiesCollection);
      setEnemies(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchEnemies();
  }, []);
  
  const handleUpdateEnemy = (updatedEnemy) => {
    setEnemies((prevEnemies) =>
      prevEnemies.map((enemy) =>
        enemy.id === updatedEnemy.id ? updatedEnemy : enemy
      )
    );
  };

  const handleDelete = async (id) => {
    if (window.confirm("Вы уверены, что хотите удалить этого противника?")) {
      await deleteDoc(doc(db, "eotv-enemies", id));
      setEnemies(enemies.filter(enemy => enemy.id !== id));
    }
  };

  return (
    <div>
      <h2>Список противников</h2>
      {enemies.map((enemy) => (
        <div key={enemy.id}>
          <h3>{enemy.name}</h3>
          <ReactMarkdown style={{ whiteSpace: "pre-wrap" }}>{enemy.customDescription}</ReactMarkdown>
          {enemy.imageURL && <img src={enemy.imageURL} alt={enemy.name} width={100} />}
          {enemy.imageURL2 && <img src={enemy.imageURL2} alt={`${enemy.name} доп`} width={100} />}
          <p>Теги: {enemy.tags?.join(", ")}</p>
          <p>Свои теги: {enemy.customTags?.join(", ")}</p>
        
          <button onClick={() => setEditingEnemy(enemy)}>Редактировать</button>
          <button onClick={() => handleDelete(enemy.id)}>Удалить</button>
        </div>
      ))}

      {editingEnemy && (
        <EditEnemy
          enemy={editingEnemy}
          onClose={() => setEditingEnemy(null)}
          onUpdate={handleUpdateEnemy}
        />
      )}
    </div>
  );
}

export default EnemyList;
