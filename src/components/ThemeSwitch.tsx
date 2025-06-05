import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitch: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const knobPosition = theme === 'dark' ? 'translate-x-6' : 'translate-x-1';

  return (
    <button
      aria-label="Toggle theme"
      aria-pressed={theme === 'dark'}
      onClick={toggleTheme}
      className="relative w-12 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center transition-colors"
    >
      <SunIcon className="absolute left-1 w-4 h-4 text-yellow-500" />
      <MoonIcon className="absolute right-1 w-4 h-4 text-yellow-300" />
      <span
        className={`absolute bg-white w-4 h-4 rounded-full transition-transform transform ${knobPosition}`}
      />
    </button>
  );
};

export default ThemeSwitch;
