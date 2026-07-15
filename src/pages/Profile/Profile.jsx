import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Footer from '../../components/Footer/Footer';
import Watch from '../../components/Watch/Watch';
import Skeleton from '../../components/Skeleton/Skeleton';

const Profile = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = Array.isArray(props.data) ? props.data : [];
  const [watchItem, setWatchItem] = useState(data[0] || null);
  const [watchOpen, setWatchOpen] = useState(false);
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

  useEffect(() => {
    if (!watchItem && data.length > 0) setWatchItem(data[0]);
  }, [data, watchItem]);

  // Watchlist logic
  const watchListItems = useMemo(() => {
    if (!Array.isArray(props.E)) return [];
    return data.filter((item) => props.E.includes(item.id));
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

  // Watch modal logic
  const openWatch = useCallback((id) => {
    const selected = data.find((item) => item.id === id);
    if (!selected) return;
    setWatchItem(selected);
    setWatchOpen(true);
    navigate(`${location.pathname}?watch=${selected.id}&name=${encodeURIComponent(selected.name2)}`);
  }, [data, navigate, location.pathname]);

  const clearWatchFromUrl = useCallback(() => {
    setWatchOpen(false);
    navigate(location.pathname);
  }, [navigate, location.pathname]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const watchId = Number(params.get('watch'));
    if (!watchId) return;
    const selected = data.find((item) => item.id === watchId);
    if (!selected) return;
    setWatchItem(selected);
    setWatchOpen(true);
  }, [data, location.search]);

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
              {/* Hover overlay for upload */}
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
              onClick={() => navigate('/account')} // Mock route for account settings
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
                  className={`pb-3 text-sm sm:text-base font-semibold uppercase tracking-wider transition-colors relative ${
                    activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10">
              {displayedItems.map((item) => (
                <div key={item.id} className="w-full flex justify-center">
                   <Card
                    sow={openWatch}
                    id={item.id}
                    img={item.name}
                    name={item.name2}
                    type={item.type}
                    rating={item.rating}
                    add={props.add}
                    e={props.e}
                    play={props.play}
                    // Removing strict width limits from Card so it fills the grid column
                    width="100%"
                  />
                </div>
              ))}
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
      {watchOpen && (
        <Watch
          data={data}
          sow={openWatch}
          onClose={clearWatchFromUrl}
          sid={watchItem?.id}
          El={Array.isArray(props.e) && props.e.includes(watchItem?.id) ? 'ADDED' : '+'}
          img={watchItem?.img}
          type={watchItem?.type}
          id={watchItem?.tmdbId}
          s={watchItem?.episodes}
          mname={watchItem?.name2}
          name={watchItem?.nameImg}
          name2={watchItem?.name2}
          yr={watchItem?.releaseYear}
          ua={watchItem?.ua}
          season={watchItem?.season}
          lan={watchItem?.language?.length || 0}
          desc={watchItem?.desc}
          cat={watchItem?.category}
          rating={watchItem?.rating}
          language={watchItem?.language}
          add={props.add}
          e={props.e}
          play={props.play}
        />
      )}
    </div>
  );
};

export default React.memo(Profile);