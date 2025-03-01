import { useEffect, useState } from "react";
import { onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db, auth, enemiesCollection } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import ReactMarkdown from "react-markdown";
import EditEnemy from "./EditEnemy";

function EnemyList() {
  const [enemies, setEnemies] = useState([]);
  const [editingEnemy, setEditingEnemy] = useState(null);
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

  const handleDelete = async (id) => {
    if (!user) return;
    if (window.confirm("Are you sure you want to delete this enemy?")) {
      await deleteDoc(doc(db, "eotv-enemies", id));
    }
  };

  return (
    <div>
      <h3>Enemy List</h3>

      {enemies.map((enemy) => (
        <div key={enemy.id}>
          <h3>{enemy.name}</h3>
          <ReactMarkdown>{enemy.customDescription}</ReactMarkdown>

          {enemy.imageURL && <img src={enemy.imageURL} alt={enemy.name} width={100} />}
          {enemy.imageURL2 && <img src={enemy.imageURL2} alt={`${enemy.name} extra`} width={100} />}

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
        />
      )}
    </div>
  );
}

export default EnemyList;
