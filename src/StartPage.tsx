import Header from './components/Header';
import Footer from './components/Footer';

const StartPage: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-slate-900 dark:text-sky-200">
    <Header />
    <main className="flex-1 p-6 max-w-screen-xl mx-auto flex flex-col sm:flex-row gap-6 justify-center items-center">
      <a href="/eotv-enemies/" className="w-full sm:w-80 h-56 hover:scale-110 rounded-lg overflow-hidden shadow-lg transition-all duration-300 ease-in-out">
        <img
          src="/eotv-enemies.png"
          alt="Каталог противников"
          className="object-cover w-full h-full"
        />
      </a>
      <a href="/eotv-generators/" className="w-full sm:w-80 h-56 hover:scale-110 rounded-lg overflow-hidden shadow-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center transition-all duration-300 ease-in-out">
        <span className="text-center px-4 font-bold">Генераторы для Грани Вселенной</span>
      </a>
    </main>
    <Footer />
  </div>
);

export default StartPage;
