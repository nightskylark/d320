import { useState, useEffect } from "react";
import { onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { enemiesCollection, db } from "../../firebase";
import EnemyCard from "./components/EnemyCard";
import EnemyDetail from "./components/EnemyDetail";
import EnemyList from "./components/EnemyList";
import AddEnemy from "./components/AddEnemy";
import EnemyFilters from "./components/EnemyFilters";
import DraftSwitch from "./components/DraftSwitch";
import type { Enemy, UserProfile } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { fetchUserProfiles } from "../../shared/utils/fetchUserProfiles";

const EotvEnemiesPage: React.FC = () => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [pendingEnemyId, setPendingEnemyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [liked, setLiked] = useState(false);
  const [author, setAuthor] = useState("");
  const [sort, setSort] = useState("date");
  const [draft, setDraft] = useState("all");
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const user = useAuth();

  useEffect(() => {
    const unsubscribe = onSnapshot(enemiesCollection, (snapshot) => {
      const enemyData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Enemy[];
      setEnemies(enemyData);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eid = params.get('enemy');
    if (eid) setPendingEnemyId(eid);
  }, []);

  useEffect(() => {
    const uniqueUids = [...new Set(enemies.map(e => e.authorUid))];
    fetchUserProfiles(uniqueUids).then(setProfiles);
  }, [enemies, user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (window.confirm("Удалить этого противника?")) {
      await deleteDoc(doc(db, "eotv-enemies", id));
      setSelectedIndex(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filtered, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'eotv-enemies.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = async (file: File) => {
    console.log('Import file:', file);
  };

  const handleRandom = () => {
    if (filtered.length > 0) {
      const randomIndex = Math.floor(Math.random() * filtered.length);
      setSelectedIndex(randomIndex);
    }
  };

  const normalizedSearch = search.toLowerCase();
  let filtered = enemies.filter(e =>
    e.name.toLowerCase().includes(normalizedSearch) ||
    e.customDescription.toLowerCase().includes(normalizedSearch) ||
    e.tags.some(t => t.toLowerCase().includes(normalizedSearch)) ||
    (e.customTags && e.customTags.some(t => t.toLowerCase().includes(normalizedSearch)))
  );
  if (tag) {
    filtered = filtered.filter(e => e.tags.includes(tag));
  }
  if (liked && user) {
    filtered = filtered.filter(e => e.likedBy?.includes(user.uid));
  }
  if (author) {
    filtered = filtered.filter(e => e.authorUid === author);
  }
  if (user && draft !== "all") {
    filtered = filtered.filter(e => {
      const isDraft = e.draft === true;
      return draft === "draft" ? isDraft : !isDraft;
    });
  }
  filtered = [...filtered];
  if (sort === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    filtered.sort((a, b) => {
      const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bd - ad;
    });
  }

  useEffect(() => {
    if (!pendingEnemyId) return;
    const idx = filtered.findIndex(e => e.id === pendingEnemyId);
    if (idx !== -1) {
      setSelectedIndex(idx);
      setPendingEnemyId(null);
    }
  }, [filtered, pendingEnemyId]);

  const handleNext = () => {
    if (!filtered.length || selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % filtered.length);
  };

  const handlePrev = () => {
    if (!filtered.length || selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + filtered.length) % filtered.length);
  };

  const selectedEnemy = selectedIndex !== null ? filtered[selectedIndex] : null;

  useEffect(() => {
    if (selectedEnemy === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        setSelectedIndex(null);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [selectedEnemy, handlePrev, handleNext]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedEnemy) {
      params.set('enemy', selectedEnemy.id!);
    } else {
      params.delete('enemy');
    }
    const search = params.toString();
    const url = search ? `${window.location.pathname}?${search}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, [selectedEnemy]);

  return (
    <main className="p-6 max-w-screen-xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">Каталог противников для игры Грань Вселенной</h2>
      <p className="text-center text-gray-600 dark:text-gray-400 p-4">
        Официальный сайт игры: <a className="link" href="http://eotvrpg.ru/" target="_blank"><img src="./eotv-logo.png" alt="EOTV" className="w-5 h-5 inline-block" />eotvrpg.ru</a>
      </p>
      <EnemyFilters
        search={search}
        setSearch={setSearch}
        tag={tag}
        setTag={setTag}
        liked={liked}
        setLiked={setLiked}
        author={author}
        setAuthor={setAuthor}
        sort={sort}
        setSort={setSort}
        draft={draft}
        setDraft={setDraft}
        authors={profiles}
        onPrint={handlePrint}
        onExport={handleExport}
        onImport={handleImport}
        importing={importing}
        importProgress={importProgress}
        importAllowed={!!user}
        count={filtered.length}
        onRandom={handleRandom}
      />
      <EnemyList enemies={filtered} users={profiles} onSelect={setSelectedIndex} />
      {selectedEnemy && (
        <EnemyDetail
          enemy={selectedEnemy}
          author={profiles[selectedEnemy.authorUid]}
          onPrev={handlePrev}
          onNext={handleNext}
          close={() => setSelectedIndex(null)}
          onDelete={() => handleDelete(selectedEnemy.id!)}
        />
      )}
    </main>
  );
};

export default EotvEnemiesPage;
