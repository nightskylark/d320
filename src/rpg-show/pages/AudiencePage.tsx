import { useEffect, useMemo, useRef, useState } from "react";
import RpgShowLayout from "../components/RpgShowLayout";
import {
  ensurePollFinished,
  submitVote,
  subscribePoll,
  subscribeShow,
  subscribeVoterVote,
} from "../data/showStore";
import type { PollDoc, ShowDoc, VoteDoc } from "../types";
import { formatClock, secondsLeft } from "../utils/time";
import { getOrCreateVoterKey } from "../utils/voterKey";

interface AudiencePageProps {
  showId: string;
}

const DEFAULT_OPTIONS = ["", "", ""];

const AudiencePage: React.FC<AudiencePageProps> = ({ showId }) => {
  const [show, setShow] = useState<ShowDoc | null>(null);
  const [poll, setPoll] = useState<PollDoc | null>(null);
  const [currentVote, setCurrentVote] = useState<VoteDoc | null>(null);
  const [feedback, setFeedback] = useState("Ожидание активного опроса");
  const [errorText, setErrorText] = useState<string>("");
  const [clockTick, setClockTick] = useState(() => Date.now());
  const [submittingOption, setSubmittingOption] = useState<number | null>(null);
  const [optimisticVoteIndex, setOptimisticVoteIndex] = useState<number | null>(null);

  const voterKey = useMemo(() => getOrCreateVoterKey(showId), [showId]);
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
      setCurrentVote(null);
      return undefined;
    }

    return subscribePoll(showId, show.activePollId, setPoll);
  }, [show?.activePollId, showId]);

  useEffect(() => {
    if (!poll) {
      setCurrentVote(null);
      setOptimisticVoteIndex(null);
      return undefined;
    }

    return subscribeVoterVote(showId, poll.id, voterKey, setCurrentVote);
  }, [poll, showId, voterKey]);

  useEffect(() => {
    if (currentVote) {
      setOptimisticVoteIndex(null);
    }
  }, [currentVote]);

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
  }, [show, poll, currentVote, seconds, clockTick]);

  const voteDisabled = !poll || poll.status !== "ACTIVE" || seconds === 0;
  const pollClosed = !!poll && (poll.status === "FINISHED" || seconds === 0);
  const selectedOption = optimisticVoteIndex ?? currentVote?.optionIndex ?? null;

  const submitAudienceVote = async (optionIndex: number) => {
    if (!poll) {
      return;
    }

    setSubmittingOption(optionIndex);
    setOptimisticVoteIndex(optionIndex);
    setFeedback("Отправляем голос...");
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
      setOptimisticVoteIndex(null);
    } finally {
      setSubmittingOption(null);
    }
  };

  const title = show?.name ? `Зрительский пульт: ${show.name}` : "Зрительский пульт";
  const options = poll?.options?.length ? poll.options : DEFAULT_OPTIONS;

  return (
    <RpgShowLayout
      showIdVisible={false}
      title={title}
      subtitle="Выберите вариант до истечения таймера"
      toolbar={
        <div className="rounded-xl border border-emerald-300/25 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-100">
          Статус: <span className="font-semibold">{feedback}</span>
        </div>
      }
    >
      <section className="space-y-5">
        {poll ? (
          <article className="rounded-2xl border border-white/15 bg-slate-900/65 p-4 shadow-2xl sm:p-6">
            {pollClosed ? (
              <div className="mb-3 rounded-xl border border-amber-300/45 bg-amber-950/40 px-3 py-2 text-center text-sm font-semibold text-amber-100">
                Опрос завершен. Голосование сейчас недоступно.
              </div>
            ) : null}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              {poll.question.trim() ? <h2 className="text-xl font-semibold text-white">{poll.question}</h2> : <div />}
              <div className="rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold text-cyan-200">
                Таймер: {formatClock(seconds)}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {options.map((option, index) => {
                const selected = selectedOption === index;
                const busy = submittingOption === index;
                const hasText = option.trim().length > 0;

                return (
                  <button
                    key={`${poll.id}-${index}`}
                    type="button"
                    disabled={voteDisabled || busy}
                    onClick={() => submitAudienceVote(index)}
                    className={`rounded-2xl border px-4 py-4 transition-transform duration-100 active:scale-[0.98] ${
                      selected
                        ? "border-amber-300 bg-amber-400/20 text-amber-100"
                        : "border-slate-600 bg-slate-800/80 text-slate-100 hover:border-cyan-300"
                    } ${voteDisabled ? "cursor-not-allowed border-slate-500 bg-slate-900/55 opacity-75 saturate-50" : "cursor-pointer"}`}
                  >
                    <div
                      className={`flex h-full w-full ${
                        hasText ? "flex-col items-start text-left" : "flex-col items-center justify-center gap-2 text-center"
                      }`}
                    >
                      <div className={`${hasText ? "mb-2 text-2xl" : "text-4xl leading-none"} font-bold`}>{index + 1}</div>
                      {hasText ? <div className="text-sm">{option}</div> : null}
                      {selected ? (
                        <div className={`rounded-full border border-amber-300/50 bg-amber-400/20 px-2 py-0.5 text-xs text-amber-100 ${hasText ? "mt-2" : ""}`}>
                          Ваш голос
                        </div>
                      ) : null}
                      {busy ? <div className="mt-2 text-xs text-cyan-200">Отправка...</div> : null}
                    </div>
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

        {errorText ? (
          <p className="rounded-xl border border-rose-300/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">{errorText}</p>
        ) : null}
      </section>
    </RpgShowLayout>
  );
};

export default AudiencePage;
