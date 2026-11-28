import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Footer from '../../components/Footer/Footer';
import Skeleton from '../../components/Skeleton/Skeleton';
import { getWatchPath, navigateToWatch } from '../../utils/watchNavigation';

/* ───────────────────────────── helpers & constants ───────────────────────────── */

const getStoredDetails = () => {
  try {
    return JSON.parse(localStorage.getItem('MyListDetails') || '{}');
  } catch {
    return {};
  }
};

const DEFAULT_AVATAR =
  'https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-qo9h82134t9nv0j0.jpg';

const NETFLIX_PRESET_AVATARS = [
  'https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-qo9h82134t9nv0j0.jpg',
  'https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-88wkdmjrorckekha.jpg',
  'https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-vnl1thqrh02x7ra2.jpg',
  'https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-ukf2c7ce37x5p9ab.jpg',
];

/**
 * Ensures any item or stored key resolves to a clean "movie_12345" or "tv_12345" ID
 * without double-prefixing (e.g., prevents "movie_movie_12345").
 */
const resolveWatchId = (item) => {
  if (!item) return '';
  const rawId = String(item.id || '');
  if (rawId.startsWith('movie_') || rawId.startsWith('tv_')) return rawId;
  if (rawId.includes(':')) return rawId.replace(':', '_');
  if (item.type && item.tmdbId) return `${item.type}_${item.tmdbId}`;
  if (item.type && rawId) return `${item.type}_${rawId}`;
  return rawId;
};

/* ───────────────────────────── component ───────────────────────────── */

