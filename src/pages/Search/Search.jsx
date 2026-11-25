import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Watch from '../../components/Watch/Watch';
import { searchTMDBTitles } from '../../content/tmdb';
import Footer from '../../components/Footer/Footer';
import Skeleton from '../../components/Skeleton/Skeleton';
import RailRow from '../../components/RailRow/RailRow';
import { useRailScroll } from '../../hooks/useRailScroll';
import { useNetworkStatus } from '../../context/NetworkContext';

/* ---------- helpers ---------- */
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

/* ---------- main component ---------- */
const Search = (props) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isOnline, isWeak } = useNetworkStatus();

  const urlQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(urlQuery);
  const [remoteResults, setRemoteResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const data = Array.isArray(props.data) ? props.data : [];
  const normalizedQuery = query.trim().toLowerCase();

  const handleSearchChange = (newQuery) => {
    setQuery(newQuery);
    setSearchParams(
      (prev) => {
        if (newQuery) prev.set('q', newQuery);
        else prev.delete('q');
        return prev;
      },
      { replace: true }
    );
  };

  /* ---------- API fetch ---------- */
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
        if (error.name !== 'AbortError') {
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

  /* ---------- local + remote merge ---------- */
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
  const topResults = useMemo(() => rankedResults.slice(0, 12), [rankedResults]);

  /* ---------- pre‑search curated sections ---------- */
  // Popular searches (hardcoded suggestions)
  const popularSearches = [
    'Stranger Things', 'Money Heist', 'Avengers', 'Game of Thrones',
    'Breaking Bad', 'The Witcher', 'Narcos', 'Squid Game',
  ];

  /* ---------- trending rail ---------- */
  const trendingItems = data.slice(0, 20);
  const combinedForLookup = useMemo(() => [...rankedResults, ...data], [data, rankedResults]);

  const railKeys = useMemo(() => {
    const keys = [];
    if (normalizedQuery) keys.push('topResults');
    else keys.push('trending');
    return keys;
  }, [normalizedQuery]);

  const { scrollState, setTrackRef, onRailScroll, handleRailScroll } = useRailScroll(railKeys);

  /* ---------- watch modal ---------- */
  const watchId = searchParams.get('watch');
  const watchItem = useMemo(() => {
    if (!watchId) return null;
    return combinedForLookup.find((item) => String(item.id) === String(watchId));
  }, [watchId, combinedForLookup]);
  const watchOpen = !!watchItem;

  const openWatch = useCallback((id) => {
    const selected = combinedForLookup.find((item) => String(item.id) === String(id));
    if (!selected) return;
    setSearchParams((prev) => {
      prev.set('watch', selected.id);
      if (selected.name2) prev.set('name', selected.name2);
      return prev;
    });
  }, [combinedForLookup, setSearchParams]);

  const clearWatchFromUrl = useCallback(() => {
    setSearchParams((prev) => {
      prev.delete('watch');
      prev.delete('name');
      return prev;
    });
  }, [setSearchParams]);

  /* ---------- card renderer ---------- */
  const renderHotstarCard = useCallback(
    (item) => (

      <Card
        sow={openWatch}
        id={item.id}
        img={item.name}
        name={item.name2}
        type={item.type}
        tid={item.tmdbId}
        play={props.play}
        rating={item.rating}
      />
      // </div>
    ),
    [openWatch, props.add, props.e, props.play]
  );

  /* ---------- loading state ---------- */
  if (props.loading) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white pt-24 px-6 md:px-12 lg:px-16">
        <div className="h-14 glass-mirror rounded-2xl animate-pulse w-full max-w-3xl mb-12 mx-auto" />
        <Skeleton type="search" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070a] text-white font-sans selection:bg-[#E50914] selection:text-white">
      {/* ── Hero Search Section (Glass Mirror Aesthetic) ── */}
      <section className="relative pt-20 pb-12 px-6 md:px-12 lg:px-16 bg-gradient-to-b from-white/[0.04] via-transparent to-transparent border-b border-white/[0.08] overflow-hidden">
        {/* Ambient Red Spotlight */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-[#E50914]/15 blur-[120px] rounded-full" />

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
            {normalizedQuery ? 'Search Results' : 'Discover Your Next Favorite'}
          </h1>

          <div className="relative max-w-2xl mx-auto">
            <div className="glass-mirror rounded-2xl p-1.5 focus-within:border-[#E50914]/80 focus-within:shadow-neon-red transition-all duration-300">
              <div className="relative flex items-center">
                {/* <i className="fa-solid fa-magnifying-glass absolute left-5 text-gray-400 text-lg pointer-events-none" /> */}
                <input
                  type="text"
                  inputMode="search"
                  className="w-full pl-13 pr-12 py-3.5 bg-transparent rounded-xl text-white text-base md:text-lg placeholder-gray-500 focus:outline-none"
                  placeholder="Search movies, TV shows, studios..."
                  value={query}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  autoFocus
                />
                {query && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                    aria-label="Clear search"
                  >
                    <i className="fa-solid fa-xmark text-sm"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Offline / Weak Network Status Badge */}
            {!isOnline ? (
              <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/70 border border-red-500/40 text-[11px] font-semibold text-red-300 shadow-sm">
                <i className="fa-solid fa-wifi-slash text-[10px]" />
                <span>Offline: Showing cached titles only</span>
              </div>
            ) : isWeak ? (
              <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-[11px] font-semibold text-amber-300 shadow-sm">
                <i className="fa-solid fa-gauge-simple-low text-[10px]" />
                <span>Slow connection: Live search may be delayed</span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ── Content Area ── */}
      <div className="max-w-[1400px] mx-auto pt-8 pb-16">
        {normalizedQuery ? (
          /* ═══════════════════════ SEARCH RESULTS ═══════════════════════ */
          <div className="animate-[fadeIn_0.3s_ease-out]">
            {searchLoading && rankedResults.length === 0 ? (
              <div className="mb-12">
                <div className="flex items-center gap-3 px-3 md:px-0 mb-6">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-[#E50914] rounded-full animate-spin" />
                  <span className="text-xs uppercase font-bold tracking-widest text-gray-400">Searching titles...</span>
                </div>
                <Skeleton type="search" />
              </div>
            ) : searchLoading ? (
              <div className="flex justify-center mb-8">
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-full glass-mirror text-[#E50914]">
                  <i className="fa-solid fa-spinner animate-spin text-lg"></i>
                  <span className="font-bold tracking-wider text-sm uppercase">Searching…</span>
                </div>
              </div>
            ) : null}

            {/* Top Results Rail */}
            {topResults.length > 0 && (
              <div className="mb-12">
                <RailRow
                  title="Top Results"
                  railKey="topResults"
                  items={topResults}
                  scrollState={scrollState}
                  setTrackRef={setTrackRef}
                  onRailScroll={onRailScroll}
                  handleRailScroll={handleRailScroll}
                  eager
                  renderItem={renderHotstarCard}
                />
              </div>
            )}

            {/* Movies Grid */}
            {movieResults.length > 0 && (
              <div className="mb-12">
                <RailRow
                  title="Movies"
                  railKey="Movies"
                  items={movieResults}
                  scrollState={scrollState}
                  setTrackRef={setTrackRef}
                  onRailScroll={onRailScroll}
                  handleRailScroll={handleRailScroll}
                  eager
                  renderItem={renderHotstarCard}
                />
              </div>
            )}

            {/* TV Shows Grid */}
            {seriesResults.length > 0 && (
              <div className="mb-12">
                <RailRow
                  title="TV Shows"
                  railKey="TV Shows"
                  items={seriesResults}
                  scrollState={scrollState}
                  setTrackRef={setTrackRef}
                  onRailScroll={onRailScroll}
                  handleRailScroll={handleRailScroll}
                  eager
                  renderItem={renderHotstarCard}
                />
              </div>
            )}

            {/* Empty State */}
            {!searchLoading && rankedResults.length === 0 && (
              <div className="glass-modal max-w-md mx-auto p-8 rounded-3xl text-center border border-white/10 shadow-glass-md my-12">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <i className="fa-regular fa-face-frown text-3xl"></i>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">No matches found</h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
                  {!isOnline
                    ? "You're currently offline. Reconnect to internet to search the full TMDB catalog."
                    : `We couldn't find anything for "${query}". Try a different spelling or browse trending titles.`}
                </p>
                <button
                  onClick={() => handleSearchChange('')}
                  className="glass-btn-secondary px-6 py-2.5 text-sm font-semibold rounded-full cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        ) : (

          <div className="animate-[fadeIn_0.5s_ease-out] space-y-16">

            {/* Popular Searches Tags */}
            <section className="px-6 md:px-12 lg:px-16">
              <h2 className="text-xl md:text-2xl font-bold mb-6 text-white/90">Popular Searches</h2>
              <div className="flex flex-wrap gap-3">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSearchChange(term)}
                    className="px-5 py-2.5 glass-mirror-card rounded-full text-sm font-semibold text-gray-300 hover:text-white hover:border-[#E50914]/80 hover:bg-[#E50914]/15 hover:shadow-neon-red transition-all duration-200 cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </section>

            {/* Trending Rail */}
            <section>
              <RailRow
                title="Trending Now"
                railKey="trending"
                items={trendingItems}
                scrollState={scrollState}
                setTrackRef={setTrackRef}
                onRailScroll={onRailScroll}
                handleRailScroll={handleRailScroll}
                eager
                renderItem={renderHotstarCard}
              />
            </section>
          </div>
        )}
      </div>

      <Footer />

      {/* ── Watch Modal ── */}
      {watchOpen && watchItem && (
        <Watch
          data={combinedForLookup}
          sow={openWatch}
          onClose={clearWatchFromUrl}
          sid={watchItem.id}
          El={Array.isArray(props.e) && props.e.includes(watchItem.id) ? 'ADDED' : '+'}
          img={watchItem.img}
          type={watchItem.type}
          id={watchItem.tmdbId}
          s={watchItem.episodes}
          mname={watchItem.name2}
          name={watchItem.nameImg}
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
          e={props.e}
          play={props.play}
        />
      )}
    </div>
  );
};

export default React.memo(Search);