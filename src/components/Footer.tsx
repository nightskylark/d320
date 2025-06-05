import React from "react";

const Footer: React.FC = () => (
  <footer className="text-center text-gray-400 p-4 flex items-center justify-center gap-2">
    <span>d320, Eugen Zha,</span>
    <a href="https://t.me/d320stories" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 link">
      <img src="./telegram.svg" alt="Telegram" className="w-5 h-5" />
      https://t.me/d320stories
    </a>
  </footer>
);

export default Footer;
