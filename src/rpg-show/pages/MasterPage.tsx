import { useEffect, useRef, useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import CharacterDeck from "../components/CharacterDeck";
import PollResults from "../components/PollResults";
import RpgShowLayout from "../components/RpgShowLayout";
import {
  createShow,
  ensurePollFinished,
  setAllowVoteChange,
  setScreenMode,
  startPoll,
  stopPoll,
  subscribeOwnedShows,
  subscribePoll,
  subscribePollVotes,
  subscribeRecentPolls,
  subscribeShow,
  updateShowAudienceIdleCta,
  updateShowCharacters,
  updateShowName,
} from "../data/showStore";
import type { AudienceIdleCta, CharacterCard, PollDoc, PollStats, ScreenMode, ShowDoc, StartPollPayload } from "../types";
import { formatClock, secondsLeft } from "../utils/time";
import { uploadCharacterImage } from "../utils/uploadCharacterImage";

interface MasterPageProps {
  showId: string;
}

const EMPTY_STATS: PollStats = {
  totalVotes: 0,
  optionVotes: [0, 0, 0],
  optionPercents: [0, 0, 0],
};

const DEFAULT_POLL_OPTIONS = ["", "", ""];

const BTN_BASE =
  "inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-150 ease-out hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(2,6,23,0.35)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none";
const BTN_GHOST = `${BTN_BASE} border-slate-500 bg-slate-900/45 hover:border-slate-300 hover:bg-slate-800/75`;
const BTN_CYAN = `${BTN_BASE} border-cyan-300 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/35`;
const BTN_GREEN = `${BTN_BASE} border-emerald-300 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/35`;
const BTN_RED = `${BTN_BASE} border-rose-300 bg-rose-500/20 text-rose-100 hover:bg-rose-500/35`;
const SCREEN_MODE_LABELS: Record<ScreenMode, string> = {
  IDLE: "Ожидание",
  POLL: "Опрос",
  RESULT: "Результаты",
};

const ensureMinimumCharacters = (characters: CharacterCard[], minCount = 4): CharacterCard[] => {
  const next = [...characters];
  while (next.length < minCount) {
    next.push({
      id: `char-${Date.now()}-${next.length + 1}`,
      name: `Персонаж ${next.length + 1}`,
      imageUrl: "",
    });
  }
  return next;
};

const MasterPage: React.FC<MasterPageProps> = ({ showId }) => {
  const user = useAuth();

  const [ownedShows, setOwnedShows] = useState<ShowDoc[]>([]);
  const [show, setShow] = useState<ShowDoc | null>(null);
  const [poll, setPoll] = useState<PollDoc | null>(null);
  const [stats, setStats] = useState<PollStats>(EMPTY_STATS);
  const [recentPolls, setRecentPolls] = useState<PollDoc[]>([]);

  const [createShowName, setCreateShowName] = useState("");
  const [showName, setShowName] = useState("RPG Show");
  const [question, setQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(DEFAULT_POLL_OPTIONS);
  const [durationSec, setDurationSec] = useState(30);
  const [audienceIdleDescription, setAudienceIdleDescription] = useState("");
  const [audienceIdleButtonLabel, setAudienceIdleButtonLabel] = useState("");
  const [audienceIdleUrl, setAudienceIdleUrl] = useState("");

  const [charactersDraft, setCharactersDraft] = useState<CharacterCard[]>(ensureMinimumCharacters([], 4));
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const [savingName, setSavingName] = useState(false);
  const [savingAudienceIdleCta, setSavingAudienceIdleCta] = useState(false);
  const [busyAction, setBusyAction] = useState<string>("");
  const [flash, setFlash] = useState<string>("");
  const [errorText, setErrorText] = useState<string>("");

  const [showsPanelOpen, setShowsPanelOpen] = useState(true);
  const [pollFormOpen, setPollFormOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [charactersOpen, setCharactersOpen] = useState(false);

  const autoFinishLock = useRef(false);
  const lastCharactersKeyRef = useRef("");

  useEffect(() => {
    if (!user) {
      setOwnedShows([]);
      return undefined;
    }

    return subscribeOwnedShows(user.uid, setOwnedShows);
  }, [user]);

  useEffect(() => {
    return subscribeShow(showId, (nextShow) => {
      setShow(nextShow);
      const ownsShow = !!(nextShow && user?.uid && nextShow.masterUid === user.uid);

      if (ownsShow && nextShow?.name) {
        setShowName(nextShow.name);
      }

      if (ownsShow && nextShow?.characters) {
        const normalized = ensureMinimumCharacters(nextShow.characters, 4);
        const key = JSON.stringify(normalized);
        if (key !== lastCharactersKeyRef.current) {
          setCharactersDraft(normalized);
          lastCharactersKeyRef.current = key;
        }
      }

      if (ownsShow && nextShow?.audienceIdleCta) {
        setAudienceIdleDescription(nextShow.audienceIdleCta.description);
        setAudienceIdleButtonLabel(nextShow.audienceIdleCta.buttonLabel);
        setAudienceIdleUrl(nextShow.audienceIdleCta.url);
      }
    });
  }, [showId, user?.uid]);

  const isShowOwner = !!user && !!show && show.masterUid === user.uid;
  const activeShow = isShowOwner ? show : null;
  const canOperate = !!activeShow;

  useEffect(() => {
    if (!activeShow?.activePollId) {
      setPoll(null);
      setStats(EMPTY_STATS);
      return undefined;
    }

    return subscribePoll(showId, activeShow.activePollId, setPoll);
  }, [activeShow?.activePollId, showId]);

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
    if (!activeShow) {
      setRecentPolls([]);
      return undefined;
    }

    return subscribeRecentPolls(showId, setRecentPolls, 8);
  }, [activeShow, showId]);

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

  useEffect(() => {
    if (!flash) {
      return;
    }

    const timer = window.setTimeout(() => setFlash(""), 2600);
    return () => window.clearTimeout(timer);
  }, [flash]);

  useEffect(() => {
    if (activeShow) {
      setShowsPanelOpen(false);
      setPollFormOpen(false);
    } else {
      setShowsPanelOpen(true);
      setSettingsOpen(false);
      setCharactersOpen(false);
    }
  }, [activeShow?.id]);

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

  const goToShow = (id: string) => {
    window.location.href = `/rpg-show/master?showId=${encodeURIComponent(id)}`;
  };

  const handleCreateShow = async () => {
    if (!user) {
      setErrorText("Нужна авторизация для создания шоу");
      return;
    }

    setBusyAction("createShow");
    setErrorText("");

    try {
      const created = await createShow(user.uid, createShowName);
      setFlash(`Шоу создано: ${created.id}`);
      goToShow(created.id);
    } catch {
      setErrorText("Не удалось создать шоу");
    } finally {
      setBusyAction("");
    }
  };

  const saveShowName = async () => {
    if (!activeShow || !showName.trim()) {
      return;
    }

    setSavingName(true);
    setErrorText("");

    try {
      await updateShowName(activeShow.id, showName.trim());
      setFlash("Название шоу обновлено");
    } catch {
      setErrorText("Не удалось обновить название шоу");
    } finally {
      setSavingName(false);
    }
  };

  const saveAudienceIdleCta = async () => {
    if (!activeShow) {
      return;
    }

    setSavingAudienceIdleCta(true);
    setErrorText("");

    const payload: AudienceIdleCta = {
      description: audienceIdleDescription,
      buttonLabel: audienceIdleButtonLabel,
      url: audienceIdleUrl,
    };

    try {
      await updateShowAudienceIdleCta(activeShow.id, payload);
      setFlash("Блок ожидания для зрителей сохранен");
    } catch {
      setErrorText("Не удалось сохранить блок ожидания");
    } finally {
      setSavingAudienceIdleCta(false);
    }
  };

  const handleAllowVoteChange = async (value: boolean) => {
    if (!activeShow) {
      return;
    }

    setBusyAction("allowVoteChange");
    setErrorText("");

    try {
      await setAllowVoteChange(activeShow.id, value);
    } catch {
      setErrorText("Не удалось обновить настройку голосования");
    } finally {
      setBusyAction("");
    }
  };

  const handleSetMode = async (mode: ScreenMode) => {
    if (!activeShow) {
      return;
    }

    setBusyAction(`mode:${mode}`);
    setErrorText("");

    try {
      await setScreenMode(activeShow.id, mode);
    } catch {
      setErrorText("Не удалось переключить режим экрана");
    } finally {
      setBusyAction("");
    }
  };

  const handleStartPoll = async () => {
    if (!activeShow) {
      setErrorText("Сначала выберите шоу");
      return;
    }

    const payload: StartPollPayload = {
      question: question.trim(),
      options: pollOptions.length > 0 ? pollOptions : [""],
      durationSec: Math.max(5, durationSec),
    };

    setBusyAction("startPoll");
    setErrorText("");

    try {
      await startPoll(activeShow.id, payload);
      setFlash("Опрос запущен");
    } catch {
      setErrorText("Не удалось запустить опрос");
    } finally {
      setBusyAction("");
    }
  };

  const handleStopPoll = async () => {
    if (!activeShow || !poll) {
      return;
    }

    setBusyAction("stopPoll");
    setErrorText("");

    try {
      await stopPoll(activeShow.id, poll.id);
      setFlash("Опрос завершен");
    } catch {
      setErrorText("Не удалось остановить опрос");
    } finally {
      setBusyAction("");
    }
  };

  const handleAddOption = () => {
    setPollOptions((prev) => [...prev, ""]);
  };

  const handleRemoveOption = (index: number) => {
    setPollOptions((prev) => {
      if (prev.length <= 1) {
        return prev;
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    setPollOptions((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  };

  const handleAddCharacter = () => {
    setCharactersDraft((prev) => [
      ...prev,
      {
        id: `char-${Date.now()}-${prev.length + 1}`,
        name: `Персонаж ${prev.length + 1}`,
        imageUrl: "",
      },
    ]);
  };

  const handleRemoveCharacter = (index: number) => {
    setCharactersDraft((prev) => {
      if (prev.length <= 1) {
        return prev;
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleCharacterName = (index: number, value: string) => {
    setCharactersDraft((prev) => prev.map((card, idx) => (idx === index ? { ...card, name: value } : card)));
  };

  const handleUploadCharacter = async (index: number, file: File | null) => {
    if (!activeShow || !file) {
      return;
    }

    const character = charactersDraft[index];
    if (!character) {
      return;
    }

    setBusyAction(`upload:${character.id}`);
    setErrorText("");

    try {
      const url = await uploadCharacterImage(activeShow.id, character.id, file, (progress) => {
        setUploadProgress((prev) => ({ ...prev, [character.id]: progress }));
      });

      setCharactersDraft((prev) => prev.map((card, idx) => (idx === index ? { ...card, imageUrl: url } : card)));
      setFlash("Изображение загружено. Сохраните карточки.");
    } catch {
      setErrorText("Не удалось загрузить изображение");
    } finally {
      setBusyAction("");
      setUploadProgress((prev) => ({ ...prev, [character.id]: 0 }));
    }
  };

  const saveCharacters = async () => {
    if (!activeShow) {
      return;
    }

    setBusyAction("saveCharacters");
    setErrorText("");

    const normalized = charactersDraft.map((card, index) => ({
      ...card,
      name: card.name.trim() || `Персонаж ${index + 1}`,
    }));

    try {
      await updateShowCharacters(activeShow.id, normalized);
      setFlash("Карточки персонажей сохранены");
    } catch {
      setErrorText("Не удалось сохранить карточки персонажей");
    } finally {
      setBusyAction("");
    }
  };

  const activeShowId = activeShow?.id ?? showId;
  const audienceUrl = `${window.location.origin}/rpg-show/audience?showId=${encodeURIComponent(activeShowId)}`;
  const screenUrl = `${window.location.origin}/rpg-show/screen?showId=${encodeURIComponent(activeShowId)}`;

  const openInNewWindow = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyText = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setFlash(successMessage);
    } catch {
      setErrorText("Не удалось скопировать в буфер обмена");
    }
  };

  return (
    <RpgShowLayout
      showId={showId}
      showIdVisible={!!user && !!activeShow}
      title={activeShow?.name ? `Панель мастера: ${activeShow.name}` : "Панель мастера"}
      subtitle="Быстрый запуск опроса в центре внимания"
      toolbar={
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {user ? (
            <>
              <span className="rounded-full border border-white/15 bg-slate-900/50 px-3 py-1">{user.displayName || user.email}</span>
              <button
                type="button"
                className={`${BTN_GHOST} rounded-full px-3 py-1`}
                onClick={logout}
              >
                Выйти
              </button>
            </>
          ) : (
            <button
              type="button"
              className={`${BTN_CYAN} rounded-full px-3 py-1`}
              onClick={login}
            >
              Войти через Google
            </button>
          )}
        </div>
      }
    >
      {!user ? (
        <section>
          <article className="rounded-2xl border border-white/15 bg-slate-900/65 p-6 shadow-2xl sm:p-8">
            <p className="rounded-xl border border-amber-300/30 bg-amber-950/35 px-4 py-3 text-sm text-amber-100">
              Для доступа к панели мастера авторизуйтесь через Google.
            </p>
          </article>
        </section>
      ) : (
        <section className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="space-y-4 rounded-2xl border border-white/15 bg-slate-900/65 p-4 shadow-2xl sm:p-6">
            <section className="rounded-2xl border border-emerald-300/25 bg-emerald-950/25 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-emerald-100">Быстрый запуск опроса</h2>
                {poll ? (
                  <span className="rounded-full border border-white/20 bg-slate-900/50 px-3 py-1 text-xs text-slate-200">
                    {poll.status} · {formatClock(seconds)}
                  </span>
                ) : null}
              </div>

              {!activeShow ? (
                <p className="rounded-xl border border-white/15 bg-slate-950/45 px-4 py-3 text-sm text-slate-300">
                  Выберите одно из своих шоу в правой панели, чтобы запускать опросы.
                </p>
              ) : (
                <>
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
                      onClick={handleStartPoll}
                      disabled={!canOperate || busyAction === "startPoll"}
                      className={`${BTN_GREEN} min-w-[138px] px-4 py-2.5 text-base font-semibold`}
                    >
                      Запустить
                    </button>
                    <button
                      type="button"
                      onClick={handleStopPoll}
                      disabled={!canOperate || !poll || busyAction === "stopPoll"}
                      className={`${BTN_RED} min-w-[138px] px-4 py-2.5 text-base font-semibold`}
                    >
                      Остановить
                    </button>
                  </div>

                  <div className="mt-3 space-y-2 rounded-xl border border-white/10 bg-slate-900/30 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold">Режим экрана сцены</h3>
                      <span className="text-xs text-slate-400">Текущий: {SCREEN_MODE_LABELS[activeShow.screenMode]}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(["IDLE", "POLL", "RESULT"] as ScreenMode[]).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          disabled={!canOperate || busyAction === `mode:${mode}`}
                          onClick={() => handleSetMode(mode)}
                          className={`${BTN_GHOST} ${
                            activeShow.screenMode === mode ? "border-cyan-300 bg-cyan-500/25 text-cyan-100" : ""
                          }`}
                        >
                          {SCREEN_MODE_LABELS[mode]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="button" onClick={() => setPollFormOpen((prev) => !prev)} className={`${BTN_GHOST} mt-3 w-full text-left`}>
                    Текст вопроса и варианты (опционально) {pollFormOpen ? "▲" : "▼"}
                  </button>

                  {pollFormOpen ? (
                    <div className="mt-3 space-y-3">
                      <input
                        type="text"
                        value={question}
                        onChange={(event) => setQuestion(event.target.value)}
                        placeholder="Вопрос (опционально)"
                        className="w-full rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2 outline-none focus:border-cyan-300"
                      />

                      <div className="space-y-2">
                        {pollOptions.map((option, index) => (
                          <div key={`poll-option-${index}`} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                            <input
                              type="text"
                              value={option}
                              onChange={(event) => handleOptionChange(index, event.target.value)}
                              placeholder={`Вариант ${index + 1} (опционально)`}
                              className="rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2 outline-none focus:border-cyan-300"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(index)}
                              disabled={!canOperate || pollOptions.length <= 1}
                              className={BTN_GHOST}
                            >
                              Удалить
                            </button>
                          </div>
                        ))}

                        <button type="button" onClick={handleAddOption} disabled={!canOperate} className={BTN_GHOST}>
                          Добавить вариант
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </section>

            {activeShow ? (
              <section className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <button
                  type="button"
                  className={`${BTN_GHOST} w-full text-left`}
                  onClick={() => setSettingsOpen((prev) => !prev)}
                >
                  Настройки шоу {settingsOpen ? "▲" : "▼"}
                </button>

                {settingsOpen ? (
                  <div className="mt-3 space-y-3">
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
                        <button type="button" disabled={!canOperate || savingName} onClick={saveShowName} className={BTN_GHOST}>
                          Сохранить
                        </button>
                      </div>
                    </div>

                    <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/30 px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={activeShow?.allowVoteChange ?? true}
                        disabled={!canOperate || busyAction === "allowVoteChange"}
                        onChange={(event) => handleAllowVoteChange(event.target.checked)}
                      />
                      Разрешить изменение голоса до конца опроса
                    </label>
                  </div>
                ) : null}
              </section>
            ) : null}

            {activeShow ? (
              <section className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <button
                  type="button"
                  className={`${BTN_GHOST} w-full text-left`}
                  onClick={() => setCharactersOpen((prev) => !prev)}
                >
                  Карточки персонажей (A4) {charactersOpen ? "▲" : "▼"}
                </button>

                {charactersOpen ? (
                  <div className="mt-3 space-y-3">
                    <button type="button" onClick={handleAddCharacter} disabled={!canOperate} className={BTN_GHOST}>
                      Добавить персонажа
                    </button>

                    <div className="space-y-3">
                      {charactersDraft.map((character, index) => (
                        <article key={character.id} className="rounded-xl border border-white/10 bg-slate-900/65 p-3">
                          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                            <input
                              type="text"
                              value={character.name}
                              onChange={(event) => handleCharacterName(index, event.target.value)}
                              placeholder={`Персонаж ${index + 1}`}
                              className="rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2 outline-none focus:border-cyan-300"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveCharacter(index)}
                              disabled={!canOperate || charactersDraft.length <= 1}
                              className={BTN_GHOST}
                            >
                              Удалить
                            </button>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <label className={`${BTN_GHOST} cursor-pointer`}>
                              Загрузить A4
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(event) => {
                                  const file = event.target.files?.[0] ?? null;
                                  void handleUploadCharacter(index, file);
                                  event.target.value = "";
                                }}
                                disabled={!canOperate || busyAction === `upload:${character.id}`}
                              />
                            </label>
                            {uploadProgress[character.id] ? (
                              <span className="text-xs text-slate-400">Загрузка: {Math.round(uploadProgress[character.id])}%</span>
                            ) : null}
                          </div>
                        </article>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={saveCharacters}
                      disabled={!canOperate || busyAction === "saveCharacters"}
                      className={BTN_GREEN}
                    >
                      Сохранить карточки
                    </button>
                  </div>
                ) : null}
              </section>
            ) : null}

            {flash ? (
              <p className="rounded-xl border border-emerald-300/30 bg-emerald-950/35 px-4 py-3 text-sm text-emerald-100">{flash}</p>
            ) : null}
            {errorText ? (
              <p className="rounded-xl border border-rose-300/30 bg-rose-950/35 px-4 py-3 text-sm text-rose-200">{errorText}</p>
            ) : null}
          </article>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-white/15 bg-slate-900/65 p-4 shadow-2xl">
              <button
                type="button"
                onClick={() => setShowsPanelOpen((prev) => !prev)}
                className={`${BTN_GHOST} w-full text-left`}
              >
                Мои шоу и ссылки {showsPanelOpen ? "▲" : "▼"}
              </button>

              {showsPanelOpen ? (
                <div className="mt-3 space-y-3">
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <input
                      type="text"
                      value={createShowName}
                      onChange={(event) => setCreateShowName(event.target.value)}
                      placeholder="Название нового шоу (опционально)"
                      className="rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2 outline-none focus:border-cyan-300"
                    />
                    <button type="button" onClick={handleCreateShow} disabled={busyAction === "createShow"} className={BTN_CYAN}>
                      Создать шоу
                    </button>
                  </div>

                  <select
                    value={ownedShows.some((item) => item.id === showId) ? showId : ""}
                    onChange={(event) => {
                      const selectedId = event.target.value;
                      if (selectedId) {
                        goToShow(selectedId);
                      }
                    }}
                    className="w-full rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2 outline-none focus:border-cyan-300"
                  >
                    <option value="">Выберите шоу</option>
                    {ownedShows.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.id})
                      </option>
                    ))}
                  </select>

                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <div
                      className={`truncate rounded-xl border px-3 py-2 text-sm ${
                        activeShow ? "border-slate-500 bg-slate-900/45 text-slate-200" : "border-slate-700 text-slate-500"
                      }`}
                    >
                      ID шоу: {activeShowId}
                    </div>
                    <button
                      type="button"
                      className={BTN_GHOST}
                      onClick={() => copyText(activeShowId, "ID шоу скопирован")}
                      disabled={!activeShow}
                    >
                      Копировать ID
                    </button>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <button type="button" className={BTN_GHOST} onClick={() => openInNewWindow(audienceUrl)} disabled={!activeShow}>
                      Пульт зрителя
                    </button>
                    <button
                      type="button"
                      className={BTN_GHOST}
                      onClick={() => copyText(audienceUrl, "Ссылка на пульт скопирована")}
                      disabled={!activeShow}
                    >
                      Копировать
                    </button>
                  </div>
                  <a
                    href={audienceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`block truncate rounded-xl border px-3 py-2 text-sm ${
                      activeShow ? "border-slate-500 bg-slate-900/45 text-slate-200" : "pointer-events-none border-slate-700 text-slate-500"
                    }`}
                  >
                    {audienceUrl}
                  </a>

                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <button type="button" className={BTN_GHOST} onClick={() => openInNewWindow(screenUrl)} disabled={!activeShow}>
                      Экран сцены
                    </button>
                    <button
                      type="button"
                      className={BTN_GHOST}
                      onClick={() => copyText(screenUrl, "Ссылка на экран сцены скопирована")}
                      disabled={!activeShow}
                    >
                      Копировать
                    </button>
                  </div>
                  <a
                    href={screenUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`block truncate rounded-xl border px-3 py-2 text-sm ${
                      activeShow ? "border-slate-500 bg-slate-900/45 text-slate-200" : "pointer-events-none border-slate-700 text-slate-500"
                    }`}
                  >
                    {screenUrl}
                  </a>

                  <section className="space-y-2 rounded-xl border border-white/10 bg-slate-950/40 p-3">
                    <h3 className="text-sm font-semibold text-slate-200">Блок ожидания для пульта зрителя</h3>
                    <p className="text-xs text-slate-400">
                      В режиме ожидания на пульте зрителя будут показаны описание и кнопка перехода.
                    </p>
                    <textarea
                      rows={3}
                      value={audienceIdleDescription}
                      onChange={(event) => setAudienceIdleDescription(event.target.value)}
                      placeholder="Текстовое описание (опционально)"
                      className="w-full rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-300"
                      disabled={!activeShow}
                    />
                    <input
                      type="text"
                      value={audienceIdleButtonLabel}
                      onChange={(event) => setAudienceIdleButtonLabel(event.target.value)}
                      placeholder="Название кнопки (например: Открыть правила)"
                      className="w-full rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-300"
                      disabled={!activeShow}
                    />
                    <input
                      type="url"
                      value={audienceIdleUrl}
                      onChange={(event) => setAudienceIdleUrl(event.target.value)}
                      placeholder="Ссылка для кнопки (https://...)"
                      className="w-full rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-300"
                      disabled={!activeShow}
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={saveAudienceIdleCta}
                        disabled={!activeShow || savingAudienceIdleCta}
                        className={BTN_GREEN}
                      >
                        Сохранить блок
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAudienceIdleDescription("");
                          setAudienceIdleButtonLabel("");
                          setAudienceIdleUrl("");
                        }}
                        disabled={!activeShow || savingAudienceIdleCta}
                        className={BTN_GHOST}
                      >
                        Очистить поля
                      </button>
                    </div>
                  </section>
                </div>
              ) : activeShow ? (
                <p className="mt-3 text-sm text-slate-300">
                  Активное шоу: <span className="font-semibold text-white">{activeShow.name}</span>
                </p>
              ) : null}
            </section>

            {activeShow ? (
              <>
                <section className="rounded-2xl border border-white/15 bg-slate-900/65 p-4 shadow-2xl">
                  <h2 className="mb-3 text-lg font-semibold">Состояние текущего опроса</h2>
                  {poll ? (
                    <>
                      <p className="mb-1 text-sm text-slate-300">{poll.question.trim() || "Без текста вопроса"}</p>
                      <p className="mb-3 text-xs text-slate-400">
                        Статус: {poll.status} · Таймер: {formatClock(seconds)}
                      </p>
                      <PollResults poll={poll} stats={stats} compact />
                    </>
                  ) : (
                    <p className="text-sm text-slate-300">Активного опроса сейчас нет.</p>
                  )}
                </section>

                <section className="rounded-2xl border border-white/15 bg-slate-900/65 p-4 shadow-2xl">
                  <h2 className="mb-3 text-lg font-semibold">Превью карточек</h2>
                  <CharacterDeck characters={charactersDraft.slice(0, 4)} />
                </section>

                <section className="rounded-2xl border border-white/15 bg-slate-900/65 p-4 shadow-2xl">
                  <h2 className="mb-3 text-lg font-semibold">Последние опросы</h2>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {recentPolls.map((item) => (
                      <li key={item.id} className="rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                        <p className="font-medium text-slate-100">{item.question.trim() || "Без текста вопроса"}</p>
                        <p className="text-xs text-slate-400">
                          {item.status} · {new Date(item.startedAt).toLocaleTimeString()}
                        </p>
                      </li>
                    ))}
                    {recentPolls.length === 0 ? <li>Пока нет завершенных опросов.</li> : null}
                  </ul>
                </section>
              </>
            ) : null}
          </aside>
        </section>
      )}
    </RpgShowLayout>
  );
};

export default MasterPage;
