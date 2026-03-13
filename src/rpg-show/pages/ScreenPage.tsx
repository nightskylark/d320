import { useEffect, useRef, useState } from "react";
import PollResults from "../components/PollResults";
import {
  ensurePollFinished,
  subscribePoll,
  subscribePollVotes,
  subscribeShow,
} from "../data/showStore";
import type { CharacterCard, PollDoc, PollStats, ShowDoc } from "../types";
import { formatClock, secondsLeft } from "../utils/time";

interface ScreenPageProps {
  showId: string;
}

const EMPTY_STATS: PollStats = {
  totalVotes: 0,
  optionVotes: [0, 0, 0],
  optionPercents: [0, 0, 0],
};

const placeholderCard = (index: number): CharacterCard => ({
  id: `placeholder-${index + 1}`,
  name: `Персонаж ${index + 1}`,
  imageUrl: "",
});

const ScreenCharacterCard: React.FC<{ card: CharacterCard; index: number }> = ({ card, index }) => {
  return (
    <article className="h-full w-fit min-h-0 rounded-2xl border border-white/15 bg-slate-900/75 p-2 shadow-2xl">
      <div className="mb-1 w-full truncate px-1 text-center text-sm text-slate-300">{card.name || `Персонаж ${index + 1}`}</div>
      <div className="flex h-[calc(100%-1.35rem)] items-center justify-center">
        <div className="relative h-full aspect-[210/297] overflow-hidden rounded-xl border border-white/10 bg-slate-950/80">
          {card.imageUrl ? (
            <img src={card.imageUrl} alt={card.name || `Персонаж ${index + 1}`} className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-center text-sm text-slate-400">
              A4 плейсхолдер
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

const ScreenPage: React.FC<ScreenPageProps> = ({ showId }) => {
  const [show, setShow] = useState<ShowDoc | null>(null);
  const [poll, setPoll] = useState<PollDoc | null>(null);
  const [stats, setStats] = useState<PollStats>(EMPTY_STATS);
  const [errorText, setErrorText] = useState("");
  const [clockTick, setClockTick] = useState(() => Date.now());

  const autoFinishLock = useRef(false);

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

  const cardsSource = show?.characters ?? [];
  const cards = Array.from({ length: 4 }, (_, index) => cardsSource[index] ?? placeholderCard(index));

  const leftCards = cards.slice(0, 2);
  const rightCards = cards.slice(2, 4);

  const isPollVisible = show?.screenMode === "POLL" && poll && poll.status === "ACTIVE" && seconds > 0;
  const isResultVisible = show?.screenMode === "RESULT" && poll;
  const isIdleVisible = show?.screenMode !== "POLL" && show?.screenMode !== "RESULT";

  return (
    <div className="rpg-screen h-screen overflow-hidden px-3 py-3 text-slate-100 sm:px-4 sm:py-4">
      <div className="mx-auto grid h-full w-full gap-3 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
        <section className="grid min-h-0 w-fit grid-rows-2 justify-items-center gap-3">
          {leftCards.map((card, index) => (
            <ScreenCharacterCard key={card.id} card={card} index={index} />
          ))}
        </section>

        <section className="min-h-0 rounded-3xl border border-white/15 bg-slate-900/75 p-4 shadow-[0_18px_90px_-50px_rgba(14,165,233,0.6)] sm:p-5">
          <div className="flex h-full min-h-0 flex-col">
            <header className="mb-3 shrink-0 text-center">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/85">RPG show screen</p>
              <h1 className="mt-1 text-4xl font-semibold sm:text-6xl">{show?.name ?? "RPG Show"}</h1>
              <p className="mt-1 text-sm text-slate-300">{new Date(clockTick).toLocaleTimeString()}</p>
            </header>

            <div className="min-h-0 flex-1">
              {isIdleVisible ? (
                <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-cyan-300/20 bg-slate-950/60 p-6 text-center">
                  <div className="mb-6 h-28 w-28 rounded-full border-2 border-cyan-300/30 bg-cyan-500/10" />
                  <p className="text-lg uppercase tracking-[0.24em] text-slate-400">Режим ожидания</p>
                </div>
              ) : null}

              {isPollVisible && poll ? (
                <div className="flex h-full flex-col rounded-3xl border border-cyan-300/20 bg-slate-950/60 p-6 text-center">
                  <p className="mb-2 text-lg uppercase tracking-[0.2em] text-cyan-200">Опрос активен</p>
                  {poll.question.trim() ? <h2 className="mb-4 text-3xl font-semibold sm:text-5xl">{poll.question}</h2> : null}
                  <div className="mb-5 text-6xl font-bold text-amber-200 sm:text-8xl">{formatClock(seconds)}</div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {poll.options.map((option, index) => (
                      <article
                        key={`${poll.id}-screen-option-${index}`}
                        className="rounded-2xl border border-cyan-300/25 bg-slate-900/70 px-4 py-5"
                      >
                        <p className="mb-1 text-5xl font-bold text-cyan-200">{index + 1}</p>
                        {option.trim() ? <p className="text-xl text-slate-100">{option}</p> : null}
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              {isResultVisible && poll ? (
                <div className="h-full rounded-3xl border border-emerald-300/20 bg-slate-950/60 p-6">
                  <p className="mb-3 text-center text-lg uppercase tracking-[0.2em] text-emerald-200">Результаты</p>
                  {poll.question.trim() ? <h2 className="mb-5 text-center text-3xl font-semibold sm:text-5xl">{poll.question}</h2> : null}
                  <PollResults poll={poll} stats={stats} variant="screen" />
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid min-h-0 w-fit grid-rows-2 justify-items-center gap-3">
          {rightCards.map((card, index) => (
            <ScreenCharacterCard key={card.id} card={card} index={index + 2} />
          ))}
        </section>
      </div>

      {errorText ? (
        <p className="mx-auto mt-2 max-w-[1900px] rounded-xl border border-rose-300/35 bg-rose-950/35 px-4 py-2 text-sm text-rose-100">
          {errorText}
        </p>
      ) : null}
    </div>
  );
};

export default ScreenPage;
