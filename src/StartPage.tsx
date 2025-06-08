import Header from './components/Header';
import Footer from './components/Footer';

const StartPage: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-slate-900 dark:text-sky-200">
    <Header />
    <p className="text-center text-gray-400 p-4 max-w-screen-xl justify-center m-auto mt-20">
      Всем привет. Меня зовут Евген. я увлекаюсь НРИ. Этот сайт <a className="link text-sky-500 dark:text-sky-300" href="http://eotvrpg.ru/">d320.world</a> я завел, чтобы публиковать на нем полезные для меня и других НРИ-шников тулзы.
      На данный момент уже готов портал, позволляющий создавать и делиться с сообществом уникальными противниками для настольной ролевой игры <a className="link text-sky-500 dark:text-sky-300" href="http://eotvrpg.ru/" target="_blank">Грань Вселенной</a>. Буду рад любому фидбеку на <a href="https://t.me/d320stories" target="_blank" rel="noopener noreferrer" className="link text-sky-500 dark:text-sky-300">t.me/d320stories</a>.
    </p>
    <main className="flex-1 p-6 max-w-screen-xl mx-auto flex flex-col sm:flex-row gap-6 justify-center items-center">

      <a href="/eotv-enemies/" className="w-full sm:w-80 h-56 hover:scale-110 rounded-lg overflow-hidden shadow-lg transition-all duration-300 ease-in-out">
        <img
          src="/eotv-enemies.png"
          alt="Каталог противников"
          className="object-cover w-full h-full"
        />
      </a>
      <a href="/eotv-generators/"
        className="w-full sm:w-80 h-56 hover:scale-110 rounded-lg overflow-hidden shadow-lg bg-gray-200 dark:bg-gray-700 flex flex-col items-center justify-center transition-all duration-300 ease-in-out">
        <span className="text-center px-4 font-bold">Генераторы для Грани Вселенной</span>
        <span className="text-sm text-gray-500 dark:text-gray-300">🚧 В разработке 🚧</span>
      </a>
    </main>
    <Footer />
  </div>
);

export default StartPage;
