import type { ReactNode } from "react";

interface RpgShowLayoutProps {
  showId?: string;
  showIdVisible?: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
  toolbar?: ReactNode;
}

const RpgShowLayout: React.FC<RpgShowLayoutProps> = ({
  showId,
  showIdVisible = true,
  title,
  subtitle,
  children,
  toolbar,
}) => {
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
            {showIdVisible && showId ? <div className="text-xs text-slate-400">showId: {showId}</div> : null}
          </div>
          {toolbar ? <div className="mt-4">{toolbar}</div> : null}
        </header>
        {children}
      </div>
    </div>
  );
};

export default RpgShowLayout;
