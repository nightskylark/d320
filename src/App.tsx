import { useState, useEffect } from "react";
import { onSnapshot, doc, deleteDoc, addDoc, updateDoc, getDoc } from "firebase/firestore";
import { enemiesCollection, db } from "./firebase";
import EnemyList from "./components/EnemyList";
import EnemyDetail from "./components/EnemyDetail";
import Footer from "./components/Footer";
import Header from "./components/Header";
import EnemyFilters from "./components/EnemyFilters";
import type { Enemy, UserProfile } from "./types";
import { useAuth } from "./contexts/AuthContext";
import { fetchUserProfiles } from "./utils/fetchUserProfiles";
import { printEnemies } from "./utils/printEnemies";

const App: React.FC = () => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [pendingEnemyId, setPendingEnemyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [liked, setLiked] = useState(false);
  const [author, setAuthor] = useState("");
  const [sort, setSort] = useState("date");
  const [draftFilter, setDraftFilter] = useState("all");
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const user = useAuth();

  useEffect(() => {
      const unsubscribe = onSnapshot(enemiesCollection, (snapshot) => {
        const enemyData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Enemy, 'id'>),
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

  const handlePrintAll = () => {
    printEnemies(filtered, profiles);
  };

  const handleExport = () => {
    const data = filtered.map(e => ({
      uid: e.id,
      name: e.name,
      customDescription: e.customDescription,
      imageURL: e.imageURL,
      imageURL2: e.imageURL2,
      tags: e.tags,
      draft: e.draft,
      author: profiles[e.authorUid]?.displayName || ""
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enemies.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    if (!user) return;
    setImporting(true);
    setImportProgress(0);
    try {
      const text = await file.text();
      const arr = JSON.parse(text);
      if (!Array.isArray(arr)) throw new Error();
      for (const item of arr) {
        if (typeof item !== 'object' || item === null) throw new Error();
        if ('name' in item && typeof item.name !== 'string') throw new Error();
        if ('customDescription' in item && typeof item.customDescription !== 'string') throw new Error();
        if ('imageURL' in item && typeof item.imageURL !== 'string') throw new Error();
        if ('imageURL2' in item && typeof item.imageURL2 !== 'string') throw new Error();
        if ('draft' in item && typeof item.draft !== 'boolean') throw new Error();
        if (
          'tags' in item &&
          (!Array.isArray(item.tags) || item.tags.some((t: unknown) => typeof t !== 'string'))
        )
          throw new Error();
      }
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const uid = item.uid as string | undefined;
        const data: Partial<Enemy> = {};
        if ('name' in item) data.name = item.name;
        if ('customDescription' in item) data.customDescription = item.customDescription;
        if ('imageURL' in item) data.imageURL = item.imageURL;
        if ('imageURL2' in item) data.imageURL2 = item.imageURL2;
        if ('tags' in item) data.tags = item.tags;
        if ('draft' in item) data.draft = item.draft;
        if (uid) {
          const ref = doc(db, 'eotv-enemies', uid);
          const snap = await getDoc(ref);
          if (snap.exists() && snap.data().authorUid === user.uid) {
            await updateDoc(ref, data);
          }
        } else {
          const newEnemy: Enemy = {
            name: item.name ?? '',
            customDescription: item.customDescription ?? '',
            imageURL: item.imageURL ?? '',
            imageURL2: item.imageURL2 ?? '',
            tags: item.tags ?? [],
            draft: item.draft ?? true,
            authorUid: user.uid,
            likedBy: [],
            createdAt: new Date().toISOString()
          };
          await addDoc(enemiesCollection, newEnemy);
        }
        setImportProgress((i + 1) / arr.length);
      }
      alert("Импорт завершен");
    } catch {
      alert("Неверный формат файла");
    } finally {
      setImporting(false);
      setTimeout(() => setImportProgress(0), 500);
    }
  };

  const normalizedSearch = search.toLowerCase();
  let filtered = enemies.filter(e =>
    (!e.draft || (user && e.authorUid === user.uid)) && (
      e.name.toLowerCase().includes(normalizedSearch) ||
      e.customDescription.toLowerCase().includes(normalizedSearch) ||
      e.tags.some(t => t.toLowerCase().includes(normalizedSearch))
    )
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
  if (draftFilter === 'draft') {
    filtered = filtered.filter(e => e.draft);
  } else if (draftFilter === 'published') {
    filtered = filtered.filter(e => !e.draft);
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

  const handleRandom = () => {
    if (!filtered.length) return;
    const idx = Math.floor(Math.random() * filtered.length);
    setSelectedIndex(idx);
  };

  const handlePrev = () => {
    if (!filtered.length || selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + filtered.length) % filtered.length);
  };

  const selectedEnemy =
    selectedIndex !== null ? filtered[selectedIndex] : null;

  useEffect(() => {
    if (selectedEnemy === null) return;
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest('input') ||
          target.closest('textarea') ||
          target.closest('[contenteditable]'))
      ) {
        return;
      }

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
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-slate-900 dark:text-sky-200">
      <Header />
      <main className="flex-1 p-6 max-w-screen-xl mx-auto">
        <h2 className="text-3xl font-bold text-center">Каталог противников для игры Грань Вселенной</h2>
        <p className="text-center text-gray-400 p-4">Официальный сайт игры: <a className="link" href="http://eotvrpg.ru/" target="_blank"><img src="/eotv-logo.png" alt="EOTV" className="w-5 h-5 inline-block" />eotvrpg.ru</a></p>
        <EnemyFilters
          search={search}
          setSearch={setSearch}
          tag={tag}
          setTag={setTag}
          liked={liked}
          setLiked={setLiked}
          author={author}
          setAuthor={setAuthor}
          draft={draftFilter}
          setDraft={setDraftFilter}
          sort={sort}
          setSort={setSort}
          authors={profiles}
          onPrint={handlePrintAll}
          onExport={handleExport}
          onImport={handleImport}
          importing={importing}
          importProgress={importProgress}
          importAllowed={!!user}
          count={filtered.length}
          onRandom={handleRandom}
        />
        <EnemyList enemies={filtered} users={profiles} onSelect={setSelectedIndex} />
      </main>
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
      <Footer />
    </div>
  );
};

export default App;
