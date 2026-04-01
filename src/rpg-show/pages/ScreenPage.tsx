import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
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
    <article className="flex h-full w-fit min-h-0 items-center justify-center">
      <div className="relative h-full aspect-[210/297] overflow-hidden rounded-2xl bg-slate-950/55">
        {card.imageUrl ? (
          <img src={card.imageUrl} alt={card.name || `Персонаж ${index + 1}`} className="h-full w-full object-cover object-top" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-center text-sm text-slate-400">
            A4 плейсхолдер
          </div>
        )}
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
  const [audienceQrDataUrl, setAudienceQrDataUrl] = useState("");

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

  const audienceUrl = `${window.location.origin}/rpg-show/audience?showId=${encodeURIComponent(showId)}`;

  useEffect(() => {
    let cancelled = false;

    void QRCode.toDataURL(audienceUrl, {
      width: 360,
      margin: 1,
      color: {
        dark: "#e2e8f0",
        light: "#00000000",
      },
    })
      .then((dataUrl) => {
        if (!cancelled) {
          setAudienceQrDataUrl(dataUrl);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAudienceQrDataUrl("");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [audienceUrl]);

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
                  {audienceQrDataUrl ? (
                    <img src={audienceQrDataUrl} alt={`QR для пульта зрителя шоу ${showId}`} className="mb-5 h-56 w-56 rounded-2xl bg-slate-900/40 p-3" />
                  ) : (
                    <div className="mb-5 flex h-56 w-56 items-center justify-center rounded-2xl bg-slate-900/40 text-sm text-slate-400">
                      Генерация QR...
                    </div>
                  )}
                  <p className="text-lg uppercase tracking-[0.24em] text-slate-400">Режим ожидания</p>
                  <p className="mt-3 text-sm text-slate-300">Сканируйте QR, чтобы открыть зрительский пульт</p>
                  <p className="mt-1 max-w-full truncate text-xs text-slate-400">{audienceUrl}</p>
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
