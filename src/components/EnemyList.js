import { useEffect, useState } from "react";
import { getDocs } from "firebase/firestore";
import { enemiesCollection } from "../firebase";
import ReactMarkdown from "react-markdown";

function EnemyList() {
  const [enemies, setEnemies] = useState([]);

  useEffect(() => {
    const fetchEnemies = async () => {
      const querySnapshot = await getDocs(enemiesCollection);
      setEnemies(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchEnemies();
  }, []);

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
        </div>
      ))}
    </div>
  );
}

export default EnemyList;
