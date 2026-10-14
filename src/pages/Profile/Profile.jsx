import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Footer from '../../components/Footer/Footer';
import Watch from '../../components/Watch/Watch';
import Skeleton from '../../components/Skeleton/Skeleton';
import { fetchTMDBDetails } from '../../content/tmdb.js';

/* ───────────────────────────── helpers ───────────────────────────── */

const getStoredDetails = () => {
  try {
    return JSON.parse(localStorage.getItem('MyListDetails') || '{}');
  } catch {
    return {};
  }
};

const DEFAULT_AVATAR =
  'https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-qo9h82134t9nv0j0.jpg';

/* ───────────────────────────── icons ───────────────────────────── */

const CameraIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

const EmptyListIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M8 8h8M8 12h8M8 16h4" />
  </svg>
);

/* ───────────────────────────── component ───────────────────────────── */

const Profile = (props) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const data = Array.isArray(props.data) ? props.data : [];
  const [activeTab, setActiveTab] = useState('all');

  // User state
  const [userData, setUserData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });

  const fileInputRef = useRef(null);

  // Watchlist computation
  const watchListItems = useMemo(() => {
    if (!Array.isArray(props.E)) return [];

    const storedDetails = getStoredDetails();
    const listKeys = new Set(props.E);

    // 1. Catalog matches
    const fromCatalog = data.filter((item) => {
      const key = `${item.type}:${item.tmdbId}`;
      return listKeys.has(key);
    });

    // 2. LocalStorage matches (for TMDB items added outside hardcoded catalog)
    const catalogKeys = new Set(fromCatalog.map((item) => `${item.type}:${item.tmdbId}`));
    const missingKeys = [...listKeys].filter((key) => !catalogKeys.has(key) && storedDetails[key]);

    const fromStorage = missingKeys.map((key) => ({
      ...storedDetails[key],
      id: storedDetails[key].id ?? key,
    }));

    return [...fromCatalog, ...fromStorage];
  }, [data, props.E]);

  const movieItems = useMemo(
    () => watchListItems.filter((item) => item.type === 'movie'),
    [watchListItems]
  );
  const seriesItems = useMemo(
    () => watchListItems.filter((item) => item.type === 'tv'),
    [watchListItems]
  );

  const displayedItems = useMemo(() => {
    if (activeTab === 'movies') return movieItems;
    if (activeTab === 'series') return seriesItems;
    return watchListItems;
  }, [activeTab, movieItems, seriesItems, watchListItems]);

  // Avatar upload handler
  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      const updatedUser = { ...userData, profilePic: base64String };
      setUserData(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    };
    reader.readAsDataURL(file);
  };

  /* ────────────────── Watch Modal Async State ────────────────── */
  const watchId = searchParams.get('watch');
  const [fetchedWatchItem, setFetchedWatchItem] = useState(null);

  const localWatchItem = useMemo(() => {
    if (!watchId) return null;
    return [...data, ...watchListItems].find((item) => String(item.id) === String(watchId));
  }, [watchId, data, watchListItems]);

  useEffect(() => {
    if (!watchId || localWatchItem) {
      setFetchedWatchItem(null);
      return;
    }

    let isMounted = true;
    const fetchWatchItem = async () => {
      try {
        const [mediaType, tmdbId] = watchId.split('_');
        if (!mediaType || !tmdbId) return;

        const details = await fetchTMDBDetails(mediaType, tmdbId);
        if (!details || !isMounted) return;

        setFetchedWatchItem({
          id: watchId,
          tmdbId: Number(tmdbId),
          type: mediaType,
          img: details.mbg,
          name: details.mbg,
          name2: details.title,
          nameImg: details.nameImg2,
          releaseYear: details.year || new Date().getFullYear(),
          ua: details.ageRating,
          season: details.seasonLabel,
          desc: details.desc,
          category: details.categories,
          language: details.languages,
          episodes: details.episodes,
          rating: 0,
        });
      } catch (error) {
        console.error('Failed to fetch details:', error);
      }
    };

    fetchWatchItem();
    return () => {
      isMounted = false;
    };
  }, [watchId, localWatchItem]);

  const watchItem = localWatchItem || fetchedWatchItem;
  const watchOpen = !!watchItem;

  const openWatch = useCallback(
    (id, name2) => {
      if (!id) return;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('watch', id);
          if (name2) next.set('name', name2);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const clearWatchFromUrl = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('watch');
        next.delete('name');
        return next;
      },
      { replace: true }
    );
    setFetchedWatchItem(null);
  }, [setSearchParams]);

  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  /* Loading State */
  if (props.loading) {
    return (
      <div className="min-h-screen bg-[#141414] text-white pt-24 px-6 md:px-12 lg:px-16">
        <div className="mx-auto mb-10 h-32 w-full max-w-4xl animate-pulse rounded bg-[#202020]" />
        <Skeleton type="card" count={12} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans selection:bg-[#E50914] selection:text-white">
      {/* ═══════════════════════ NETFLIX PROFILE HERO ═══════════════════════ */}
      <section className="relative w-full border-b border-white/10 bg-gradient-to-b from-[#222222] via-[#181818] to-[#141414] pt-24 pb-8 px-5 sm:px-10 md:px-14">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 sm:gap-8">
          {/* Avatar & User Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-7 text-center sm:text-left">
            {/* Netflix Avatar */}
            <div className="relative group flex-shrink-0">
              <div
                role="button"
                tabIndex={0}
                title="Change Profile Icon"
                onClick={() => fileInputRef.current?.click()}
                className="
                  w-28 h-28 sm:w-36 sm:h-36 rounded-[4px] bg-[#2a2a2a]
                  overflow-hidden cursor-pointer shadow-xl
                  ring-2 ring-white/20 group-hover:ring-white transition-all duration-200
                "
                style={{
                  backgroundImage: `url(${userData.profilePic || DEFAULT_AVATAR})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Camera Overlay on Hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity duration-200">
                  <CameraIcon className="w-6 h-6 text-white" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-200">Edit</span>
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* Profile Info & Metrics */}
            <div className="space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="bg-[#E50914] text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-[2px] tracking-wider">
                  Member
                </span>
                <span className="text-xs text-gray-400 font-medium">Standard HD</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                {String(userData?.name || 'Guest')}
              </h1>

              {/* Stat Counters */}
              <div className="flex items-center justify-center sm:justify-start gap-6 pt-1 text-gray-400">
                <div>
                  <span className="font-bold text-white text-base mr-1.5">{watchListItems.length}</span>
                  <span className="text-xs uppercase tracking-wider">In List</span>
                </div>
                <div className="h-3 w-px bg-white/20" />
                <div>
                  <span className="font-bold text-white text-base mr-1.5">{movieItems.length}</span>
                  <span className="text-xs uppercase tracking-wider">Movies</span>
                </div>
                <div className="h-3 w-px bg-white/20" />
                <div>
                  <span className="font-bold text-white text-base mr-1.5">{seriesItems.length}</span>
                  <span className="text-xs uppercase tracking-wider">Shows</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/account')}
              className="
                px-5 py-2 rounded-[3px] border border-white/30 text-xs sm:text-sm font-semibold
                text-gray-200 hover:border-white hover:text-white hover:bg-white/10
                transition-colors duration-150
              "
            >
              Account
            </button>
            <button
              type="button"
              onClick={logout}
              className="
                px-5 py-2 rounded-[3px] border border-white/30 text-xs sm:text-sm font-semibold
                text-gray-200 hover:border-[#E50914] hover:bg-[#E50914]/15 hover:text-[#E50914]
                transition-colors duration-150
              "
            >
              Sign Out
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ MY LIST SECTION ═══════════════════════ */}
      <main className="max-w-[1400px] mx-auto px-5 sm:px-10 md:px-14 py-8 min-h-[50vh]">
        {watchListItems.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full border border-white/10 bg-[#1e1e1e] flex items-center justify-center mb-5 text-gray-500">
              <EmptyListIcon className="w-9 h-9" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-white">Your List is empty</h2>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Add movies and TV shows to your list to easily pick up where you left off.
            </p>
            <button
              type="button"
              onClick={() => navigate('/search')}
              className="px-6 py-2.5 bg-white text-black font-bold text-sm rounded-[3px] hover:bg-gray-200 active:scale-95 transition-all"
            >
              Find Something to Watch
            </button>
          </div>
        ) : (
          /* Watchlist Grid with Tabs */
          <div>
            {/* Tabs Header */}
            <div className="flex items-center gap-6 mb-8 border-b border-white/10">
              {[
                { id: 'all', label: 'My List', count: watchListItems.length },
                { id: 'movies', label: 'Movies', count: movieItems.length },
                { id: 'series', label: 'TV Shows', count: seriesItems.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    pb-3 text-sm font-semibold tracking-wide transition-colors relative flex items-center gap-2
                    ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}
                  `}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${activeTab === tab.id ? 'bg-[#E50914] text-white' : 'bg-[#222] text-gray-400'
                      }`}
                  >
                    {tab.count}
                  </span>

                  {activeTab === tab.id && (
                    <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#E50914] rounded-t-sm" />
                  )}
                </button>
              ))}
            </div>

            {/* NETFLIX POSTER GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 justify-items-center">
              {displayedItems.map((item) => (
                <Card
                  key={item.id}
                  sow={() => openWatch(`${item.type}_${item.id}`, item.name2)}
                  id={item.id}
                  img={item.name}
                  name={item.name2}
                  type={item.type}
                  rating={item.rating}
                  play={props.play}
                />
              ))}
            </div>

            {displayedItems.length === 0 && (
              <div className="text-center py-16 text-gray-500 text-sm">
                No {activeTab === 'movies' ? 'movies' : 'TV shows'} in your list.
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />

      {/* ═══════════════════════ WATCH MODAL ═══════════════════════ */}
      {watchOpen && watchItem && (
        <Watch
          data={data}
          sow={openWatch}
          onClose={clearWatchFromUrl}
          sid={watchItem.id}
          El={props.E.includes(`${watchItem.type}:${watchItem.tmdbId}`) ? 'ADDED' : '+'}
          img={watchItem.img}
          type={watchItem.type}
          id={watchItem.tmdbId}
          s={watchItem.episodes}
          mname={watchItem.name2}
          name={watchItem.nameImg || watchItem.name2}
          name2={watchItem.name}
          yr={watchItem.releaseYear}
          ua={watchItem.ua}
          season={watchItem.season}
          lan={watchItem.language?.length || 0}
          desc={watchItem.desc}
          cat={watchItem.category}
          rating={watchItem.rating}
          language={watchItem.language}
          add={props.add}
          e={props.E}
          play={props.play}
        />
      )}
    </div>
  );
};

export default React.memo(Profile);