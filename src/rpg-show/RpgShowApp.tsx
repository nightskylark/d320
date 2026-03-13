import AudiencePage from "./pages/AudiencePage";
import MasterPage from "./pages/MasterPage";
import ScreenPage from "./pages/ScreenPage";
import { DEFAULT_SHOW_ID } from "./data/showStore";
import "./rpgShow.css";

type RpgShowView = "audience" | "master" | "screen";

const detectView = (pathname: string): RpgShowView => {
  if (pathname.startsWith("/rpg-show/master")) {
    return "master";
  }

  if (pathname.startsWith("/rpg-show/screen")) {
    return "screen";
  }

  return "audience";
};

const detectShowId = (): string => {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("showId")?.trim();
  return raw || DEFAULT_SHOW_ID;
};

const RpgShowApp: React.FC = () => {
  const view = detectView(window.location.pathname);
  const showId = detectShowId();

  if (view === "master") {
    return <MasterPage showId={showId} />;
  }

  if (view === "screen") {
    return <ScreenPage showId={showId} />;
  }

  return <AudiencePage showId={showId} />;
};

export default RpgShowApp;
