import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  return (
    <header className="bg-primary-600 text-white shadow-lg">
      <div className="container mx-auto px-3 py-3 md:px-4 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <h1 className="text-lg md:text-2xl font-bold">観光周遊スケジュール自動生成</h1>
              <p className="text-xs md:text-sm text-primary-100 mt-1">
                GTFSデータを活用した効率的な観光ルート提案
              </p>
            </Link>
          </div>
          <nav className="ml-4">
            <ul className="flex gap-2 md:gap-3">
              <li>
                <Link
                  to="/"
                  className={`px-2 md:px-3 py-2 rounded-md text-xs md:text-base font-medium transition-colors ${
                    location.pathname === '/'
                      ? 'bg-primary-700 text-white'
                      : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                  }`}
                >
                  ホーム
                </Link>
              </li>
              <li>
                <Link
                  to="/how-to-use"
                  className={`px-2 md:px-3 py-2 rounded-md text-xs md:text-base font-medium transition-colors ${
                    location.pathname === '/how-to-use'
                      ? 'bg-primary-700 text-white'
                      : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                  }`}
                >
                  使い方
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className={`px-2 md:px-3 py-2 rounded-md text-xs md:text-base font-medium transition-colors ${
                    location.pathname === '/about'
                      ? 'bg-primary-700 text-white'
                      : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                  }`}
                >
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
