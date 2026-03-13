import { useEffect, useRef, useState } from "react";
import CharacterDeck from "../components/CharacterDeck";
import PollResults from "../components/PollResults";
import {
  ensurePollFinished,
  ensureShow,
  subscribePoll,
  subscribePollVotes,
  subscribeShow,
} from "../data/showStore";
import type { PollDoc, PollStats, ShowDoc } from "../types";
import { formatClock, secondsLeft } from "../utils/time";

interface ScreenPageProps {
  showId: string;
}

const EMPTY_STATS: PollStats = {
  totalVotes: 0,
  optionVotes: [0, 0, 0],
  optionPercents: [0, 0, 0],
};

const ScreenPage: React.FC<ScreenPageProps> = ({ showId }) => {
  const [show, setShow] = useState<ShowDoc | null>(null);
  const [poll, setPoll] = useState<PollDoc | null>(null);
  const [stats, setStats] = useState<PollStats>(EMPTY_STATS);
  const [errorText, setErrorText] = useState("");
  const [clockTick, setClockTick] = useState(() => Date.now());

  const autoFinishLock = useRef(false);

  useEffect(() => {
    ensureShow(showId).catch(() => {
      setErrorText("Нет подключения к источнику шоу");
    });
  }, [showId]);

  useEffect(() => {
    const timer = window.setInterval(() => setClockTick(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    return subscribeShow(showId, setShow);
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

  const isPollVisible = show?.screenMode === "POLL" && poll && poll.status === "ACTIVE" && seconds > 0;
  const isResultVisible = show?.screenMode === "RESULT" || (poll && (poll.status === "FINISHED" || seconds === 0));

  return (
    <div className="rpg-screen min-h-screen px-4 pb-8 pt-6 text-slate-100 sm:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/85">RPG show screen</p>
          <h1 className="text-3xl font-semibold sm:text-5xl">{show?.name ?? "RPG Show"}</h1>
        </div>
        <div className="text-right text-sm text-slate-300">
          <div>showId: {showId}</div>
          <div>{new Date(clockTick).toLocaleTimeString()}</div>
        </div>
      </header>

      <section className="mb-8">
        <CharacterDeck characters={show?.characters ?? []} />
      </section>

      <section className="rounded-3xl border border-white/15 bg-slate-950/70 p-6 shadow-[0_18px_80px_-40px_rgba(14,165,233,0.7)] sm:p-8">
        {isPollVisible && poll ? (
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.2em] text-cyan-200">Опрос активен</p>
            <h2 className="mb-4 text-2xl font-semibold sm:text-4xl">{poll.question}</h2>
            <div className="mb-5 text-4xl font-bold text-amber-200 sm:text-6xl">{formatClock(seconds)}</div>
            <div className="grid gap-3 sm:grid-cols-3">
              {poll.options.map((option, index) => (
                <article
                  key={`${poll.id}-screen-option-${index}`}
                  className="rounded-2xl border border-cyan-300/25 bg-slate-900/70 px-4 py-5"
                >
                  <p className="mb-2 text-3xl font-bold text-cyan-200">{index + 1}</p>
                  <p className="text-lg text-slate-100">{option}</p>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {isResultVisible && poll ? (
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.2em] text-emerald-200">Результаты</p>
            <h2 className="mb-4 text-2xl font-semibold sm:text-4xl">{poll.question}</h2>
            <PollResults poll={poll} stats={stats} />
          </div>
        ) : null}

        {!isPollVisible && !isResultVisible ? (
          <div className="py-12 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Режим ожидания</p>
            <h2 className="mt-3 text-2xl font-semibold sm:text-4xl">Мастер пока не запустил активный экран</h2>
          </div>
        ) : null}
      </section>

      {errorText ? (
        <p className="mt-4 rounded-xl border border-rose-300/35 bg-rose-950/35 px-4 py-2 text-sm text-rose-100">{errorText}</p>
      ) : null}
    </div>
  );
};

export default ScreenPage;
