import React from "react";
import { Header, Footer } from "./components";
import EotvEnemiesPage from "./pages/eotvEnemies/EotvEnemiesPage";

const App: React.FC = () => {
  return (
    <div className="bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-sky-200 min-h-screen">
      <Header />
      <EotvEnemiesPage />
      <Footer />
    </div>
  );
};

export default App;
