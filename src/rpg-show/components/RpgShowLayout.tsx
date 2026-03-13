import type { ReactNode } from "react";

type ViewType = "audience" | "master" | "screen";

interface RpgShowLayoutProps {
  showId: string;
  view: ViewType;
  title: string;
  subtitle?: string;
  children: ReactNode;
  toolbar?: ReactNode;
}

const buildHref = (view: ViewType, showId: string): string => `/rpg-show/${view}?showId=${encodeURIComponent(showId)}`;

const tabs: { id: ViewType; label: string }[] = [
  { id: "audience", label: "Пульт зрителя" },
  { id: "master", label: "Панель мастера" },
  { id: "screen", label: "Экран сцены" },
];

const RpgShowLayout: React.FC<RpgShowLayoutProps> = ({ showId, view, title, subtitle, children, toolbar }) => {
  return (
    <div className="rpg-show-shell min-h-screen text-slate-100">
      <div className="rpg-show-overlay" />
      <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-5 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-2xl border border-white/15 bg-slate-900/60 p-4 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-amber-300/90">d320.world / rpg-show</p>
              <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{title}</h1>
              {subtitle ? <p className="mt-1 text-sm text-slate-300">{subtitle}</p> : null}
            </div>
            <div className="text-xs text-slate-400">showId: {showId}</div>
          </div>
          <nav className="mt-4 flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const active = tab.id === view;
              return (
                <a
                  key={tab.id}
                  href={buildHref(tab.id, showId)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition ${
                    active
                      ? "border-amber-300 bg-amber-300/20 text-amber-100"
                      : "border-slate-500/60 bg-slate-900/50 text-slate-300 hover:border-slate-300"
                  }`}
                >
                  {tab.label}
                </a>
              );
            })}
          </nav>
          {toolbar ? <div className="mt-4">{toolbar}</div> : null}
        </header>
        {children}
      </div>
    </div>
  );
};

export default RpgShowLayout;
