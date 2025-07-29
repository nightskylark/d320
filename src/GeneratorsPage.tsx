import React from 'react';
import { Header, Footer } from './components/layout';

const GeneratorsPage: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-slate-900 dark:text-sky-200">
    <Header />
    <main className="flex-1 p-6 max-w-screen-xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4">Генераторы для Грани Вселенной</h2>
      <p className="text-center">В разработке</p>
    </main>
    <Footer />
  </div>
);

export default GeneratorsPage;
