import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Watch from '../../components/Watch/Watch';
import { searchTMDBTitles } from '../../content/tmdb';
import Footer from '../../components/Footer/Footer';
import Skeleton from '../../components/Skeleton/Skeleton';
import RailRow from '../../components/RailRow/RailRow';
import { useRailScroll } from '../../hooks/useRailScroll';

const scoreItem = (item, value) => {
  const name = String(item.name2 || '').toLowerCase();
  const studio = String(item.studio || '').toLowerCase();
  const categories = (item.category || []).map((c) => String(c).toLowerCase());
  const languages = (item.language || []).map((l) => String(l).toLowerCase());

  if (name.startsWith(value)) return 100;
  if (name.includes(value)) return 80;
  if (categories.some((c) => c.includes(value))) return 60;
  if (studio.includes(value)) return 50;
  if (languages.some((l) => l.includes(value))) return 40;
  return 0;
};

const Search = (props) => {
  const [query, setQuery] = useState('');
  const [remoteResults, setRemoteResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [watchOpen, setWatchOpen] = useState(false);
  const [watchItem, setWatchItem] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const data = Array.isArray(props.data) ? props.data : [];
  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    if (!watchItem && data.length > 0) setWatchItem(data[0]);
  }, [data, watchItem]);

  // ==========================================
  // API Fetch with Debounce & AbortController
  // ==========================================
  useEffect(() => {
    if (normalizedQuery.length < 2) {
      setRemoteResults([]);
      setSearchLoading(false);
      return undefined;
    }

    let active = true;
    setSearchLoading(true);

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const results = await searchTMDBTitles(normalizedQuery, { signal: controller.signal });
        if (active) setRemoteResults(results);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Search request aborted.');
        } else {
          console.error('TMDB search failed:', error);
          if (active) setRemoteResults([]);
        }
      } finally {
        if (active) setSearchLoading(false);
      }
    }, 500);

    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [normalizedQuery]);

  // ==========================================
  // Local & remote merging
  // ==========================================
  const localResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return data
      .map((item) => ({ item, score: scoreItem(item, normalizedQuery) }))
      .filter((e) => e.score > 0)
      .sort((a, b) => b.score - a.score || b.item.releaseYear - a.item.releaseYear)
      .map((e) => e.item);
  }, [data, normalizedQuery]);

  const rankedResults = remoteResults.length > 0 ? remoteResults : localResults;

  const movieResults = useMemo(() => rankedResults.filter((i) => i.type === 'movie'), [rankedResults]);
  const seriesResults = useMemo(() => rankedResults.filter((i) => i.type === 'tv'), [rankedResults]);

  const trendingItems = data.slice(0, 20);
  const combinedForLookup = useMemo(() => [...rankedResults, ...data], [data, rankedResults]);

  const railKeys = useMemo(() => {
    const keys = [];
    if (!normalizedQuery) keys.push('trending');
    return keys;
  }, [normalizedQuery]);

  const { scrollState, setTrackRef, onRailScroll, handleRailScroll } = useRailScroll(railKeys);

  // ==========================================
  // Watch modal logic
  // ==========================================
  const openWatch = useCallback((id) => {
    const selected = combinedForLookup.find((item) => item.id === id);
    if (!selected) return;
    setWatchItem(selected);
    setWatchOpen(true);
    navigate(`${location.pathname}?watch=${selected.id}&name=${encodeURIComponent(selected.name2)}`);
  }, [combinedForLookup, navigate, location.pathname]);

  const clearWatchFromUrl = useCallback(() => {
    setWatchOpen(false);
    navigate(location.pathname);
  }, [navigate, location.pathname]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const watchId = Number(params.get('watch'));
    if (!watchId) return;

    const selected = combinedForLookup.find((item) => item.id === watchId);
    if (!selected) return;

    setWatchItem(selected);
    setWatchOpen(true);
  }, [combinedForLookup, location.search]);

  const renderCard = useCallback(
    (item) => (
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
        width="100%"
      />
    ),
    [openWatch, props.add, props.e, props.play]
  );

  // ==========================================
  // Loading state
  // ==========================================
  if (props.loading) {
    return (
      <div className="min-h-screen bg-[#141414] text-white pt-24 px-6 md:px-12 lg:px-16">
        <div className="h-14 bg-[#2a2a2a] rounded animate-pulse w-full max-w-3xl mb-12" />
        <Skeleton type="card" count={12} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans selection:bg-[#E50914] selection:text-white pb-12">
      
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-40 bg-[#141414]/95 backdrop-blur-xl border-b border-[#2a2a2a] pt-20 sm:pt-24 pb-6 px-6 md:px-12 lg:px-16 transition-all duration-300">
        <div className="relative w-full max-w-[1400px] mx-auto flex items-center">
          <i className="fa-solid fa-magnifying-glass absolute left-4 sm:left-6 text-gray-400 text-xl sm:text-2xl" />
          <input
            type="text"
            inputMode="search"
            className="w-full pl-12 sm:pl-16 pr-12 py-3 sm:py-4 bg-[#242424] border border-[#333] hover:border-gray-500 rounded text-white text-lg sm:text-xl md:text-2xl font-medium placeholder-gray-500 focus:outline-none focus:border-white focus:bg-[#2a2a2a] transition-all shadow-inner"
            placeholder="Search for movies, series, genres..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {/* Clear Button */}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 sm:right-6 text-gray-400 hover:text-white transition text-xl p-2"
              aria-label="Clear search"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1400px] mx-auto pt-8">
        {normalizedQuery ? (
          /* Active Search Results (Grid Layout) */
          <div className="px-6 md:px-12 lg:px-16 animate-[fadeIn_0.3s_ease-out]">
            
            {/* Search Meta Info */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-300">
                Explore titles related to: <span className="text-white">"{query}"</span>
              </h2>
              {searchLoading && (
                <div className="flex items-center gap-3 text-[#E50914]">
                  <i className="fa-solid fa-spinner animate-spin text-xl"></i>
                  <span className="text-sm font-semibold tracking-wider uppercase hidden sm:block">Searching</span>
                </div>
              )}
            </div>

            {/* Movies Grid */}
            {movieResults.length > 0 && (
              <div className="mb-12">
                <h3 className="text-lg text-gray-400 mb-4 font-semibold uppercase tracking-wider">Movies</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10">
                  {movieResults.map((item) => (
                    <div key={item.id} className="w-full flex justify-center">
                      {renderCard(item)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Series Grid */}
            {seriesResults.length > 0 && (
              <div className="mb-12">
                <h3 className="text-lg text-gray-400 mb-4 font-semibold uppercase tracking-wider">TV Shows</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10">
                  {seriesResults.map((item) => (
                    <div key={item.id} className="w-full flex justify-center">
                      {renderCard(item)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {rankedResults.length === 0 && !searchLoading && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <i className="fa-regular fa-face-frown text-5xl text-gray-600 mb-6"></i>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">No matches found for "{query}"</h3>
                <p className="text-gray-400 text-lg max-w-md">
                  We couldn't find anything matching your search. Try adjusting your keywords, genres, or language.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Trending Default State (Rail Layout) */
          <div className="px-6 md:px-12 lg:px-16 animate-[fadeIn_0.5s_ease-out]">
            <h2 className="text-2xl font-bold mb-2">Top Searches</h2>
            <div className="mt-6 mb-12">
              <RailRow
                title="" // Title omitted here since we render custom h2 above
                railKey="trending"
                items={trendingItems}
                scrollState={scrollState}
                setTrackRef={setTrackRef}
                onRailScroll={onRailScroll}
                handleRailScroll={handleRailScroll}
                eager
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
            </div>
          </div>
        )}
      </div>

      <Footer />

      {/* Watch Modal */}
      {watchOpen && (
        <Watch
          data={combinedForLookup}
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
          e={props.e}
          play={props.play}
        />
      )}
    </div>
  );
};

export default React.memo(Search);