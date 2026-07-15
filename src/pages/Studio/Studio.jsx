import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Watch from '../../components/Watch/Watch';
import { fetchTMDBStudioTitles } from '../../content/tmdb';
import Footer from '../../components/Footer/Footer';
import Skeleton from '../../components/Skeleton/Skeleton';
import RailRow from '../../components/RailRow/RailRow';
import { useRailScroll } from '../../hooks/useRailScroll';

const GENRE_FILTERS = ['All', 'Action', 'Sci-Fi', 'Thriller', 'Adventure', 'Drama', 'Animation', 'TV Shows', 'Movies'];

const Studio = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = Array.isArray(props.data) ? props.data : [];
  const [studioData, setStudioData] = useState([]);
  const [studioLoading, setStudioLoading] = useState(false);
  const [watchItem, setWatchItem] = useState(null);
  const [watchOpen, setWatchOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const studioFromQuery = new URLSearchParams(location.search).get('studio_name');
  const studioName = String(studioFromQuery || props.studio || '').trim();

  // Fetch studio data
  useEffect(() => {
    let active = true;
    const loadStudioData = async () => {
      if (!studioName) { if (active) setStudioData([]); return; }
      setStudioLoading(true);
      try {
        const items = await fetchTMDBStudioTitles(studioName, { moviePages: 3, tvPages: 3 });
        if (active) setStudioData(items);
      } catch {
        if (active) setStudioData([]);
      } finally {
        if (active) setStudioLoading(false);
      }
    };
    loadStudioData();
    return () => { active = false; };
  }, [studioName]);

  // Filtered data based on active filter
  const filteredData = useMemo(() => {
    if (activeFilter === 'All') return studioData;
    if (activeFilter === 'Movies') return studioData.filter(i => i.type === 'movie');
    if (activeFilter === 'TV Shows') return studioData.filter(i => i.type === 'tv');
    return studioData.filter(i =>
      (i.category || []).some(g => g.toLowerCase().includes(activeFilter.toLowerCase()))
    );
  }, [studioData, activeFilter]);

  const allData = useMemo(() => [...studioData, ...data], [data, studioData]);

  // Set initial watch item
  useEffect(() => {
    if (!watchItem && filteredData.length > 0) setWatchItem(filteredData[0]);
  }, [filteredData, watchItem]);

  // Compute rails
  const recentlyAdded = useMemo(() =>
    [...studioData].sort((a, b) => {
      const da = new Date(a.releaseDate || a.firstAirDate || 0);
      const db = new Date(b.releaseDate || b.firstAirDate || 0);
      return db - da;
    }).slice(0, 15),
    [studioData]
  );

  const rails = useMemo(() => {
    if (filteredData.length === 0) return [];
    const movies = filteredData.filter(i => i.type === 'movie');
    const tvShows = filteredData.filter(i => i.type === 'tv');
    const result = [];
    if (activeFilter === 'All' && recentlyAdded.length > 0) result.push({ title: 'Recently Added', items: recentlyAdded });
    if (movies.length > 0) result.push({ title: 'Movies', items: movies });
    if (tvShows.length > 0) result.push({ title: 'TV Shows', items: tvShows });
    return result;
  }, [filteredData, recentlyAdded, activeFilter]);

  const railKeys = useMemo(() => rails.map((_, idx) => `rail-${idx}`), [rails]);
  const { scrollState, setTrackRef, onRailScroll, handleRailScroll } = useRailScroll(railKeys);

  // ==========================================
  // Watch modal logic (state-driven)
  // ==========================================
  const openWatch = useCallback((id) => {
    const selected = allData.find(i => i.id === id);
    if (!selected) return;
    setWatchItem(selected);
    setWatchOpen(true);
    navigate(`${location.pathname}?studio_name=${encodeURIComponent(studioName)}&watch=${selected.id}`);
  }, [allData, location.pathname, navigate, studioName]);

  const clearWatchFromUrl = useCallback(() => {
    setWatchOpen(false);
    navigate(`${location.pathname}?studio_name=${encodeURIComponent(studioName)}`);
  }, [navigate, location.pathname, studioName]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const watchId = Number(params.get('watch'));
    if (!watchId) return;
    const selected = allData.find(i => i.id === watchId);
    if (!selected) return;
    setWatchItem(selected);
    setWatchOpen(true);
  }, [allData, location.search]);

  // Loading state mapping to the new Skeleton component
  if (props.loading || (studioLoading && filteredData.length === 0)) {
    return (
      <div className="min-h-screen bg-[#141414] text-white">
        <Skeleton type="banner" />
        <div className="px-6 md:px-12 lg:px-16 mt-4 space-y-12">
          {[1, 2, 3].map((section) => (
            <Skeleton key={section} type="section" count={8} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans selection:bg-[#E50914] selection:text-white">
      
      {/* ── Studio Hero Header ── */}
      <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] flex items-end justify-center overflow-hidden bg-black">
        {/* Dynamic Studio Background */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out opacity-80"
          style={{
            backgroundImage: `url(${props.bg || studioData[0]?.img || ''})`,
          }}
        />
        
        {/* Deep Studio Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(20,20,20,0.8)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent bottom-0" />
        
        <div className="relative z-10 px-6 md:px-12 lg:px-16 pb-16 w-full max-w-[1400px] mx-auto text-center flex flex-col items-center">
          <span className="px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white/80 bg-white/10 backdrop-blur-md rounded-full shadow-lg mb-4">
            Studio Hub
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black drop-shadow-2xl tracking-tight text-white mb-3">
            {studioName || 'Studio'}
          </h1>
          <p className="text-gray-300 text-sm md:text-base lg:text-lg font-medium drop-shadow-md">
            Explore {studioData.length} premium titles from this studio
          </p>
        </div>
      </div>

      {/* ── Sticky Filter Bar ── */}
      <div className="sticky top-0 z-40 bg-[#141414]/90 backdrop-blur-xl border-b border-[#2a2a2a] shadow-lg transition-all">
        {/* Hide scrollbar but allow horizontal scrolling on mobile */}
        <div className="px-6 md:px-12 lg:px-16 max-w-[1400px] mx-auto py-4 flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {GENRE_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2 text-sm font-semibold rounded-full border transition-all whitespace-nowrap ${
                activeFilter === f
                  ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                  : 'bg-[#2a2a2a]/50 text-gray-300 border-[#333] hover:border-white/50 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content Rails ── */}
      <div className="px-6 md:px-12 lg:px-16 max-w-[1400px] mx-auto py-12 min-h-[40vh]">
        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-[fadeIn_0.5s_ease-out]">
            <i className="fa-solid fa-clapperboard text-5xl text-gray-600 mb-6"></i>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">No titles found</h2>
            <p className="text-gray-400 text-lg max-w-md">
              We couldn't find any {activeFilter} titles for this studio. Try exploring another category.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {rails.map((rail, idx) => (
              <RailRow
                key={rail.title}
                title={rail.title}
                railKey={`rail-${idx}`}
                items={rail.items}
                scrollState={scrollState}
                setTrackRef={setTrackRef}
                onRailScroll={onRailScroll}
                handleRailScroll={handleRailScroll}
                eager={idx === 0}
                renderItem={(item) => (
                  <Card
                    sow={openWatch}
                    id={item.id}
                    img={item.name}
                    name={item.name2}
                    ry={item.releaseYear}
                    ua={item.ua}
                    lan={item.language?.length || 0}
                    desc={item.desc}
                    s={item.season}
                    type={item.type}
                    tid={item.tmdbId}
                    add={props.add}
                    e={props.e}
                    play={props.play}
                    rating={item.rating}
                  />
                )}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* ── Watch Modal ── */}
      {watchOpen && (
        <Watch
          data={allData}
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

export default React.memo(Studio);