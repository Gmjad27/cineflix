import React, { useMemo } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';

const Nav = () => {
  const location = useLocation();

  // Read user from localStorage once
  const username = useMemo(() => {
    try {
      const rawUser = localStorage.getItem('user');
      return rawUser ? JSON.parse(rawUser) : null;
    } catch {
      return null;
    }
  }, []);

  const profilePath = useMemo(() => {
    return username?.id && username?.name
      ? `/profile?user=${encodeURIComponent(username.name)}`
      : '/profile';
  }, [username]);

  const desktopNavItems = useMemo(
    () => [
      { to: '/', label: 'Home' },
      { to: '/tv', label: 'TV Shows' },
      { to: '/movies', label: 'Movies' },
    ],
    []
  );

  const mobileNavItems = useMemo(
    () => [
      { to: '/', label: 'Home', icon: 'fa-house' },
      { to: '/tv', label: 'TV', icon: 'fa-tv' },
      { to: '/movies', label: 'Movies', icon: 'fa-film' },
      { to: '/search', label: 'Search', icon: 'fa-magnifying-glass' },
    ],
    []
  );

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-300 hover:text-gray-100'
    }`;

  return (
    <>
      {/* ---- DESKTOP TOP NAVIGATION ---- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 via-black/70 to-transparent backdrop-blur-md hidden md:block">
        <div className="max-w-[1920px] mx-auto flex items-center h-16 px-6 lg:px-12">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 mr-10">
            <img src="cineflix.svg" alt="Cineflix" className="h-8 md:h-9" />
          </Link>

          {/* Primary Navigation Links */}
          <nav className="flex items-center gap-1">
            {desktopNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
                end={item.to === '/'}
              >
                <span className="px-3 py-2 block">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right side icons */}
          <div className="ml-auto flex items-center gap-4">
            <NavLink to="/search" className="text-gray-300 hover:text-white transition">
              <i className="fa-solid fa-magnifying-glass text-xl" />
            </NavLink>
            <NavLink to={profilePath} className="relative flex items-center">
              {username?.profilePic ? (
                <img
                  src={username.profilePic}
                  alt="Profile"
                  className="w-7 h-7 rounded-sm object-cover"
                />
              ) : (
                <div className="w-7 h-7 bg-red-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">
                  {(username?.name || 'G')[0].toUpperCase()}
                </div>
              )}
            </NavLink>
          </div>
        </div>
      </header>

      {/* ---- MOBILE TOP BAR ---- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 border-b border-white/10 backdrop-blur-md flex items-center justify-between h-14 px-4 md:hidden">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img src="cineflix.svg" alt="Cineflix" className="h-7" />
        </Link>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <NavLink to="/search" className="text-gray-300 hover:text-white transition">
            <i className="fa-solid fa-magnifying-glass text-lg" />
          </NavLink>
          <NavLink to={profilePath} className="relative flex items-center">
            {username?.profilePic ? (
              <img
                src={username.profilePic}
                alt="Profile"
                className="w-7 h-7 rounded-sm object-cover"
              />
            ) : (
              <div className="w-7 h-7 bg-red-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">
                {(username?.name || 'G')[0].toUpperCase()}
              </div>
            )}
          </NavLink>
        </div>
      </header>

      {/* ---- MOBILE BOTTOM NAV ---- */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-white/10 bg-black/95 backdrop-blur-md pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-4 h-14">
          {mobileNavItems.map((item) => {
            const isActive = item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                  }`}
              >
                <i className={`fa-solid ${item.icon} text-sm`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Spacer to offset fixed header */}
      {/* <div className="h-16 hidden md:block" /> */}
      <div className="h-14 md:hidden" />
      {/* <div className="h-16 md:hidden" /> */}
    </>
  );
};

export default React.memo(Nav);