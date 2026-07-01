import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../../components/Card/Card';
import styles from './search.module.css';
import Watch from '../../components/Watch/Watch';
import { searchTMDBTitles } from '../../content/tmdb';
import Footer from '../../components/Footer/Footer';
import Skeleton from '../../components/Skeleton/Skeleton';

const TRENDING_QUERIES = [
  'Action',
  'Sci-Fi',
  'Thriller',
  'TMDB Movies',
  'TMDB TV',
  'Comedy',
  'Adventure',
];

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

  const navigate = useNavigate();
  const location = useLocation();

  const data = Array.isArray(props.data) ? props.data : [];
  const [watchItem, setWatchItem] = useState(data[0] || null);

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

    // Create an AbortController to cancel in-flight API requests
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        // Pass the controller's signal to your TMDB fetch function
        const results = await searchTMDBTitles(normalizedQuery, { signal: controller.signal });
        if (active) setRemoteResults(results);
      } catch (error) {
        // If the error is just an AbortError, safely ignore it.
        if (error.name === 'AbortError') {
          console.log('Previous search request aborted.');
        } else {
          console.error('TMDB search failed:', error);
          if (active) setRemoteResults([]);
        }
      } finally {
        if (active) setSearchLoading(false);
      }
    }, 500); // 500ms debounce prevents API spam while typing

    return () => {
      active = false;
      clearTimeout(timer); // Clear the timeout if the user types again before 500ms
      controller.abort();  // Cancel the actual network fetch if it's already in progress
    };
  }, [normalizedQuery]);

  // ==========================================
  // Local Filtering
  // ==========================================
  const localResults = useMemo(() => {
    if (!normalizedQuery) return [];

    return data.map((item) => ({ item, score: scoreItem(item, normalizedQuery) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || b.item.releaseYear - a.item.releaseYear)
      .map((entry) => entry.item);
  }, [data, normalizedQuery]);

  const rankedResults = remoteResults.length > 0 ? remoteResults : localResults;
  const movieResults = rankedResults.filter((item) => item.type === 'movie');
  const seriesResults = rankedResults.filter((item) => item.type === 'tv');
  const trendingItems = data.slice(0, 20);
  const combinedForLookup = useMemo(() => [...rankedResults, ...data], [data, rankedResults]);

  // ==========================================
  // Modal / Watch Logic
  // ==========================================
  const openWatch = (id) => {
    const selected = combinedForLookup.find((item) => item.id === id);
    if (!selected) return;

    setWatchItem(selected);
    const watch = document.querySelector('#watch');
    if (watch) watch.style.display = 'block';
    navigate(`${location.pathname}?watch=${selected.id}&name=${encodeURIComponent(selected.name2)}`);
  };

  const clearWatchFromUrl = () => {
    navigate(location.pathname);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const watchId = Number(params.get('watch'));
    if (!watchId) return;

    const selected = combinedForLookup.find((item) => item.id === watchId);
    if (!selected) return;

    setWatchItem(selected);
    const watch = document.querySelector('#watch');
    if (watch) watch.style.display = 'block';
  }, [combinedForLookup, location.search]);

  // ==========================================
  // UI Rendering
  // ==========================================
  const renderRow = (items) => (
    <div className={styles.rowTrack}>
      {items.map((item) => (
        <Card
          key={item.id}
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
        />
      ))}
    </div>
  );

  if (props.loading) {
    return <Skeleton type="card" count={12} />;
  }

  return (
    <div className={styles.con}>
      <div className={styles.extra}></div>
      <div className={styles.shell}>
        <div className={styles.searchHeader}>
          <div className={styles.searchWrap}>
            <i className={`fa-solid fa-magnifying-glass ${styles.icon}`}></i>
            <input
              type="text"
              className={styles.search}
              placeholder="Search TMDB titles, genres, language"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          {/* {!normalizedQuery && (
            <div className={styles.tags}>
              {TRENDING_QUERIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={styles.tag}
                  onClick={() => setQuery(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          )} */}
        </div>

        {normalizedQuery ? (
          <>
            <p className={styles.meta}>
              {rankedResults.length} result{rankedResults.length === 1 ? '' : 's'} for "{query}"
            </p>
            {searchLoading && <p className={styles.meta}>Searching TMDB...</p>}

            {movieResults.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.title}>Movies</h2>
                {renderRow(movieResults)}
              </section>
            )}

            {seriesResults.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.title}>Series</h2>
                {renderRow(seriesResults)}
              </section>
            )}

            {rankedResults.length === 0 && !searchLoading && (
              <div className={styles.empty}>
                <h3>No matches found</h3>
                <p>Try a different title, genre, language, or studio.</p>
              </div>
            )}
          </>
        ) : (
          <section className={styles.section}>
            <h2 className={styles.title}>Trending Now</h2>
            {renderRow(trendingItems)}
          </section>
        )}
      </div>

      <Footer />

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
    </div>
  );
};

export default Search;
