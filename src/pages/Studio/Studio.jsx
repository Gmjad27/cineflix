import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Studio.module.css';
import Card from '../../components/Card/Card';
import Watch from '../../components/Watch/Watch';
import { fetchTMDBStudioTitles } from '../../content/tmdb';
import Footer from '../../components/Footer/Footer';

const GENRE_FILTERS = ['All', 'Action', 'Sci-Fi', 'Thriller', 'Adventure', 'Drama', 'Animation', 'TV Shows', 'Movies'];

const Studio = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = Array.isArray(props.data) ? props.data : [];
  const [studioData, setStudioData] = useState([]);
  const [studioLoading, setStudioLoading] = useState(false);
  const [watchItem, setWatchItem] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const studioFromQuery = new URLSearchParams(location.search).get('studio_name');
  const studioName = String(studioFromQuery || props.studio || '').trim();

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

  const filteredData = useMemo(() => {
    if (activeFilter === 'All') return studioData;
    if (activeFilter === 'Movies') return studioData.filter(i => i.type === 'movie');
    if (activeFilter === 'TV Shows') return studioData.filter(i => i.type === 'tv');
    // genre filter — match against item.category or item.genres array
    return studioData.filter(i =>
      (i.category || []).some(g => g.toLowerCase().includes(activeFilter.toLowerCase()))
    );
  }, [studioData, activeFilter]);

  const allData = useMemo(() => [...studioData, ...data], [data, studioData]);

  useEffect(() => {
    if (!watchItem && filteredData.length > 0) setWatchItem(filteredData[0]);
  }, [filteredData, watchItem]);

  const featured = filteredData[0] || null;

  // top 10 by vote average
  const top10 = useMemo(() =>
    [...studioData].sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0)).slice(0, 10),
    [studioData]
  );

  const recentlyAdded = useMemo(() =>
    [...studioData].sort((a, b) => {
      const da = new Date(a.releaseDate || a.firstAirDate || 0);
      const db = new Date(b.releaseDate || b.firstAirDate || 0);
      return db - da;
    }).slice(0, 12),
    [studioData]
  );

  const rails = useMemo(() => {
    if (filteredData.length === 0) return [];
    const movies = filteredData.filter(i => i.type === 'movie');
    const tvShows = filteredData.filter(i => i.type === 'tv');
    return [
      { title: 'Movies', items: movies },
      { title: 'TV Shows', items: tvShows },
    ].filter(r => r.items.length > 0);
  }, [filteredData]);

  const openWatch = useCallback((id) => {
    const selected = allData.find(i => i.id === id);
    if (!selected) return;
    setWatchItem(selected);
    const watch = document.querySelector('#watch');
    if (watch) watch.style.display = 'block';
    navigate(`${location.pathname}?studio_name=${encodeURIComponent(studioName)}&watch=${selected.id}`);
  }, [allData, location.pathname, navigate, studioName]);

  const clearWatchFromUrl = () => {
    navigate(`${location.pathname}?studio_name=${encodeURIComponent(studioName)}`);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const watchId = Number(params.get('watch'));
    if (!watchId) return;
    const selected = allData.find(i => i.id === watchId);
    if (!selected) return;
    setWatchItem(selected);
    const watch = document.querySelector('#watch');
    if (watch) watch.style.display = 'block';
  }, [allData, location.search]);

  const renderCard = (item) => (
    <Card
      key={item.id}
      sow={openWatch}
      id={item.id}
      img={item.name}
      name={item.name2}
      ry={item.releaseYear}
      ua={item.ua}
      lan={item.language.length}
      desc={item.desc}
      s={item.season}
      type={item.type}
      tid={item.tmdbId}
      add={props.add}
      e={props.e}
      play={props.play}
    />
  );

  if (props.loading || (studioLoading && filteredData.length === 0)) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner} />
        <p>Loading {studioName || 'Studio'} catalog...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* ── HERO ── */}
      <section
        className={styles.hero}
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.92) 35%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.1)),
            linear-gradient(to top, rgba(0,0,0,0.98) 0%, transparent 35%),
            url(${props.img || featured?.img || ''})
          `,
        }}
      >
      </section>

      {/* ── FILTER BAR ── */}
      <div className={styles.filterBar}>
        {GENRE_FILTERS.map(f => (
          <button
            key={f}
            className={`${styles.filterChip} ${activeFilter === f ? styles.filterChipActive : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredData.length === 0 ? (
        <section className={styles.emptyState}>
          <h2>No titles found.</h2>
          <p>Try a different filter or open another studio from Home.</p>
        </section>
      ) : (
        <div className={styles.rails}>

          {/* ── TOP 10 ── */}
          {top10.length > 0 && activeFilter === 'All' && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.title}>Top 10 This Week</h2>
              </div>
              <div className={styles.top10Row}>
                {top10.map((item, idx) => (
                  <div key={item.id} className={styles.top10Item} onClick={() => openWatch(item.id)}>
                    <img
                      src={item.img}
                      alt={item.name2}
                      className={styles.top10Img}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    <span className={styles.top10Num}>{idx + 1}<p className={styles.top10Name} >{item.name2}</p></span>
                    {/* <p className={styles.top10Name} >{item.name2}</p> */}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── RECENTLY ADDED ── */}
          {recentlyAdded.length > 0 && activeFilter === 'All' && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.title}>Recently Added</h2>
                <span className={styles.titleCount}>· {recentlyAdded.length} titles</span>
              </div>
              <div className={styles.track}>{recentlyAdded.map(renderCard)}</div>
            </section>
          )}

          {/* ── MOVIES / TV RAILS ── */}
          {rails.map(rail => (
            <section className={styles.section} key={rail.title}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.title}>{rail.title}</h2>
                <span className={styles.titleCount}>· {rail.items.length} titles</span>
              </div>
              <div className={styles.track}>{rail.items.map(renderCard)}</div>
            </section>
          ))}

        </div>
      )}

      <Footer />
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
    </div>
  );
};

export default Studio;
