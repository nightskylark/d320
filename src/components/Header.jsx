import Auth from "./Auth";

function Header() {
  return (
    <header className="bg-darkBg text-neonBlue">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Логотип */}
          <h1 className="text-2xl font-bold text-neonBlue">d320</h1>

          {/* Аватар / Авторизация */}
          <Auth />
        </div>
      </div>
    </header>
  );
}

export default Header;
