import React from "react";

const Footer: React.FC = () => (
  <footer className="text-center text-gray-600 dark:text-gray-400 p-4 flex items-center justify-center gap-2">
    <span>Eugen Zha</span>
    <a href="https://t.me/d320stories" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 link">
      <img src="/telegram.svg" alt="Telegram" className="w-5 h-5" />
      t.me/d320stories
    </a>
    <a href="https://github.com/nightskylark/d320" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 link">
      <img src="/github.svg" alt="GItHub" className="w-5 h-5" />
      github.com/nightskylark/d320
    </a>
  </footer>
);

export default Footer;
