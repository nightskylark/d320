import { useEffect, useState } from "react";
import { onSnapshot, doc, deleteDoc, getDoc } from "firebase/firestore";
import { db, auth, enemiesCollection } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import ReactMarkdown from "react-markdown";
import EditEnemy from "./EditEnemy";

function EnemyList() {
  const [enemies, setEnemies] = useState([]);
  const [users, setUsers] = useState({});
  const [editingEnemy, setEditingEnemy] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(enemiesCollection, async (snapshot) => {
      const enemyData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEnemies(enemyData);

      const userIds = [...new Set(enemyData.map(enemy => enemy.authorUid))];
      const userProfiles = {};
      for (const userId of userIds) {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          userProfiles[userId] = userSnap.data();
        }
      }
      setUsers(userProfiles);
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
      <h3>Список протвиников</h3>

      {enemies.map((enemy) => (
        <div key={enemy.id}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {users[enemy.authorUid]?.photoURL && (
              <img src={users[enemy.authorUid].photoURL} alt="User avatar" width={40} style={{ borderRadius: "50%" }} />
            )}
            <p>{users[enemy.authorUid]?.name || "Unknown"}</p>
          </div>

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
