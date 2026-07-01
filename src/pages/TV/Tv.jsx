import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Tv.module.css';
import Card from '../../components/Card/Card';
import Watch from '../../components/Watch/Watch';
import { fetchTMDBTVSections } from '../../content/tmdb';
import Footer from '../../components/Footer/Footer';

const Tv = (props) => {
  const [watchItem, setWatchItem] = useState(null);
  const media = window.matchMedia('(max-width: 768px)');
  const navigate = useNavigate();
  const location = useLocation();
  const data = Array.isArray(props.data) ? props.data : [];
  const series = useMemo(() => data.filter((item) => item.type === 'tv'), [data]);
  const [pageSections, setPageSections] = useState({ heroBanner: [], rails: [] });
  const [sectionsLoading, setSectionsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSections = async () => {
      setSectionsLoading(true);
      try {
        const sections = await fetchTMDBTVSections();
        if (active) setPageSections(sections);
      } catch {
        if (active) setPageSections({ heroBanner: [], rails: [] });
      } finally {
        if (active) setSectionsLoading(false);
      }
    };

    loadSections();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!watchItem && series.length > 0) setWatchItem(series[0]);
  }, [series, watchItem]);

  const featured = useMemo(() => {
    if (Array.isArray(pageSections.heroBanner) && pageSections.heroBanner.length > 0) {
      return pageSections.heroBanner[0];
    }
    if (series.length === 0) return null;
    return [...series].sort((a, b) => b.releaseYear - a.releaseYear)[0];
  }, [pageSections.heroBanner, series]);

  const sections = useMemo(
    () =>
      Array.isArray(pageSections.rails) && pageSections.rails.length > 0
        ? pageSections.rails
        : [
          { title: 'Trending Now', items: series.slice(0, 20) },
          { title: 'Popular Shows', items: series.slice(20, 40) },
          { title: 'New Episodes', items: series.slice(40, 60) },
        ],
    [pageSections.rails, series]
  );

  const allItems = useMemo(
    () => [...series, ...(pageSections.heroBanner || []), ...sections.flatMap((section) => section.items || [])],
    [pageSections.heroBanner, sections, series]
  );

  const openWatch = (id) => {
    const selected = allItems.find((item) => item.id === id);
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

    const selected = allItems.find((item) => item.id === watchId);
    if (!selected) return;

    setWatchItem(selected);
    const watch = document.querySelector('#watch');
    if (watch) watch.style.display = 'block';
  }, [allItems, location.search]);

  const playFeatured = () => {
    if (!featured) return;
    const streamId = `${featured.type}/${featured.tmdbId}/1/1`;
    props.play(streamId);
    navigate('/stream');
  };

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

  if (props.loading || (sectionsLoading && sections.length === 0)) {
    return <div className={styles.page}>Loading TMDB series...</div>;
  }

  return (
    <div className={styles.page}>
      {featured && (
        <div className={styles.heroBannerWrap}>
          <section className={styles.heroBanner}>
            <div className={styles.heroBg} style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.88), rgba(0,0,0,0.25)), url(${media.matches ? featured.name : featured.img})` }}></div>
            <div className={styles.heroContent}>
              <p className={styles.badge}>TV SHOW</p>
              <h1 className={styles.heroTitle}>{featured.name2}</h1>

              <p className={styles.desc}>{featured.desc}</p>
              <div className={styles.actions}>
                <button type="button" className={styles.btnWatch} onClick={playFeatured}>
                  <i className="fa-solid fa-play"></i> Play
                </button>
                <button
                  type="button"
                  className={styles.btnWatch + ' ' + styles.more}
                  onClick={() => openWatch(featured.id)}
                >
                  More Info
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      <div className={styles.rails}>
        {sections.map((section) => (
          <section key={section.title} className={styles.section}>
            <h2 className={styles.title}>{section.title}</h2>
            <div className={styles.track}>{section.items.map(renderCard)}</div>
          </section>
        ))}
      </div>

      <Footer />

      <Watch
        data={allItems}
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

export default Tv;
