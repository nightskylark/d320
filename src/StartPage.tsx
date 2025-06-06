import Header from './components/Header';
import Footer from './components/Footer';

const StartPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-900 dark:text-sky-200">
    <Header />
    <main className="p-6 max-w-screen-xl mx-auto flex flex-col sm:flex-row gap-6 justify-center items-center">
      <a href="/eotv-enemies/" className="block w-full sm:w-80 h-56 rounded-lg overflow-hidden shadow-lg">
        <img
          src="https://private-user-images.githubusercontent.com/2280467/452084178-788e95a2-9a14-475c-beb1-7acaa5ac0ac9.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDkyMzM0MDMsIm5iZiI6MTc0OTIzMzEwMywicGF0aCI6Ii8yMjgwNDY3LzQ1MjA4NDE3OC03ODhlOTVhMi05YTE0LTQ3NWMtYmViMS03YWNhYTVhYzBhYzkucG5nP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQVZDT0RZTFNBNTNQUUs0WkElMkYyMDI1MDYwNiUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyNTA2MDZUMTgwNTAzWiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9ZTc3NzI0YzJmNzE0ZTI1MTcwODI2NzQ0MTJkYmQ1MTVkNjE1MDNjNzI1NmM5ZmIzNTMyMmY2MzdlZjliZWFiYiZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QifQ.YVOUjIY-0qrGEh8BiwKegPwgwUuYLMe0gQY2cvQTrdg"
          alt="Каталог противников"
          className="object-cover w-full h-full"
        />
      </a>
      <a href="/eotv-generators/" className="block w-full sm:w-80 h-56 rounded-lg overflow-hidden shadow-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <span className="text-center px-4 font-bold">Генераторы для Грани Вселенной</span>
      </a>
    </main>
    <Footer />
  </div>
);

export default StartPage;
