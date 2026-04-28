import { Link, useLocation } from 'react-router-dom';

function NavBar() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="border-b border-gray-200 bg-white py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <Link to="/" className="text-xl font-semibold text-primary">
            Stress Career AI
          </Link>
          <p className="text-sm text-slate-500">Personalized career guidance from stress-aware assessment.</p>
        </div>
        {!isHome && (
          <Link
            to="/"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Home
          </Link>
        )}
      </div>
    </header>
  );
}

export default NavBar;
