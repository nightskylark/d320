import type { ReactNode } from "react";

interface RpgShowLayoutProps {
  showId?: string;
  showIdVisible?: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
  toolbar?: ReactNode;
  variant?: "default" | "fantasy";
}

const RpgShowLayout: React.FC<RpgShowLayoutProps> = ({
  showId,
  showIdVisible = true,
  title,
  subtitle,
  children,
  toolbar,
  variant = "default",
}) => {
  const isFantasy = variant === "fantasy";

  return (
    <div className={`rpg-show-shell min-h-screen ${isFantasy ? "rpg-show-shell-fantasy rpg-font-body text-[#f5e7c8]" : "text-slate-100"}`}>
      <div className={`rpg-show-overlay ${isFantasy ? "rpg-show-overlay-fantasy" : ""}`} />
      <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-5 sm:px-6 lg:px-8">
        <header
          className={`mb-6 rounded-2xl border p-4 shadow-2xl backdrop-blur ${
            isFantasy ? "rpg-header-fantasy" : "border-white/15 bg-slate-900/60"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={`text-xs uppercase tracking-[0.22em] ${isFantasy ? "text-amber-200/90" : "text-amber-300/90"}`}>d320.world / Это провал!</p>
              <h1 className={`mt-1 text-2xl font-semibold sm:text-3xl ${isFantasy ? "rpg-font-title text-[#fff2cf]" : ""}`}>{title}</h1>
              {subtitle ? <p className={`mt-1 text-sm ${isFantasy ? "text-amber-100/90" : "text-slate-300"}`}>{subtitle}</p> : null}
            </div>
            {showIdVisible && showId ? <div className={`text-xs ${isFantasy ? "text-amber-200/70" : "text-slate-400"}`}>showId: {showId}</div> : null}
          </div>
          {toolbar ? <div className="mt-4">{toolbar}</div> : null}
        </header>
        {children}
      </div>
    </div>
  );
};

export default RpgShowLayout;
