
import React, { memo, useEffect, useMemo, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useNetworkStatus } from '../../context/NetworkContext';

const DEFAULT_PROFILE =
  'https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-qo9h82134t9nv0j0.jpg';

const Nav = () => {
  const location = useLocation();
  const { isOnline, isWeak } = useNetworkStatus();
  const [isScrolled, setIsScrolled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  // Scroll detection (rAF-throttled for zero main-thread scroll jank)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const next = window.scrollY > 30;
          setIsScrolled((prev) => (prev !== next ? next : prev));
          ticking = false;
        });
        ticking = true;
      }
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
    { to: '/live', label: 'Live', isLive: true },
  ];

  const mobileNavItems = [
    { to: '/', label: 'Home', icon: 'fa-house' },
    { to: '/tv', label: 'Shows', icon: 'fa-tv' },
    { to: '/movies', label: 'Movies', icon: 'fa-film' },
    { to: '/live', label: 'Live', icon: 'fa-satellite-dish', isLive: true },
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
              ? 'bg-[#07070a]/80 backdrop-blur-2xl shadow-[0_10px_35px_-5px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.12)]'
              : 'bg-gradient-to-b from-[#07070a]/95 via-[#07070a]/60 to-transparent'
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

          <div className="flex items-center gap-8 xl:gap-12">

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
                  group-hover:scale-105 group-hover:drop-shadow-[0_0_15px_rgba(229,9,20,0.5)]
                "
              />
            </Link>

            {/* NAV LINKS */}

            <nav className="flex items-center gap-2 lg:gap-3 bg-white/[0.03] p-1.5 rounded-full border border-white/[0.07] backdrop-blur-xl shadow-inner">

              {desktopNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `
                    relative px-4 py-1.5 rounded-full
                    text-[13px] lg:text-sm
                    font-semibold tracking-wide
                    transition-all duration-300
                    ${
                      isActive
                        ? 'bg-white/[0.12] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_4px_12px_rgba(0,0,0,0.5)] border border-white/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.06] border border-transparent'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <span className="flex items-center gap-2">
                      {item.isLive && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600 shadow-[0_0_8px_#e50914]" />
                        </span>
                      )}
                      <span>{item.label}</span>
                    </span>
                  )}
                </NavLink>
              ))}

            </nav>
          </div>

          {/* RIGHT SECTION */}

          <div className="flex items-center gap-5 lg:gap-7">

            {/* CREATOR BADGE */}

            <div className="hidden lg:flex items-center">

              <div className="
                relative flex items-center gap-2.5
                rounded-full
                border border-orange-500/30
                bg-gradient-to-r from-orange-500/[0.08] via-amber-500/[0.08] to-orange-500/[0.08]
                px-3.5 py-1.5
                backdrop-blur-xl
                shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)]
                transition-all duration-300
                hover:border-orange-500/60
                hover:shadow-[0_0_20px_rgba(249,115,22,0.25)]
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
                  font-bold tracking-wider
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
                border transition-all duration-300
                backdrop-blur-xl shadow-glass-sm
                ${
                  isActive
                    ? 'bg-red-600/20 text-white border-red-500/50 shadow-[0_0_15px_rgba(229,9,20,0.3)]'
                    : 'bg-white/[0.05] text-gray-300 hover:text-white hover:bg-white/[0.12] border-white/10 hover:border-white/30'
                }
              `}
            >
              <i className="
                fa-solid fa-magnifying-glass
                text-base
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
                rounded-full overflow-hidden
                border-2 border-white/20
                shadow-glass-sm
                transition-all duration-300
                group-hover:border-red-500
                group-hover:scale-105
                group-hover:shadow-[0_0_15px_rgba(229,9,20,0.4)]
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

              <span className={`
                absolute bottom-[-2px] right-[-2px]
                h-3 w-3 rounded-full
                border-2 border-black transition-colors duration-300
                ${
                  !isOnline
                    ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                    : isWeak
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                    : 'bg-green-500'
                }
              `}
              title={!isOnline ? 'Offline' : isWeak ? 'Weak Connection' : 'Connected'}
              />

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
              src={username.profilePic || DEFAULT_PROFILE}
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

          <span className={`
            absolute bottom-0 right-0
            h-2 w-2 rounded-full
            border border-black transition-colors duration-300
            ${
              !isOnline
                ? 'bg-red-500'
                : isWeak
                ? 'bg-amber-400'
                : 'bg-green-500'
            }
          `} />

        </Link>

      </header>

      {/* ================= MOBILE BOTTOM NAV ================= */}

      <nav className="
        fixed bottom-0 left-0 right-0 z-50
        md:hidden
        bg-[#07070a]/85
        backdrop-blur-3xl
        border-t border-white/[0.12]
        shadow-[0_-10px_35px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)]
        pb-[env(safe-area-inset-bottom)]
      ">

        <div className="
          flex items-center justify-around
          h-[64px] px-3
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
                  h-[52px] rounded-xl
                  flex flex-col items-center justify-center
                  gap-1
                  transition-all duration-300
                  ${
                    isActive
                      ? 'bg-white/[0.08] text-white shadow-inner border border-white/10'
                      : 'text-gray-400 active:text-white hover:bg-white/[0.04]'
                  }
                `}
              >

                {/* Active Indicator Top Glow */}

                <span className={`
                  absolute top-0
                  h-[2px] w-8 rounded-full
                  bg-[#E50914]
                  shadow-[0_0_12px_rgba(229,9,20,0.9)]
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
                      ? 'text-[#E50914] scale-110 drop-shadow-[0_0_8px_rgba(229,9,20,0.6)]'
                      : 'text-gray-400'
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
                      : 'font-medium text-gray-400'
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
