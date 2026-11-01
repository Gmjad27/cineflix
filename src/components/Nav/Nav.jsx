
import React, { memo, useEffect, useMemo, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';

const DEFAULT_PROFILE =
  'https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-qo9h82134t9nv0j0.jpg';

const Nav = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleInstallAvailability = (event) => {
      setCanInstall(event.detail === true);
    };

    window.addEventListener('cineflix-install-availability', handleInstallAvailability);
    return () => window.removeEventListener('cineflix-install-availability', handleInstallAvailability);
  }, []);

  const requestInstall = () => {
    window.dispatchEvent(new Event('cineflix-install-request'));
  };

  // User information
  const username = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);

  const profilePath = useMemo(() => {
    return username?.id && username?.name
      ? `/profile?user=${encodeURIComponent(username.name)}`
      : '/profile';
  }, [username]);

  const desktopNavItems = [
    { to: '/', label: 'Home' },
    { to: '/tv', label: 'Shows' },
    { to: '/movies', label: 'Movies' },
  ];

  const mobileNavItems = [
    { to: '/', label: 'Home', icon: 'fa-house' },
    { to: '/tv', label: 'Shows', icon: 'fa-tv' },
    { to: '/movies', label: 'Movies', icon: 'fa-film' },
    { to: '/search', label: 'Search', icon: 'fa-magnifying-glass' },
  ];

  const isActiveRoute = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isProfileActive = location.pathname.startsWith('/profile');

  return (
    <>
      {/* ================= DESKTOP NAVBAR ================= */}

      <header
        className={`
          fixed top-0 left-0 right-0 z-50 hidden md:block
          transition-all duration-500 ease-in-out
          ${
            isScrolled
              ? 'bg-[#080808]/95 backdrop-blur-2xl shadow-xl shadow-black/30 border-b border-white/[0.06]'
              : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent border-b border-transparent'
          }
        `}
      >
        <div className="
          max-w-[1920px] mx-auto
          h-[76px] lg:h-[82px]
          px-6 lg:px-12 xl:px-16
          flex items-center justify-between
        ">

          {/* LEFT SECTION */}

          <div className="flex items-center gap-10 xl:gap-14">

            {/* LOGO */}

            <Link
              to="/"
              className="flex-shrink-0 group"
              aria-label="CineFlix Home"
            >
              <img
                src="/cineflix.png"
                alt="CineFlix"
                className="
                  h-10 lg:h-12
                  object-contain
                  transition-transform duration-300
                  group-hover:scale-105
                "
              />
            </Link>

            {/* NAV LINKS */}

            <nav className="flex items-center gap-7 lg:gap-9">

              {desktopNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `
                    relative py-3
                    text-[13px] lg:text-sm
                    font-semibold tracking-wide
                    transition-colors duration-300
                    ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {item.label}

                      <span
                        className={`
                          absolute bottom-0 left-0
                          h-[2px] w-full rounded-full
                          bg-[#E50914]
                          transition-transform duration-300 origin-left
                          ${
                            isActive
                              ? 'scale-x-100'
                              : 'scale-x-0'
                          }
                        `}
                      />

                    </>
                  )}
                </NavLink>
              ))}

            </nav>
          </div>

          {/* RIGHT SECTION */}

          <div className="flex items-center gap-6 lg:gap-9">

            {/* CREATOR BADGE */}

            <div className="hidden lg:flex items-center">

              <div className="
                relative flex items-center gap-2.5
                rounded-full
                border border-orange-500/20
                bg-orange-500/[0.07]
                px-3.5 py-2
                transition-all duration-300
                hover:border-orange-500/50
                hover:bg-orange-500/10
              ">

                <span className="relative flex h-2 w-2">
                  <span className="
                    absolute inline-flex h-full w-full
                    animate-ping rounded-full
                    bg-orange-400 opacity-60
                  " />

                  <span className="
                    relative inline-flex h-2 w-2
                    rounded-full bg-orange-500
                  " />
                </span>

                <span className="
                  text-[10px] xl:text-[11px]
                  font-semibold tracking-wide
                  text-orange-200
                ">
                  CREATED BY GIRISH JADAV
                </span>

              </div>

            </div>

            {/* SEARCH */}

            <NavLink
              to="/search"
              aria-label="Search"
              className={({ isActive }) => `
                group relative flex items-center justify-center
                w-10 h-10 rounded-full
                transition-all duration-300
                hover:bg-white/10
                ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-300 hover:text-white'
                }
              `}
            >
              <i className="
                fa-solid fa-magnifying-glass
                text-lg
                transition-transform duration-300
                group-hover:scale-110
              " />
            </NavLink>

            {/* PROFILE */}

            <Link
              to={profilePath}
              aria-label="Profile"
              className="group relative"
            >
              <div className="
                relative h-9 w-9 lg:h-10 lg:w-10
                rounded-lg overflow-hidden
                border border-white/20
                transition-all duration-300
                group-hover:border-red-500
                group-hover:scale-105
                group-hover:shadow-[0_0_15px_rgba(229,9,20,0.25)]
              ">

                <img
                  src={username?.profilePic || DEFAULT_PROFILE}
                  alt="Profile"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_PROFILE;
                  }}
                  className="h-full w-full object-cover"
                />

              </div>

              <span className="
                absolute bottom-[-2px] right-[-2px]
                h-3 w-3 rounded-full
                border-2 border-black
                bg-green-500
              " />

            </Link>

          </div>

        </div>
      </header>

      {/* ================= MOBILE TOP BAR ================= */}

      <header className="
        fixed top-0 left-0 right-0 z-50
        md:hidden
        h-[58px]
        flex items-center justify-between
        px-4
        bg-[#080808]/95
        backdrop-blur-2xl
        border-b border-white/[0.07]
      ">

        {/* LOGO */}

        <Link to="/" className="flex-shrink-0">
          <img
            src="/cineflix.png"
            alt="CineFlix"
            className="h-[35px] max-w-[130px] object-contain"
          />
        </Link>

        {/* CREATOR LABEL */}

        <div className="
          flex items-center gap-1.5
          rounded-full
          border border-orange-500/20
          bg-orange-500/[0.08]
          px-2.5 py-1.5
        ">

          <span className="
            h-1.5 w-1.5 rounded-full
            bg-orange-500
          " />

          <span className="
            text-[9px] font-bold
            tracking-wide text-orange-200
            whitespace-nowrap
          ">
            BY GIRISH JADAV
          </span>

        </div>

        {canInstall && (
          <button
            type="button"
            onClick={requestInstall}
            className="flex items-center justify-center rounded-full border border-red-500/40 bg-red-600/20 p-2 text-red-100 transition active:scale-95"
            aria-label="Install App"
          >
            <i className="fa-solid fa-download text-xs" />
          </button>
        )}

        {/* PROFILE */}

        <Link
          to={profilePath}
          aria-label="Profile"
          className="
            relative flex-shrink-0
            h-8 w-8 rounded-lg overflow-hidden
            border border-white/20
            active:scale-95 transition-transform
          "
        >

          {username?.profilePic ? (
            <img
              src={username.profilePic}
              alt="Profile"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="
              flex h-full w-full
              items-center justify-center
              bg-gradient-to-br from-red-600 to-red-900
              text-white text-xs font-black
            ">
              {(username?.name || 'G').charAt(0).toUpperCase()}
            </div>
          )}

        </Link>

      </header>

      {/* ================= MOBILE BOTTOM NAV ================= */}

      <nav className="
        fixed bottom-0 left-0 right-0 z-50
        md:hidden
        bg-[#090909]/95
        backdrop-blur-2xl
        border-t border-white/[0.08]
        pb-[env(safe-area-inset-bottom)]
      ">

        <div className="
          flex items-center justify-around
          h-[62px] px-2
        ">

          {mobileNavItems.map((item) => {
            const isActive = isActiveRoute(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                aria-label={item.label}
                className={`
                  relative flex-1
                  h-full
                  flex flex-col items-center justify-center
                  gap-1
                  transition-all duration-300
                  ${
                    isActive
                      ? 'text-white'
                      : 'text-[#777] active:text-white'
                  }
                `}
              >

                {/* Active Indicator */}

                <span className={`
                  absolute top-0
                  h-[2px] w-7 rounded-full
                  bg-[#E50914]
                  shadow-[0_0_10px_rgba(229,9,20,0.6)]
                  transition-all duration-300
                  ${
                    isActive
                      ? 'opacity-100 scale-x-100'
                      : 'opacity-0 scale-x-0'
                  }
                `} />

                {/* ICON */}

                <i className={`
                  fa-solid ${item.icon}
                  text-[17px]
                  transition-all duration-300
                  ${
                    isActive
                      ? 'text-white scale-110'
                      : 'text-gray-500'
                  }
                `} />

                {/* LABEL */}

                <span className={`
                  text-[10px]
                  tracking-wide
                  transition-all duration-300
                  ${
                    isActive
                      ? 'font-bold text-white'
                      : 'font-medium text-gray-500'
                  }
                `}>
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

export default memo(Nav);
