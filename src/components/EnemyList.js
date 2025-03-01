import { useEffect, useState } from "react";
import { getDocs, doc, deleteDoc } from "firebase/firestore";
import { enemiesCollection, db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import ReactMarkdown from "react-markdown";
import EditEnemy from "./EditEnemy";

function EnemyList() {
  const [enemies, setEnemies] = useState([]);
  const [editingEnemy, setEditingEnemy] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchEnemies = async () => {
      const querySnapshot = await getDocs(enemiesCollection);
      setEnemies(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchEnemies();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateEnemy = (updatedEnemy) => {
    setEnemies((prevEnemies) =>
      prevEnemies.map((enemy) =>
        enemy.id === updatedEnemy.id ? updatedEnemy : enemy
      )
    );
  };

  const handleDelete = async (id) => {
    if (!user) return;
    if (window.confirm("Are you sure you want to delete this enemy?")) {
      await deleteDoc(doc(db, "eotv-enemies", id));
      setEnemies((prev) => prev.filter((enemy) => enemy.id !== id));
    }
  };

  return (
    <div>
      <h2>Enemy List</h2>
      {enemies.map((enemy) => (
        <div key={enemy.id}>
          <h3>{enemy.name}</h3>
          <ReactMarkdown>{enemy.customDescription}</ReactMarkdown>
          {enemy.imageURL && <img src={enemy.imageURL} alt={enemy.name} width={100} />}
          {enemy.imageURL2 && <img src={enemy.imageURL2} alt={`${enemy.name} extra`} width={100} />}
          <p>Tags: {enemy.tags?.join(", ")}</p>
          <p>Custom Tags: {enemy.customTags?.join(", ")}</p>

          {user && user.uid === enemy.authorUid && (
            <>
              <button onClick={() => setEditingEnemy(enemy)}>Edit</button>
              <button onClick={() => handleDelete(enemy.id)}>Delete</button>
            </>
          )}
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
