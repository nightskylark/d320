import React, { useState, useEffect, useRef } from "react";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline, XMarkIcon } from "@heroicons/react/24/outline";
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
  onPrint: () => void;
}

const EnemyFilters: React.FC<Props> = ({ search, setSearch, tag, setTag, liked, setLiked, author, setAuthor, sort, setSort, authors, onPrint }) => {
  const fixedTags = useFixedTags();
  const [authorOpen, setAuthorOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const authorProfile = author ? authors[author] : undefined;

  useEffect(() => {
    if (!authorOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setAuthorOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAuthorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [authorOpen]);

  return (
    <div className="flex flex-wrap gap-4 my-4 items-center">
      <input
        type="text"
        placeholder="Поиск"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white flex-1 h-10"
      />
      <button
        type="button"
        title="Избранное"
        onClick={() => setLiked(!liked)}
        className="text-blue-700 dark:text-sky-300 hover:text-blue-500 dark:hover:text-sky-200 transition flex items-center gap-1 h-10 px-2 cursor-pointer"
      >
        {liked ? <StarSolid className="w-5 h-5" /> : <StarOutline className="w-5 h-5" />}
        <span className="text-sm">Избранное</span>
      </button>
      <select
        value={tag}
        onChange={e => setTag(e.target.value)}
        className="p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white h-10 hover:bg-gray-100 dark:hover:bg-gray-500 transition cursor-pointer"
      >
        <option value="">Тег</option>
        {fixedTags.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <div className="relative">
        <button
          type="button"
          onClick={() => setAuthorOpen(o => !o)}
          className="p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white flex items-center gap-2 h-10 hover:bg-gray-100 dark:hover:bg-gray-500 transition cursor-pointer"
        >
          {authorProfile && <img src={authorProfile.photoURL} alt="avatar" className="w-6 h-6 rounded-full" />}
          <span>{authorProfile ? authorProfile.displayName : 'Автор'}</span>
        </button>
        {authorOpen && (
          <div
            ref={panelRef}
            className="absolute left-0 z-10 bg-white dark:bg-gray-800 rounded shadow p-2 mt-1 max-h-60 overflow-y-auto w-48"
          >
            <div
              className="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 p-1 flex items-center gap-2"
              onClick={() => {
                setAuthor('');
                setAuthorOpen(false);
              }}
            >
              <span>Все авторы</span>
            </div>
            {Object.entries(authors).map(([uid, prof]) => (
              <div
                key={uid}
                className="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 p-1 flex items-center gap-2"
                onClick={() => {
                  setAuthor(uid);
                  setAuthorOpen(false);
                }}
              >
                <img src={prof.photoURL} alt={prof.displayName} className="w-6 h-6 rounded-full" />
                <span>{prof.displayName}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          setSearch('');
          setTag('');
          setLiked(false);
          setAuthor('');
          setSort('name');
        }}
        className="flex items-center gap-1 p-2 rounded border text-blue-700 dark:text-sky-300 hover:text-blue-500 dark:hover:text-sky-200 border-blue-700 dark:border-sky-300 hover:border-blue-500 dark:hover:border-sky-200 transition h-10 cursor-pointer"
      >
        <XMarkIcon className="w-5 h-5" />
        Сбросить фильтры
      </button>
      <span className="text-sm">Сортировка:</span>
      <select
        value={sort}
        onChange={e => setSort(e.target.value)}
        className="p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white h-10 hover:bg-gray-100 dark:hover:bg-gray-500 transition cursor-pointer"
      >
        <option value="name">Имя</option>
        <option value="date">Дата</option>
      </select>
      <button
        type="button"
        onClick={onPrint}
        className="ml-auto flex items-center gap-1 p-2 rounded border text-blue-700 dark:text-sky-300 hover:text-blue-500 dark:hover:text-sky-200 border-blue-700 dark:border-sky-300 hover:border-blue-500 dark:hover:border-sky-200 transition h-10 cursor-pointer"
      >
        Напечатать
      </button>
    </div>
  );
};

export default EnemyFilters;