const Profile = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const data = Array.isArray(props.data) ? props.data : [];
  const rawListProp = Array.isArray(props.E)
    ? props.E
    : Array.isArray(props.e)
      ? props.e
      : [];

  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [listQuery, setListQuery] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // User state
  const [userData, setUserData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });

  const [nameInput, setNameInput] = useState(() => userData?.name || 'Guest');
  const fileInputRef = useRef(null);

  // Normalize all watchlist keys so both "movie:123" and "movie_123" match seamlessly
  const watchListItems = useMemo(() => {
    if (!rawListProp.length) return [];

    const storedDetails = getStoredDetails();
    const normalizedSet = new Set();

    rawListProp.forEach((k) => {
      const str = String(k || '');
      normalizedSet.add(str);
      normalizedSet.add(str.replace(':', '_'));
      normalizedSet.add(str.replace('_', ':'));
    });

    // 1. Match items from loaded catalog
    const fromCatalog = data.filter((item) => {
      const colonKey = `${item.type}:${item.tmdbId}`;
      const underscoreKey = `${item.type}_${item.tmdbId}`;
      return (
        normalizedSet.has(String(item.id)) ||
        normalizedSet.has(colonKey) ||
        normalizedSet.has(underscoreKey)
      );
    });

    const matchedIds = new Set(fromCatalog.map((item) => resolveWatchId(item)));

    // 2. Match items saved in localStorage (MyListDetails) outside initial catalog
    const fromStorage = [];
    rawListProp.forEach((rawKey) => {
      const colonKey = String(rawKey).replace('_', ':');
      const underscoreKey = String(rawKey).replace(':', '_');
      const stored = storedDetails[rawKey] || storedDetails[colonKey] || storedDetails[underscoreKey];

      if (stored) {
        const cleanId = resolveWatchId(stored) || underscoreKey;
        if (!matchedIds.has(cleanId)) {
          matchedIds.add(cleanId);
          fromStorage.push({
            ...stored,
            id: cleanId,
          });
        }
      }
    });

    return [...fromCatalog, ...fromStorage];
  }, [data, rawListProp]);

  const movieItems = useMemo(
    () => watchListItems.filter((item) => item.type === 'movie'),
    [watchListItems]
  );

  const seriesItems = useMemo(
    () => watchListItems.filter((item) => item.type === 'tv'),
    [watchListItems]
  );

  const displayedItems = useMemo(() => {
    let base = watchListItems;
    if (activeTab === 'movies') base = movieItems;
    if (activeTab === 'series') base = seriesItems;

    const q = listQuery.trim().toLowerCase();
    if (q) {
      base = base.filter((item) =>
        String(item.name2 || '').toLowerCase().includes(q)
      );
    }

    if (sortBy === 'rating') {
      return [...base].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    }
    if (sortBy === 'year') {
      return [...base].sort((a, b) => (Number(b.releaseYear) || 0) - (Number(a.releaseYear) || 0));
    }
    if (sortBy === 'az') {
      return [...base].sort((a, b) =>
        String(a.name2 || '').localeCompare(String(b.name2 || ''))
      );
    }

    return base;
  }, [activeTab, movieItems, seriesItems, watchListItems, listQuery, sortBy]);

  /* ────────────────── Profile Actions ────────────────── */
  const saveUserPatch = (patch) => {
    const updated = { ...userData, ...patch };
    setUserData(updated);
    try {
      localStorage.setItem('user', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save user data to localStorage:', err);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      saveUserPatch({ profilePic: reader.result });
      setShowAvatarPicker(false);
    };
    reader.readAsDataURL(file);
  };

  const handleNameSave = (e) => {
    e?.preventDefault();
    const trimmed = nameInput.trim() || 'Guest';
    saveUserPatch({ name: trimmed });
    setNameInput(trimmed);
    setIsEditingName(false);
  };

  const logout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  /* ────────────────── Watch Page Navigation ────────────────── */
  const watchId = searchParams.get('watch');
  useEffect(() => {
    if (watchId) {
      navigate(getWatchPath(watchId), { replace: true });
    }
  }, [watchId, navigate]);

  const openWatch = useCallback(
    (id, fallbackType) => {
      if (!id) return;
      const normalizedTarget = String(id).replace(':', '_');
      const selected = [...data, ...watchListItems].find(
        (item) =>
          resolveWatchId(item) === normalizedTarget ||
          String(item.id) === String(id)
      );
      navigateToWatch(navigate, {
        itemOrId: id,
        fallbackType,
        item: selected,
        currentLocation: location,
      });
    },
    [data, watchListItems, navigate, location]
  );

  /* Loading State */
  if (props.loading) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white pt-24 px-6 md:px-12 lg:px-16">
        <div className="mx-auto mb-10 h-36 w-full max-w-[1400px] animate-pulse rounded-2xl glass-mirror" />
        <Skeleton type="card" count={12} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070a] text-white font-sans selection:bg-[#E50914] selection:text-white">
      {/* ═══════════════════════ NETFLIX PROFILE BANNER ═══════════════════════ */}
      <section className="relative w-full border-b border-white/[0.08] bg-gradient-to-b from-white/[0.04] via-transparent to-transparent pt-24 pb-10 px-4 sm:px-8 md:px-12 lg:px-16 overflow-hidden">
        {/* Subtle Red Ambient Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/4 w-96 h-96 bg-[#E50914]/15 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-[1400px] mx-auto flex flex-col md:flex-row items-center md:items-end justify-between gap-6 md:gap-8">
          {/* Avatar + Identity */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-7 text-center sm:text-left">
            {/* Netflix Square Rounded Avatar with Glass Specular Ring */}
            <div className="relative group flex-shrink-0">
              <div
                role="button"
                tabIndex={0}
                title="Change Profile Avatar"
                onClick={() => setShowAvatarPicker((prev) => !prev)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowAvatarPicker((prev) => !prev);
                  }
                }}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-[#101018] overflow-hidden cursor-pointer shadow-glass-md border border-white/20 ring-2 ring-transparent group-hover:ring-[#E50914] transition-all duration-300 relative"
              >
                <img
                  src={userData.profilePic || DEFAULT_AVATAR}
                  alt={userData?.name || 'Profile'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity duration-200 backdrop-blur-xs">
                  <i className="fa-solid fa-pen text-white text-lg" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-200">
                    Avatar
                  </span>
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageUpload}
              />

              {/* Quick Avatar Picker Popover - Glass Modal */}
              {showAvatarPicker && (
                <div className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 top-full mt-3 z-40 w-72 p-4 rounded-2xl glass-modal border border-white/20 shadow-glass-lg animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                      Choose Icon
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAvatarPicker(false)}
                      className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center text-xs transition cursor-pointer"
                    >
                      <i className="fa-solid fa-xmark" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2.5 mb-3">
                    {NETFLIX_PRESET_AVATARS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          saveUserPatch({ profilePic: url });
                          setShowAvatarPicker(false);
                        }}
                        className="aspect-square rounded-xl overflow-hidden border border-white/15 hover:border-[#E50914] hover:shadow-neon-red transition-all cursor-pointer"
                      >
                        <img src={url} alt={`Preset ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 glass-btn-secondary text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <i className="fa-solid fa-upload text-[11px]" />
                    <span>Upload Custom Photo</span>
                  </button>
                </div>
              )}
            </div>

            {/* User Details & Watchlist Stats */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="bg-[#E50914] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-neon-red tracking-wider">
                  N
                </span>
                <span className="text-xs text-gray-300 font-semibold tracking-wide uppercase">
                  Premium Ultra HD
                </span>
              </div>

              {/* Editable Profile Name */}
              {isEditingName ? (
                <form onSubmit={handleNameSave} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    maxLength={24}
                    autoFocus
                    className="glass-input text-white text-xl sm:text-2xl font-bold px-3 py-1.5 rounded-xl border border-white/30 focus:outline-none w-48 sm:w-60"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 glass-btn-primary text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNameInput(userData?.name || 'Guest');
                      setIsEditingName(false);
                    }}
                    className="px-3 py-1.5 glass-btn-secondary text-gray-300 text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center sm:justify-start gap-3 group">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-sm">
                    {String(userData?.name || 'Guest')}
                  </h1>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    title="Edit Profile Name"
                    className="w-8 h-8 rounded-full glass-mirror hover:border-white/40 text-gray-300 hover:text-white flex items-center justify-center transition opacity-80 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer shadow-glass-sm"
                  >
                    <i className="fa-solid fa-pen text-xs" />
                  </button>
                </div>
              )}

              {/* Metrics Row */}
              <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-1 text-gray-400">
                <div className="glass-mirror-card px-3 py-1 rounded-full flex items-baseline gap-1.5 border border-white/10">
                  <span className="font-black text-white text-sm">
                    {watchListItems.length}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                    My List
                  </span>
                </div>
                <div className="glass-mirror-card px-3 py-1 rounded-full flex items-baseline gap-1.5 border border-white/10">
                  <span className="font-black text-white text-sm">
                    {movieItems.length}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                    Movies
                  </span>
                </div>
                <div className="glass-mirror-card px-3 py-1 rounded-full flex items-baseline gap-1.5 border border-white/10">
                  <span className="font-black text-white text-sm">
                    {seriesItems.length}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                    TV Shows
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 sm:px-5 py-2.5 rounded-xl glass-btn-secondary text-xs sm:text-sm font-semibold text-white transition cursor-pointer flex items-center gap-2"
            >
              <i className="fa-solid fa-house text-xs" />
              <span>Browse Home</span>
            </button>
            <button
              type="button"
              onClick={logout}
              className="px-4 sm:px-5 py-2.5 rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-[#E50914] text-xs sm:text-sm font-semibold text-red-300 hover:text-white transition duration-200 cursor-pointer flex items-center gap-2 shadow-neon-red"
            >
              <i className="fa-solid fa-right-from-bracket text-xs" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ MY LIST CONTENT ═══════════════════════ */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-8 min-h-[55vh]">
        {watchListItems.length === 0 ? (
          /* Empty Watchlist State */
          <div className="glass-modal max-w-md mx-auto p-10 rounded-3xl text-center border border-white/10 shadow-glass-md my-16">
            <div className="w-20 h-20 rounded-2xl glass-mirror flex items-center justify-center mb-5 mx-auto text-gray-400 shadow-glass-sm">
              <i className="fa-solid fa-film text-3xl" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-white">
              Your List is currently empty
            </h2>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              Add movies and TV shows to your list as you browse so you can easily find and watch them anytime.
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="glass-btn-primary px-7 py-3 text-white font-bold text-sm rounded-xl transition shadow-neon-red cursor-pointer inline-flex items-center gap-2"
            >
              <i className="fa-solid fa-compass" />
              <span>Explore Titles</span>
            </button>
          </div>
        ) : (
          <div>
            {/* Filter Tabs + Search & Sort Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/[0.08] pb-4">
              {/* Category Tabs */}
              <div className="flex items-center gap-3">
                {[
                  { id: 'all', label: 'My List', count: watchListItems.length },
                  { id: 'movies', label: 'Movies', count: movieItems.length },
                  { id: 'series', label: 'TV Shows', count: seriesItems.length },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all relative flex items-center gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-white/15 text-white border border-white/25 shadow-glass-sm'
                          : 'glass-mirror-card text-gray-400 hover:text-white border border-white/5'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                          isActive ? 'bg-[#E50914] text-white shadow-neon-red' : 'bg-white/10 text-gray-400'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search Within List & Sort Dropdown */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-56">
                  <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    value={listQuery}
                    onChange={(e) => setListQuery(e.target.value)}
                    placeholder="Filter My List..."
                    className="w-full glass-input text-xs sm:text-sm text-white pl-9 pr-8 py-2 rounded-xl focus:outline-none transition"
                  />
                  {listQuery && (
                    <button
                      type="button"
                      onClick={() => setListQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs cursor-pointer"
                    >
                      <i className="fa-solid fa-xmark" />
                    </button>
                  )}
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort My List"
                  className="glass-input text-xs sm:text-sm text-white font-semibold px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
                >
                  <option value="default" className="bg-[#0c0c14] text-white">Order Added</option>
                  <option value="rating" className="bg-[#0c0c14] text-white">Top Rated</option>
                  <option value="year" className="bg-[#0c0c14] text-white">Release Year</option>
                  <option value="az" className="bg-[#0c0c14] text-white">Title (A-Z)</option>
                </select>
              </div>
            </div>

            {/* NETFLIX MY LIST POSTER GRID */}
            {displayedItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 justify-items-center">
                {displayedItems.map((item) => {
                  const cleanWatchId = resolveWatchId(item);
                  return (
                    <Card
                      key={cleanWatchId}
                      sow={openWatch}
                      id={cleanWatchId}
                      img={item.name || item.nameImg || item.img}
                      name={item.name2}
                      type={item.type}
                      rating={item.rating}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400 text-sm">
                No matching {activeTab === 'movies' ? 'movies' : activeTab === 'series' ? 'TV shows' : 'titles'} found in your list.
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default React.memo(Profile);