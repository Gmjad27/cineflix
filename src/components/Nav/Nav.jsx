import React, { useMemo, useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';

const Nav = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  // Add a scroll listener to change navbar opacity on scroll (Classic streaming app behavior)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      { to: '/tv', label: 'Shows' },
      { to: '/movies', label: 'Movies' },
    ],
    []
  );

  const mobileNavItems = useMemo(
    () => [
      { to: '/', label: 'Home', icon: 'fa-house' },
      { to: '/tv', label: 'Shows', icon: 'fa-tv' },
      { to: '/movies', label: 'Movies', icon: 'fa-film' },
      { to: '/search', label: 'Search', icon: 'fa-magnifying-glass' },
    ],
    []
  );

  return (
    <>
      {/* ---- DESKTOP TOP NAVIGATION ---- */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 hidden md:block border-b border-white/5 ${isScrolled
          ? 'bg-black/90 backdrop-blur-xl shadow-lg'
          : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent'
          }`}
      >
        <div className="max-w-[1920px] mx-auto flex items-center justify-between h-16 px-6 lg:px-12">

          {/* Left Side: Logo + Nav Links */}
          <div className="flex items-center gap-10">
            <Link to="/" className="flex-shrink-0 transition-transform hover:scale-105">
              <img src="cineflix.png" alt="Cineflix" className="h-[40px] lg:h-[50px] object-contain" />
            </Link>

            <nav className="flex items-center gap-6">
              {desktopNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `relative text-sm font-medium transition-colors duration-300 py-2 group ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {/* Animated underline indicator */}
                      <span
                        className={`absolute left-0 bottom-0 w-full h-[2px] bg-red-600 rounded-t-md transition-transform duration-300 origin-left ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                          }`}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right Side: Badge + Search + Profile */}
          <div className="flex items-center gap-6 lg:gap-8">

            {/* Redesigned Sleek Badge */}
            <div className="hidden lg:block">
              <span className="relative flex items-center justify-center px-4 py-1.5 text-xs font-semibold text-orange-200 bg-orange-950/40 border border-orange-500/30 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.1)] backdrop-blur-md transition-all duration-300 hover:border-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.25)]">
                <span className="absolute flex h-2.5 w-2.5 -top-0.5 -right-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                </span>
                Created By Jadav Girish
              </span>
            </div>

            <NavLink
              to="/search"
              className={({ isActive }) =>
                `transition-colors duration-200 hover:scale-110 ${isActive ? 'text-white' : 'text-gray-300 hover:text-white'}`
              }
            >
              <i className="fa-solid fa-magnifying-glass text-xl" />
            </NavLink>

            <NavLink to={profilePath} className="relative flex items-center hover:scale-105 transition-transform duration-200">
              {username?.profilePic ? (
                <img
                  src={username.profilePic}
                  alt="Profile"
                  className="w-8 h-8 rounded border border-white/10 object-cover shadow-md"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded border border-white/10 flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {(username?.name || 'G')[0].toUpperCase()}
                </div>
              )}
            </NavLink>
          </div>
        </div>
      </header>

      {/* ---- MOBILE TOP BAR ---- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 border-b border-white/5 backdrop-blur-xl flex items-center justify-between h-14 px-4 md:hidden">
        <Link to="/" className="flex-shrink-0">
          <img src="cineflix.png" alt="Cineflix" className="h-[35px] object-contain" />
        </Link>
        <div >
          <span className="relative flex items-center justify-center px-4 py-1.5 text-xs font-semibold text-orange-200 bg-orange-950/40 border border-orange-500/30 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.1)] backdrop-blur-md transition-all duration-300 hover:border-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.25)]">
            <span className="absolute flex h-2.5 w-2.5 -top-0.5 -right-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
            </span>
            Created By Jadav Girish
          </span>
        </div>

        <div className="flex items-center gap-5">
          <NavLink to={profilePath} className="relative flex items-center">
            {username?.profilePic ? (
              <img
                src={username.profilePic}
                alt="Profile"
                className="w-7 h-7 rounded border border-white/10 object-cover"
              />
            ) : (
              <div className="w-7 h-7 bg-gradient-to-br from-red-600 to-red-800 rounded border border-white/10 flex items-center justify-center text-white text-xs font-bold">
                {(username?.name || 'G')[0].toUpperCase()}
              </div>
            )}
          </NavLink>
        </div>
      </header>

      {/* ---- MOBILE BOTTOM NAV ---- */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
        <div className="flex items-center justify-around h-14 px-2">
          {mobileNavItems.map((item) => {
            const isActive = item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className="relative flex flex-col items-center justify-center w-16 h-full gap-1 rounded-lg transition-all"
              >
                {/* Active Background Pill */}
                {isActive && (
                  <span className="absolute inset-0 bg-white/5 rounded-xl transition-opacity duration-300" />
                )}

                <i className={`fa-solid ${item.icon} text-[16px] transition-all duration-300 ${isActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] scale-110' : 'text-gray-500'
                  }`} />
                <span className={`text-[10px] font-medium transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500'
                  }`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default React.memo(Nav);