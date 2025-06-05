import Auth from "./Auth";
import ThemeSwitch from "./ThemeSwitch";

const Header: React.FC = () => {
  return (
    <header className="bg-slate-100 dark:bg-slate-900 text-sky-600 dark:text-sky-300">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="./logo.png" alt="d320" className="w-10 h-10" />
            <h1 className="text-2xl font-bold">d320</h1>
          </div>

          {/* Userpic / Authorization */}
          <div className="flex items-center gap-4">
            <ThemeSwitch />
            <Auth />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
