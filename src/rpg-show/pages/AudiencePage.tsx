import { useEffect, useMemo, useRef, useState } from "react";
import RpgShowLayout from "../components/RpgShowLayout";
import PollResults from "../components/PollResults";
import {
  ensurePollFinished,
  ensureShow,
  submitVote,
  subscribePoll,
  subscribePollVotes,
  subscribeShow,
  subscribeVoterVote,
} from "../data/showStore";
import type { PollDoc, PollStats, ShowDoc, VoteDoc } from "../types";
import { formatClock, secondsLeft } from "../utils/time";
import { getOrCreateVoterKey } from "../utils/voterKey";

interface AudiencePageProps {
  showId: string;
}

const EMPTY_STATS: PollStats = {
  totalVotes: 0,
  optionVotes: [0, 0, 0],
  optionPercents: [0, 0, 0],
};

const AudiencePage: React.FC<AudiencePageProps> = ({ showId }) => {
  const [show, setShow] = useState<ShowDoc | null>(null);
  const [poll, setPoll] = useState<PollDoc | null>(null);
  const [stats, setStats] = useState<PollStats>(EMPTY_STATS);
  const [currentVote, setCurrentVote] = useState<VoteDoc | null>(null);
  const [feedback, setFeedback] = useState("Ожидание активного опроса");
  const [errorText, setErrorText] = useState<string>("");
  const [now, setNow] = useState(() => Date.now());
  const [submittingOption, setSubmittingOption] = useState<number | null>(null);

  const voterKey = useMemo(() => getOrCreateVoterKey(showId), [showId]);
  const autoFinishLock = useRef(false);

  useEffect(() => {
    ensureShow(showId).catch(() => {
      setErrorText("Не удалось инициализировать шоу");
    });
  }, [showId]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    return subscribeShow(showId, setShow);
  }, [showId]);

  useEffect(() => {
    if (!show?.activePollId) {
      setPoll(null);
      setStats(EMPTY_STATS);
      setCurrentVote(null);
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
    if (!poll) {
      setCurrentVote(null);
      return undefined;
    }

    return subscribeVoterVote(showId, poll.id, voterKey, setCurrentVote);
  }, [poll, showId, voterKey]);

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
    if (!show || !poll) {
      setFeedback("Ожидание активного опроса");
      return;
    }

    if (poll.status === "FINISHED" || seconds === 0) {
      setFeedback("Опрос завершен");
      return;
    }

    if (currentVote) {
      setFeedback("Голос принят");
      return;
    }

    setFeedback("Опрос активен");
  }, [show, poll, currentVote, seconds, now]);

  const voteDisabled = !poll || poll.status !== "ACTIVE" || seconds === 0;

  const submitAudienceVote = async (optionIndex: number) => {
    if (!poll) {
      return;
    }

    setSubmittingOption(optionIndex);
    setErrorText("");

    try {
      await submitVote(showId, poll.id, voterKey, optionIndex);
      setFeedback("Голос принят");
    } catch (error) {
      const message = error instanceof Error ? error.message : "VOTE_FAILED";

      if (message === "VOTE_CHANGE_NOT_ALLOWED") {
        setErrorText("Изменение голоса выключено для этого шоу");
      } else if (message === "POLL_FINISHED") {
        setErrorText("Опрос уже завершен");
      } else {
        setErrorText("Не удалось отправить голос");
      }
    } finally {
      setSubmittingOption(null);
    }
  };

  const title = show?.name ? `Зрительский пульт: ${show.name}` : "Зрительский пульт";

  return (
    <RpgShowLayout
      showId={showId}
      view="audience"
      title={title}
      subtitle="Выберите вариант 1, 2 или 3. Если мастер разрешил, голос можно изменить до конца таймера."
      toolbar={
        <div className="rounded-xl border border-emerald-300/25 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-100">
          Статус: <span className="font-semibold">{feedback}</span>
        </div>
      }
    >
      <section className="space-y-5">
        {poll ? (
          <article className="rounded-2xl border border-white/15 bg-slate-900/65 p-4 shadow-2xl sm:p-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-white">{poll.question}</h2>
              <div className="rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold text-cyan-200">
                Таймер: {formatClock(seconds)}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {poll.options.map((option, index) => {
                const selected = currentVote?.optionIndex === index;
                const busy = submittingOption === index;

                return (
                  <button
                    key={`${poll.id}-${index}`}
                    type="button"
                    disabled={voteDisabled || busy}
                    onClick={() => submitAudienceVote(index)}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      selected
                        ? "border-amber-300 bg-amber-400/20 text-amber-100"
                        : "border-slate-600 bg-slate-800/80 text-slate-100 hover:border-cyan-300"
                    } ${voteDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                  >
                    <div className="mb-2 text-2xl font-bold">{index + 1}</div>
                    <div className="text-sm">{option}</div>
                    {selected ? <div className="mt-3 text-xs text-amber-200">Ваш голос</div> : null}
                  </button>
                );
              })}
            </div>
          </article>
        ) : (
          <article className="rounded-2xl border border-white/15 bg-slate-900/65 p-6 text-center text-slate-300">
            Мастер еще не запустил опрос.
          </article>
        )}

        {poll ? (
          <article className="rounded-2xl border border-white/15 bg-slate-900/65 p-4 shadow-2xl sm:p-6">
            <h3 className="mb-3 text-lg font-semibold">Статистика в реальном времени</h3>
            <PollResults poll={poll} stats={stats} />
          </article>
        ) : null}

        {errorText ? (
          <p className="rounded-xl border border-rose-300/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">{errorText}</p>
        ) : null}
      </section>
    </RpgShowLayout>
  );
};

export default AudiencePage;
