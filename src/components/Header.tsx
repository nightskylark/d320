import Auth from "./Auth";
import ThemeToggle from "./ThemeToggle";

const Header: React.FC = () => {
  return (
    <header className="text-gray-900 dark:text-sky-300">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="./logo.png" alt="d320" className="w-10 h-10" />
            <h1 className="text-2xl font-bold text-blue-700 dark:text-sky-300">d320</h1>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Auth />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
