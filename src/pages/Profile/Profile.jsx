import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Footer from '../../components/Footer/Footer';
import Watch from '../../components/Watch/Watch';
import Skeleton from '../../components/Skeleton/Skeleton';

// IMPORT ADDED: Ensure the path to your TMDB utility file is correct
import { fetchTMDBDetails } from '../../content/tmdb.js';

// Helper to read stored details (full item objects)
const getStoredDetails = () => {
  try {
    return JSON.parse(localStorage.getItem('MyListDetails') || '{}');
  } catch {
    return {};
  }
};

const Profile = (props) => {
  const navigate = useNavigate();

  // CHANGED: Using search params to manage the modal's state directly in the URL
  const [searchParams, setSearchParams] = useSearchParams();

  const data = Array.isArray(props.data) ? props.data : [];
  const [activeTab, setActiveTab] = useState('all');

  // User data from localStorage
  const [userData, setUserData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });

  const fileInputRef = useRef(null);

  // --- Watchlist logic (updated for key‑based list with localStorage fallback) ---
  const watchListItems = useMemo(() => {
    if (!Array.isArray(props.E)) return [];

    const storedDetails = getStoredDetails(); // { [key]: fullItemObject }
    const listKeys = new Set(props.E); // e.g., "movie:12345"

    // 1. Find matching items from the full catalog
    const fromCatalog = data.filter((item) => {
      const key = `${item.type}:${item.tmdbId}`;
      return listKeys.has(key);
    });

    // 2. Find keys that are not in the catalog and create items from stored details
    const catalogKeys = new Set(fromCatalog.map((item) => `${item.type}:${item.tmdbId}`));
    const missingKeys = [...listKeys].filter((key) => !catalogKeys.has(key) && storedDetails[key]);

    const fromStorage = missingKeys.map((key) => ({
      ...storedDetails[key], // whole object saved during add()
      // ensure id is a number if needed (it was stored as item.id)
      id: storedDetails[key].id ?? key,
    }));

    return [...fromCatalog, ...fromStorage];
  }, [data, props.E]);

  const movieItems = watchListItems.filter((item) => item.type === 'movie');
  const seriesItems = watchListItems.filter((item) => item.type === 'tv');

  const displayedItems = useMemo(() => {
    if (activeTab === 'movies') return movieItems;
    if (activeTab === 'series') return seriesItems;
    return watchListItems;
  }, [activeTab, movieItems, seriesItems, watchListItems]);

  // Profile picture upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        const updatedUser = { ...userData, profilePic: base64String };
        setUserData(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      };
      reader.readAsDataURL(file);
    }
  };


  // ==========================================
  // ADDED: Async Fallback URL State Management
  // ==========================================
  const watchId = searchParams.get('watch');

  const [fetchedWatchItem, setFetchedWatchItem] = useState(null);
  const [isWatchLoading, setIsWatchLoading] = useState(false); // Unused currently, but good for potential loading spinners

  // 1. Try to find the item locally first (search both catalog data and watchlist storage)
  const localWatchItem = useMemo(() => {
    if (!watchId) return null;
    return [...data, ...watchListItems].find((item) => String(item.id) === String(watchId));
  }, [watchId, data, watchListItems]);

  // 2. If it's not found locally, fetch it from TMDB
  useEffect(() => {
    if (!watchId || localWatchItem) {
      setFetchedWatchItem(null); // Clear fetch cache if missing or handled locally
      return;
    }

    const fetchWatchItem = async () => {
      setIsWatchLoading(true);
      try {
        const [mediaType, tmdbId] = watchId.split('_');
        if (!mediaType || !tmdbId) throw new Error("Invalid watch ID format");

        const details = await fetchTMDBDetails(mediaType, tmdbId);
        if (!details) throw new Error('Media not found');

        // Map the rich details from fetchTMDBDetails into the shape expected by Watch
        const mappedItem = {
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
        };

        setFetchedWatchItem(mappedItem);
      } catch (error) {
        console.error("Failed to fetch direct watch item:", error);
        setFetchedWatchItem(null);
      } finally {
        setIsWatchLoading(false);
      }
    };

    fetchWatchItem();
  }, [watchId, localWatchItem]);

  // 3. Resolve the final watchItem (prioritize local, fallback to fetched)
  const watchItem = localWatchItem || fetchedWatchItem;
  const watchOpen = !!watchItem;

  // 4. Simplified openWatch & clearWatchFromUrl
  const openWatch = useCallback((id, name2) => {
    if (!id) return;
    searchParams.set('watch', id);
    if (name2) searchParams.set('name', name2);
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  const clearWatchFromUrl = useCallback(() => {
    searchParams.delete('watch');
    searchParams.delete('name');
    setSearchParams(searchParams);
    setFetchedWatchItem(null);
  }, [searchParams, setSearchParams]);
  // ==========================================


  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  // Loading state
  if (props.loading) {
    return (
      <div className="min-h-screen bg-[#141414] text-white pt-20 px-6 md:px-12 lg:px-16">
        <Skeleton type="card" count={6} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans selection:bg-[#E50914] selection:text-white">
      {/* Hero Profile Section */}
      <section className="relative w-full bg-gradient-to-b from-[#202020] to-[#141414] pt-12 pb-8 px-6 md:px-12 lg:px-16 border-b border-[#2a2a2a]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10">
          {/* Netflix-style Avatar (Rounded Square) */}
          <div className="relative group flex-shrink-0">
            <div
              className="w-32 h-32 md:w-40 md:h-40 rounded bg-[#2a2a2a] flex items-center justify-center overflow-hidden cursor-pointer shadow-2xl ring-1 ring-white/10 group-hover:ring-white/40 transition-all duration-300"
              onClick={() => fileInputRef.current?.click()}
              title="Change Profile Icon"
              style={{
                backgroundImage: userData.profilePic ? `url(${userData.profilePic})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {!userData.profilePic && (
                <i className="fa-solid fa-user text-gray-500 text-5xl group-hover:scale-110 transition-transform" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <i className="fa-solid fa-camera text-white text-2xl drop-shadow-md" />
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

          {/* User Info & Stats */}
          <div className="flex-1 text-center md:text-left flex flex-col md:pb-2">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 drop-shadow-lg">
              {String(userData?.name || 'Guest')}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-gray-300 mb-6 md:mb-0">
              <div className="flex flex-col items-center md:items-start">
                <span className="text-2xl font-bold text-white">{watchListItems.length}</span>
                <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">My List</span>
              </div>
              <div className="w-px h-8 bg-gray-700 hidden sm:block"></div>
              <div className="flex flex-col items-center md:items-start">
                <span className="text-2xl font-bold text-white">{movieItems.length}</span>
                <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">Movies</span>
              </div>
              <div className="w-px h-8 bg-gray-700 hidden sm:block"></div>
              <div className="flex flex-col items-center md:items-start">
                <span className="text-2xl font-bold text-white">{seriesItems.length}</span>
                <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">TV Shows</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 md:pb-2">
            <button
              onClick={() => navigate('/account')}
              className="px-6 py-2 bg-transparent border border-gray-500 text-white rounded hover:border-white hover:bg-white/10 transition font-medium"
            >
              Account
            </button>
            <button
              onClick={logout}
              className="px-6 py-2 bg-transparent border border-gray-500 text-white rounded hover:border-[#E50914] hover:bg-[#E50914]/10 hover:text-[#E50914] transition font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </section>

      {/* Content Area */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 py-8 min-h-[40vh]">
        {watchListItems.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center animate-[fadeIn_0.5s_ease-out]">
            <div className="w-24 h-24 rounded-full border-2 border-[#2a2a2a] flex items-center justify-center mb-6">
              <i className="fa-solid fa-list text-4xl text-gray-600"></i>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-200">Your List is empty</h2>
            <p className="text-gray-400 mb-8 max-w-md">
              Add shows and movies to your list to easily find them later.
            </p>
            <button
              onClick={() => navigate('/search')}
              className="px-8 py-3 bg-white text-black font-bold text-lg rounded hover:bg-white/80 active:scale-95 transition"
            >
              Find Something to Watch
            </button>
          </div>
        ) : (
          /* Watchlist Grid with Tabs */
          <div className="animate-[fadeIn_0.5s_ease-out]">
            {/* Tabs */}
            <div className="flex items-center gap-6 mb-8 border-b border-[#2a2a2a]">
              {['all', 'movies', 'series'].map((tab) => (
                <button
                  key={tab}
                  className={`pb-3 text-sm sm:text-base font-semibold uppercase tracking-wider transition-colors relative ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'all' ? 'My List' : tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#E50914] rounded-t-sm"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="flex flex-wrap w-full justify-between gap-3">
              {displayedItems.map((item) => {
                return (
                  <div key={item.id}>
                    <Card
                      sow={() => openWatch(`${item.type}_${item.id}`)}
                      id={item.id}
                      img={item.name}
                      name={item.name2}
                      type={item.type}
                      rating={item.rating}
                    />
                  </div>
                );
              })}
            </div>

            {displayedItems.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No {activeTab} found in your list.
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />

      {/* Watch Modal */}
      {watchOpen && watchItem && (
        <Watch
          data={data}
          sow={openWatch}
          onClose={clearWatchFromUrl}
          sid={watchItem?.id}
          El={props.E.includes(`${watchItem?.type}:${watchItem?.tmdbId}`) ? 'ADDED' : '+'}
          img={watchItem?.img}
          type={watchItem?.type}
          id={watchItem?.tmdbId}
          s={watchItem?.episodes}
          mname={watchItem?.name2}
          name={watchItem?.nameImg || watchItem?.name2}
          name2={watchItem?.name}
          yr={watchItem?.releaseYear}
          ua={watchItem?.ua}
          season={watchItem?.season}
          lan={watchItem?.language?.length || 0}
          desc={watchItem?.desc}
          cat={watchItem?.category}
          rating={watchItem?.rating}
          language={watchItem?.language}
          add={props.add}
          e={props.E}
          play={props.play}
        />
      )}
    </div>
  );
};

export default React.memo(Profile);