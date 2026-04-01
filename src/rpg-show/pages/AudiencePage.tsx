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
    if (!show) {
      setFeedback("Ожидание активного опроса");
      return;
    }

    if (show.screenMode === "IDLE") {
      setFeedback("Режим ожидания");
      return;
    }

    if (!poll) {
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

  const voteDisabled = !poll || poll.status !== "ACTIVE" || seconds === 0 || show?.screenMode !== "POLL";
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

  const title = show?.name ? `Пульт зрителя: ${show.name}` : "Пульт зрителя";
  const options = poll?.options?.length ? poll.options : DEFAULT_OPTIONS;
  const idleCta = show?.audienceIdleCta;
  const isAudienceIdleMode = show?.screenMode === "IDLE";
  const hasAudienceIdleCta = Boolean(idleCta?.buttonLabel.trim() && idleCta?.url.trim());
  const shouldRenderPollCard = !isAudienceIdleMode && !!poll;

  return (
    <RpgShowLayout
      variant="fantasy"
      showIdVisible={false}
      title={title}
      toolbar={
        <div className="rpg-show-status-chip rounded-xl px-3 py-2 text-sm">
          Статус: <span className="font-semibold">{feedback}</span>
        </div>
      }
    >
      <section className="space-y-5">
        {shouldRenderPollCard && poll ? (
          <article className="rpg-parchment-panel p-4 sm:p-6">
            {pollClosed ? (
              <div className="mb-3 rounded-xl border border-[#8d6235]/60 bg-[#5a3a21]/20 px-3 py-2 text-center text-sm font-semibold text-[#5a2d12]">
                Опрос завершен. Голосование сейчас недоступно.
              </div>
            ) : null}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              {poll.question.trim() ? <h2 className="rpg-font-title text-xl font-semibold text-[#2c1b0f]">{poll.question}</h2> : <div />}
              <div className="rpg-wood-pill px-3 py-1 text-sm font-semibold">
                Таймер: {formatClock(seconds)}
              </div>
            </div>
            <div className="rpg-stage-divider mb-4" />

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
                    className={`rpg-option-tile px-4 py-4 text-left transition-all duration-150 active:scale-[0.98] ${
                      selected ? "rpg-option-tile-selected" : ""
                    } ${voteDisabled ? "rpg-option-tile-disabled cursor-not-allowed" : "cursor-pointer"} ${busy ? "brightness-105" : ""}`}
                  >
                    <div
                      className={`flex h-full w-full ${
                        hasText ? "flex-col items-start text-left" : "flex-col items-center justify-center gap-2 text-center"
                      }`}
                    >
                      <div className={`rpg-font-title ${hasText ? "mb-2 text-2xl" : "text-5xl leading-none"} font-bold`}>{index + 1}</div>
                      {hasText ? <div className="text-base text-[#2c1a0f]">{option}</div> : null}
                      {selected ? (
                        <div
                          className={`rpg-wood-pill rounded-full border px-2 py-0.5 text-xs text-[#f7e4bb] ${
                            hasText ? "mt-2" : ""
                          }`}
                        >
                          Ваш голос
                        </div>
                      ) : null}
                      {busy ? <div className="mt-2 text-xs text-[#5d3415]">Отправка...</div> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </article>
        ) : (
          <article className="rpg-parchment-panel p-6 text-center text-[#3a2513]">
            {!isAudienceIdleMode ? <p>Мастер еще не запустил опрос.</p> : null}
            {hasAudienceIdleCta ? (
              <div className="mt-5 space-y-4 rounded-xl border border-[#8a6438]/45 bg-[#f2e4c3]/50 px-4 py-4">
                {idleCta?.description.trim() ? (
                  <p className="text-base text-[#4a2e17] whitespace-pre-line">{idleCta.description}</p>
                ) : null}
                <a
                  href={idleCta?.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rpg-wood-pill inline-flex min-h-11 items-center justify-center px-5 py-2 text-sm font-semibold"
                >
                  {idleCta?.buttonLabel}
                </a>
              </div>
            ) : null}
          </article>
        )}

        {errorText ? (
          <p className="rounded-xl border border-[#8b3d2e]/45 bg-[#6c2e1e]/18 px-4 py-3 text-sm text-[#5a2014]">{errorText}</p>
        ) : null}
      </section>
    </RpgShowLayout>
  );
};

export default AudiencePage;
