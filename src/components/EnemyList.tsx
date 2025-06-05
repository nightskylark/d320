import AddEnemy from "./AddEnemy";
import EnemyCard from "./EnemyCard";
import type { Enemy, UserProfile } from "../types";
import { useAuth } from "../contexts/AuthContext";

interface Props {
  enemies: Enemy[];
  users: Record<string, UserProfile>;
  onSelect: (index: number) => void;
}

const EnemyList: React.FC<Props> = ({ enemies, users, onSelect }) => {
  const user = useAuth();

  return (
    <div className="flex flex-wrap gap-4 justify-center relative">
      {user && <AddEnemy />}
      {enemies.map((enemy, index) => (
        <EnemyCard
          index={index}
          enemy={enemy}
          author={users[enemy.authorUid]}
          onClick={() => onSelect(index)}
          key={enemy.id}
        />
      ))}
    </div>
  );
};

export default EnemyList;
