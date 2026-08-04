import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Watch from '../../components/Watch/Watch';
import { searchTMDBTitles } from '../../content/tmdb';
import Footer from '../../components/Footer/Footer';
import Skeleton from '../../components/Skeleton/Skeleton';
import RailRow from '../../components/RailRow/RailRow';
import { useRailScroll } from '../../hooks/useRailScroll';

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
      <div className="w-[160px] xs:w-[180px] sm:w-[200px] md:w-[220px] flex-shrink-0">
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
      </div>
    ),
    [openWatch, props.add, props.e, props.play]
  );

  /* ---------- loading state ---------- */
  if (props.loading) {
    return (
      <div className="min-h-screen bg-[#141414] text-white pt-24 px-6 md:px-12 lg:px-16">
        <div className="h-14 bg-[#2a2a2a] rounded animate-pulse w-full max-w-3xl mb-12" />
        <Skeleton type="card" count={12} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans selection:bg-[#E50914] selection:text-white">

      {/* ── Hero Search Section (Hotstar‑style) ── */}
      <section className="relative pt-24 pb-12 px-6 md:px-12 lg:px-16 bg-gradient-to-b from-[#1f1f1f] to-[#141414] border-b border-[#2a2a2a]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            {normalizedQuery ? 'Search Results' : 'Discover your next favourite'}
          </h1>
          <p className="text-gray-400 mb-8 text-lg">
            {normalizedQuery
              ? `Showing results for "${query}"`
              : 'Search across thousands of movies, shows, and more'}
          </p>

          <div className="relative max-w-2xl mx-auto">
            <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              inputMode="search"
              className="w-full pl-14 pr-12 py-4 bg-[#2a2a2a]/80 border border-[#404040] hover:border-[#606060] rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20 transition-all shadow-2xl backdrop-blur-sm"
              placeholder="Search your favourite Movies, shows"
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              autoFocus
            />
            {query && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                aria-label="Clear search"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Content Area ── */}
      <div className="max-w-[1400px] mx-auto pt-8 pb-16">
        {normalizedQuery ? (
          /* ═══════════════════════ SEARCH RESULTS ═══════════════════════ */
          <div className="animate-[fadeIn_0.3s_ease-out]">
            {searchLoading && (
              <div className="flex justify-center mb-8">
                <div className="flex items-center gap-3 text-[#E50914]">
                  <i className="fa-solid fa-spinner animate-spin text-xl"></i>
                  <span className="font-semibold tracking-wider uppercase">Searching…</span>
                </div>
              </div>
            )}

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
              <div className="px-6 md:px-12 lg:px-16 mb-12">
                <h3 className="text-xl font-semibold text-gray-300 mb-6 uppercase tracking-wide">
                  Movies
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                  {movieResults.map((item) => (
                    <div key={item.id} className="flex justify-center">
                      {renderHotstarCard(item)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TV Shows Grid */}
            {seriesResults.length > 0 && (
              <div className="px-6 md:px-12 lg:px-16 mb-12">
                <h3 className="text-xl font-semibold text-gray-300 mb-6 uppercase tracking-wide">
                  TV Shows
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                  {seriesResults.map((item) => (
                    <div key={item.id} className="flex justify-center">
                      {renderHotstarCard(item)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!searchLoading && rankedResults.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <i className="fa-regular fa-face-frown text-5xl text-gray-600 mb-6"></i>
                <h3 className="text-2xl font-bold mb-3">No matches found</h3>
                <p className="text-gray-400 text-lg max-w-md">
                  We couldn't find anything for "{query}". Try a different spelling or browse by genre.
                </p>
                <button
                  onClick={() => handleSearchChange('')}
                  className="mt-6 px-6 py-2 border border-gray-600 rounded-full text-gray-300 hover:border-white hover:text-white transition"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ═══════════════════════ EXPLORE (pre‑search) ═══════════════════════ */
          <div className="animate-[fadeIn_0.5s_ease-out] space-y-16">

            {/* Popular Searches Tags */}
            <section className="px-6 md:px-12 lg:px-16">
              <h2 className="text-2xl font-bold mb-6">Popular Searches</h2>
              <div className="flex flex-wrap gap-3">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSearchChange(term)}
                    className="px-5 py-2.5 bg-[#2a2a2a] border border-[#3a3a3a] hover:border-[#E50914] hover:bg-[#3a1a1a]/20 rounded-full text-sm font-medium transition-all duration-200"
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