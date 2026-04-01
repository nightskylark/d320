import { useState } from "react";

interface ShowIdEntryProps {
  view: "audience" | "screen";
}

const ShowIdEntry: React.FC<ShowIdEntryProps> = ({ view }) => {
  const [rawShowId, setRawShowId] = useState("");
  const resolvedShowId = rawShowId.trim();

  const openShow = () => {
    if (!resolvedShowId) {
      return;
    }

    window.location.href = `/rpg-show/${view}?showId=${encodeURIComponent(resolvedShowId)}`;
  };

  const title = view === "audience" ? "Зрительский пульт" : "Экран сцены";

  return (
    <div className="rpg-show-shell min-h-screen text-slate-100">
      <div className="rpg-show-overlay" />
      <div className="relative mx-auto flex min-h-screen max-w-2xl items-center px-4 py-8 sm:px-6">
        <article className="w-full rounded-2xl border border-white/15 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-amber-300/90">d320.world / Это провал!</p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-slate-300">
            Укажите ID шоу, чтобы открыть страницу. Для новых шоу используются короткие ID вида `lucky-fox-42`.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              type="text"
              value={rawShowId}
              onChange={(event) => setRawShowId(event.target.value)}
              placeholder="Введите show ID"
              className="rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2 outline-none focus:border-cyan-300"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  openShow();
                }
              }}
            />
            <button
              type="button"
              disabled={!resolvedShowId}
              onClick={openShow}
              className="rounded-xl border border-cyan-300 bg-cyan-500/20 px-4 py-2 text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Открыть
            </button>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ShowIdEntry;
