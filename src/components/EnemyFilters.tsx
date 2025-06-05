import React, { useState } from "react";
import type { UserProfile } from "../types";
import { useFixedTags } from "../contexts/TagContext";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  tag: string;
  setTag: (v: string) => void;
  liked: boolean;
  setLiked: (v: boolean) => void;
  author: string;
  setAuthor: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  authors: Record<string, UserProfile>;
}

const EnemyFilters: React.FC<Props> = ({ search, setSearch, tag, setTag, liked, setLiked, author, setAuthor, sort, setSort, authors }) => {
  const fixedTags = useFixedTags();
  const [authorOpen, setAuthorOpen] = useState(false);
  const authorProfile = author ? authors[author] : undefined;

  return (
    <div className="flex flex-wrap gap-4 my-4 items-end">
      <input
        type="text"
        placeholder="Поиск"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="p-2 rounded bg-gray-700 text-white flex-1"
      />
      <div>
        <label className="block text-sm mb-1">Тег</label>
        <select value={tag} onChange={e => setTag(e.target.value)} className="p-2 rounded bg-gray-700 text-white">
          <option value="">Все</option>
          {fixedTags.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={liked} onChange={e => setLiked(e.target.checked)} />
        Избранное
      </label>
      <div className="relative">
        <button type="button" onClick={() => setAuthorOpen(o => !o)} className="p-2 rounded bg-gray-700 text-white flex items-center gap-2">
          {authorProfile && <img src={authorProfile.photoURL} alt="avatar" className="w-6 h-6 rounded-full" />}
          <span>{authorProfile ? authorProfile.displayName : 'Автор'}</span>
        </button>
        {authorOpen && (
          <div className="absolute z-10 bg-gray-800 rounded shadow p-2 mt-1 max-h-60 overflow-y-auto">
            <div className="cursor-pointer hover:bg-gray-700 p-1 flex items-center gap-2" onClick={() => { setAuthor(''); setAuthorOpen(false); }}>
              <span>Все авторы</span>
            </div>
            {Object.entries(authors).map(([uid, prof]) => (
              <div key={uid} className="cursor-pointer hover:bg-gray-700 p-1 flex items-center gap-2" onClick={() => { setAuthor(uid); setAuthorOpen(false); }}>
                <img src={prof.photoURL} alt={prof.displayName} className="w-6 h-6 rounded-full" />
                <span>{prof.displayName}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm mb-1">Сортировать</label>
        <select value={sort} onChange={e => setSort(e.target.value)} className="p-2 rounded bg-gray-700 text-white">
          <option value="name">По имени</option>
          <option value="date">По дате</option>
        </select>
      </div>
    </div>
  );
};

export default EnemyFilters;
