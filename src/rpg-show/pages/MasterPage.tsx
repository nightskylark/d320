import { useEffect, useMemo, useRef, useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import CharacterDeck from "../components/CharacterDeck";
import PollResults from "../components/PollResults";
import RpgShowLayout from "../components/RpgShowLayout";
import {
  ensurePollFinished,
  ensureShow,
  setAllowVoteChange,
  setScreenMode,
  startPoll,
  stopPoll,
  subscribePoll,
  subscribePollVotes,
  subscribeRecentPolls,
  subscribeShow,
  updateShowName,
} from "../data/showStore";
import type { PollDoc, PollStats, ScreenMode, ShowDoc, StartPollPayload } from "../types";
import { formatClock, secondsLeft } from "../utils/time";

interface MasterPageProps {
  showId: string;
}

const EMPTY_STATS: PollStats = {
  totalVotes: 0,
  optionVotes: [0, 0, 0],
  optionPercents: [0, 0, 0],
};

const parseWhitelist = (): string[] => {
  const raw = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_RPG_SHOW_MASTER_EMAILS;

  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
};

const MasterPage: React.FC<MasterPageProps> = ({ showId }) => {
  const user = useAuth();
  const emailWhitelist = useMemo(() => parseWhitelist(), []);
  const [show, setShow] = useState<ShowDoc | null>(null);
  const [poll, setPoll] = useState<PollDoc | null>(null);
  const [stats, setStats] = useState<PollStats>(EMPTY_STATS);
  const [recentPolls, setRecentPolls] = useState<PollDoc[]>([]);

  const [showName, setShowName] = useState("RPG Show");
  const [question, setQuestion] = useState("Куда герои идут дальше?");
  const [option1, setOption1] = useState("В доки");
  const [option2, setOption2] = useState("К капитану");
  const [option3, setOption3] = useState("К черному рынку");
  const [durationSec, setDurationSec] = useState(30);

  const [savingName, setSavingName] = useState(false);
  const [busyAction, setBusyAction] = useState<string>("");
  const [flash, setFlash] = useState<string>("");
  const [errorText, setErrorText] = useState<string>("");

  const autoFinishLock = useRef(false);

  const userEmail = user?.email?.toLowerCase() ?? "";
  const isAuthorized = !!user && (emailWhitelist.length === 0 || emailWhitelist.includes(userEmail));

  useEffect(() => {
    ensureShow(showId, "RPG Show", user?.uid ?? null).catch(() => {
      setErrorText("Не удалось инициализировать шоу");
    });
  }, [showId, user?.uid]);

  useEffect(() => {
    return subscribeShow(showId, (nextShow) => {
      setShow(nextShow);
      if (nextShow?.name) {
        setShowName(nextShow.name);
      }
    });
  }, [showId]);

  useEffect(() => {
    if (!show?.activePollId) {
      setPoll(null);
      setStats(EMPTY_STATS);
      return undefined;
    }

    return subscribePoll(showId, show.activePollId, setPoll);
  }, [show?.activePollId, showId]);

  useEffect(() => {
    if (!poll) {
      setStats(EMPTY_STATS);
      return undefined;
    }

    return subscribePollVotes(showId, poll.id, poll.options.length, (nextStats) => {
      setStats(nextStats);
    });
  }, [poll, showId]);

  useEffect(() => {
    return subscribeRecentPolls(showId, setRecentPolls, 8);
  }, [showId]);

  const seconds = poll ? secondsLeft(poll.endsAt) : 0;

  useEffect(() => {
    if (!poll || poll.status !== "ACTIVE" || seconds > 0 || autoFinishLock.current) {
      return;
    }

    autoFinishLock.current = true;
    ensurePollFinished(showId, poll.id)
      .catch(() => {
        setErrorText("Не удалось завершить опрос автоматически");
      })
      .finally(() => {
        window.setTimeout(() => {
          autoFinishLock.current = false;
        }, 500);
      });
  }, [poll, seconds, showId]);

  const login = async () => {
    setErrorText("");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch {
      setErrorText("Не удалось выполнить вход");
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const saveShowName = async () => {
    if (!showName.trim()) {
      return;
    }

    setSavingName(true);
    setErrorText("");
    try {
      await updateShowName(showId, showName.trim());
      setFlash("Название шоу обновлено");
    } catch {
      setErrorText("Не удалось обновить название шоу");
    } finally {
      setSavingName(false);
    }
  };

  const handleAllowVoteChange = async (value: boolean) => {
    setErrorText("");
    setBusyAction("allowVoteChange");
    try {
      await setAllowVoteChange(showId, value);
    } catch {
      setErrorText("Не удалось обновить настройку голосования");
    } finally {
      setBusyAction("");
    }
  };

  const handleSetMode = async (mode: ScreenMode) => {
    setBusyAction(`mode:${mode}`);
    setErrorText("");
    try {
      await setScreenMode(showId, mode);
    } catch {
      setErrorText("Не удалось переключить режим экрана");
    } finally {
      setBusyAction("");
    }
  };

  const handleStartPoll = async () => {
    const payload: StartPollPayload = {
      question: question.trim(),
      options: [option1.trim(), option2.trim(), option3.trim()],
      durationSec: Math.max(5, durationSec),
    };

    if (!payload.question || payload.options.some((value) => !value)) {
      setErrorText("Заполните вопрос и все три варианта ответа");
      return;
    }

    setBusyAction("startPoll");
    setErrorText("");

    try {
      await startPoll(showId, payload);
      setFlash("Опрос запущен");
    } catch {
      setErrorText("Не удалось запустить опрос");
    } finally {
      setBusyAction("");
    }
  };

  const handleStopPoll = async () => {
    if (!poll) {
      return;
    }

    setBusyAction("stopPoll");
    setErrorText("");
    try {
      await stopPoll(showId, poll.id);
      setFlash("Опрос завершен");
    } catch {
      setErrorText("Не удалось остановить опрос");
    } finally {
      setBusyAction("");
    }
  };

  useEffect(() => {
    if (!flash) {
      return;
    }

    const timer = window.setTimeout(() => setFlash(""), 2200);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const canOperate = isAuthorized;
  const audienceUrl = `${window.location.origin}/rpg-show/audience?showId=${encodeURIComponent(showId)}`;
  const screenUrl = `${window.location.origin}/rpg-show/screen?showId=${encodeURIComponent(showId)}`;

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setFlash("Ссылка скопирована");
    } catch {
      setErrorText("Не удалось скопировать ссылку");
    }
  };

  return (
    <RpgShowLayout
      showId={showId}
      view="master"
      title={show?.name ? `Панель мастера: ${show.name}` : "Панель мастера"}
      subtitle="Управляйте состоянием сцены, запускайте опросы и следите за статистикой в реальном времени."
      toolbar={
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {user ? (
            <>
              <span className="rounded-full border border-white/15 bg-slate-900/50 px-3 py-1">{user.displayName || user.email}</span>
              <button
                type="button"
                className="rounded-full border border-slate-500 px-3 py-1 hover:border-slate-200"
                onClick={logout}
              >
                Выйти
              </button>
            </>
          ) : (
            <button
              type="button"
              className="rounded-full border border-cyan-300 bg-cyan-500/20 px-3 py-1 text-cyan-100 hover:bg-cyan-500/35"
              onClick={login}
            >
              Войти через Google
            </button>
          )}
        </div>
      }
    >
      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="space-y-5 rounded-2xl border border-white/15 bg-slate-900/65 p-4 shadow-2xl sm:p-6">
          {!user ? (
            <p className="rounded-xl border border-amber-300/30 bg-amber-950/35 px-4 py-3 text-sm text-amber-100">
              Для панели мастера требуется вход через Google.
            </p>
          ) : null}

          {user && !isAuthorized ? (
            <p className="rounded-xl border border-rose-300/30 bg-rose-950/35 px-4 py-3 text-sm text-rose-200">
              Этот аккаунт не входит в список мастер-пользователей.
            </p>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="show-name" className="text-sm font-semibold text-slate-200">
              Название шоу
            </label>
            <div className="flex gap-2">
              <input
                id="show-name"
                type="text"
                value={showName}
                onChange={(event) => setShowName(event.target.value)}
                className="w-full rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2 outline-none focus:border-cyan-300"
              />
              <button
                type="button"
                disabled={!canOperate || savingName}
                onClick={saveShowName}
                className="rounded-xl border border-slate-500 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Сохранить
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Новый опрос</h2>
            <input
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Вопрос"
              className="w-full rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2 outline-none focus:border-cyan-300"
            />
            <div className="grid gap-2 sm:grid-cols-3">
              <input
                type="text"
                value={option1}
                onChange={(event) => setOption1(event.target.value)}
                placeholder="Вариант 1"
                className="rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2 outline-none focus:border-cyan-300"
              />
              <input
                type="text"
                value={option2}
                onChange={(event) => setOption2(event.target.value)}
                placeholder="Вариант 2"
                className="rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2 outline-none focus:border-cyan-300"
              />
              <input
                type="text"
                value={option3}
                onChange={(event) => setOption3(event.target.value)}
                placeholder="Вариант 3"
                className="rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2 outline-none focus:border-cyan-300"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm text-slate-200" htmlFor="duration">
                Длительность (сек)
              </label>
              <input
                id="duration"
                type="number"
                min={5}
                max={180}
                value={durationSec}
                onChange={(event) => setDurationSec(Number(event.target.value) || 30)}
                className="w-24 rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2 outline-none focus:border-cyan-300"
              />
              <button
                type="button"
                disabled={!canOperate || busyAction === "startPoll"}
                onClick={handleStartPoll}
                className="rounded-xl border border-emerald-300 bg-emerald-500/20 px-4 py-2 text-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Запустить
              </button>
              <button
                type="button"
                disabled={!canOperate || !poll || busyAction === "stopPoll"}
                onClick={handleStopPoll}
                className="rounded-xl border border-rose-300 bg-rose-500/20 px-4 py-2 text-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Остановить
              </button>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-white/10 bg-slate-950/45 p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold">Режим экрана</h3>
              <span className="text-xs text-slate-400">Текущий: {show?.screenMode ?? "IDLE"}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["IDLE", "POLL", "RESULT"] as ScreenMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  disabled={!canOperate || busyAction === `mode:${mode}`}
                  onClick={() => handleSetMode(mode)}
                  className={`rounded-full border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 ${
                    show?.screenMode === mode
                      ? "border-cyan-300 bg-cyan-400/25 text-cyan-100"
                      : "border-slate-500 bg-slate-900/50 text-slate-200"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-slate-950/45 p-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={show?.allowVoteChange ?? true}
                disabled={!canOperate || busyAction === "allowVoteChange"}
                onChange={(event) => handleAllowVoteChange(event.target.checked)}
              />
              Разрешить изменение голоса до конца опроса
            </label>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              className="rounded-xl border border-slate-500 bg-slate-900/45 px-3 py-2 text-sm"
              onClick={() => copyLink(audienceUrl)}
            >
              Скопировать ссылку зрителя
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-500 bg-slate-900/45 px-3 py-2 text-sm"
              onClick={() => copyLink(screenUrl)}
            >
              Скопировать ссылку сцены
            </button>
          </div>

          {flash ? (
            <p className="rounded-xl border border-emerald-300/30 bg-emerald-950/35 px-4 py-3 text-sm text-emerald-100">{flash}</p>
          ) : null}
          {errorText ? (
            <p className="rounded-xl border border-rose-300/30 bg-rose-950/35 px-4 py-3 text-sm text-rose-200">{errorText}</p>
          ) : null}
        </article>

        <aside className="space-y-5">
          <article className="rounded-2xl border border-white/15 bg-slate-900/65 p-4 shadow-2xl sm:p-6">
            <h2 className="mb-3 text-lg font-semibold">Состояние текущего опроса</h2>
            {poll ? (
              <>
                <p className="mb-1 text-sm text-slate-300">{poll.question}</p>
                <p className="mb-3 text-xs text-slate-400">
                  Статус: {poll.status} · Таймер: {formatClock(seconds)}
                </p>
                <PollResults poll={poll} stats={stats} compact />
              </>
            ) : (
              <p className="text-sm text-slate-300">Активного опроса сейчас нет.</p>
            )}
          </article>

          <article className="rounded-2xl border border-white/15 bg-slate-900/65 p-4 shadow-2xl sm:p-6">
            <h2 className="mb-3 text-lg font-semibold">Карточки персонажей</h2>
            <CharacterDeck characters={show?.characters ?? []} />
          </article>

          <article className="rounded-2xl border border-white/15 bg-slate-900/65 p-4 shadow-2xl sm:p-6">
            <h2 className="mb-3 text-lg font-semibold">Последние опросы</h2>
            <ul className="space-y-2 text-sm text-slate-300">
              {recentPolls.map((item) => (
                <li key={item.id} className="rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                  <p className="font-medium text-slate-100">{item.question}</p>
                  <p className="text-xs text-slate-400">
                    {item.status} · {new Date(item.startedAt).toLocaleTimeString()}
                  </p>
                </li>
              ))}
              {recentPolls.length === 0 ? <li>Пока нет завершенных опросов.</li> : null}
            </ul>
          </article>
        </aside>
      </section>
    </RpgShowLayout>
  );
};

export default MasterPage;
