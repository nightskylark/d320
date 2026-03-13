import type { PollDoc, PollStats } from "../types";

interface PollResultsProps {
  poll: PollDoc;
  stats: PollStats;
  compact?: boolean;
}

const PollResults: React.FC<PollResultsProps> = ({ poll, stats, compact = false }) => {
  return (
    <div className="space-y-3">
      {poll.options.map((option, index) => {
        const votes = stats.optionVotes[index] ?? 0;
        const percent = stats.optionPercents[index] ?? 0;

        return (
          <div key={`${poll.id}-${index}`}>
            <div className="mb-1 flex items-center justify-between gap-2 text-sm">
              <span className="font-medium text-slate-100">
                {index + 1}. {option}
              </span>
              <span className="text-slate-300">
                {votes} · {percent}%
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800/90">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className={`text-slate-300 ${compact ? "text-xs" : "text-sm"}`}>Всего голосов: {stats.totalVotes}</p>
    </div>
  );
};

export default PollResults;
