import type { PollDoc, PollStats } from "../types";

interface PollResultsProps {
  poll: PollDoc;
  stats: PollStats;
  compact?: boolean;
  variant?: "default" | "screen";
}

const PollResults: React.FC<PollResultsProps> = ({ poll, stats, compact = false, variant = "default" }) => {
  const isScreen = variant === "screen";

  return (
    <div className={isScreen ? "space-y-5" : "space-y-3"}>
      {poll.options.map((option, index) => {
        const votes = stats.optionVotes[index] ?? 0;
        const percent = stats.optionPercents[index] ?? 0;
        const label = option.trim() ? `${index + 1}. ${option}` : `${index + 1}`;

        return (
          <div key={`${poll.id}-${index}`}>
            <div className={`mb-1 flex items-center justify-between gap-2 ${isScreen ? "text-2xl" : "text-sm"}`}>
              <span className={`text-slate-100 ${isScreen ? "font-semibold" : "font-medium"}`}>{label}</span>
              <span className={`text-slate-300 ${isScreen ? "font-semibold" : ""}`}>
                {votes} · {percent}%
              </span>
            </div>
            <div className={`${isScreen ? "h-6" : "h-3"} w-full overflow-hidden rounded-full bg-slate-800/90`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className={`text-slate-300 ${isScreen ? "text-3xl font-semibold" : compact ? "text-xs" : "text-sm"}`}>
        Всего голосов: {stats.totalVotes}
      </p>
    </div>
  );
};

export default PollResults;
