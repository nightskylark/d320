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
              <span className={`${isScreen ? "rpg-font-title font-semibold text-[#2b1a0d]" : "font-medium text-slate-100"}`}>{label}</span>
              <span className={`${isScreen ? "font-semibold text-[#4f2f15]" : "text-slate-300"}`}>
                {votes} · {percent}%
              </span>
            </div>
            <div
              className={`w-full overflow-hidden rounded-full ${
                isScreen
                  ? "h-7 border border-[#7e5a33]/65 bg-gradient-to-b from-[#876033]/55 to-[#5b3d22]/45"
                  : "h-3 bg-slate-800/90"
              }`}
            >
              <div
                className={`h-full rounded-full transition-all ${
                  isScreen
                    ? "bg-gradient-to-r from-[#f3cf7f] via-[#d39c45] to-[#9f6d2a]"
                    : "bg-gradient-to-r from-cyan-400 to-emerald-400"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className={`${isScreen ? "rpg-font-title text-3xl font-semibold text-[#3a2411]" : compact ? "text-xs text-slate-300" : "text-sm text-slate-300"}`}>
        Всего голосов: {stats.totalVotes}
      </p>
    </div>
  );
};

export default PollResults;
