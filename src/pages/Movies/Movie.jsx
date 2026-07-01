import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './movie.module.css';
import Card from '../../components/Card/Card';
import Watch from '../../components/Watch/Watch';
import Skeleton from '../../components/Skeleton/Skeleton';
import Footer from '../../components/Footer/Footer';
import { fetchTMDBMovieSections } from '../../content/tmdb.js';

const Movie = (props) => {
  const navigate = useNavigate();
  const media = window.matchMedia('(max-width: 768px)');
  const location = useLocation();
  const data = Array.isArray(props.data) ? props.data : [];
  const movies = useMemo(() => data.filter((item) => item.type === 'movie'), [data]);
  const [pageSections, setPageSections] = useState({ heroBanner: [], rails: [] });
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [watchItem, setWatchItem] = useState(null);
  const [isWatchOpen, setIsWatchOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadSections = async () => {
      setSectionsLoading(true);
      try {
        const sections = await fetchTMDBMovieSections();
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

  const featured = useMemo(() => {
    if (Array.isArray(pageSections.heroBanner) && pageSections.heroBanner.length > 0) {
      return pageSections.heroBanner[0];
    }
    if (movies.length === 0) return null;
    return [...movies].sort((a, b) => b.releaseYear - a.releaseYear)[0];
  }, [movies, pageSections.heroBanner]);

  const sections = useMemo(
    () =>
      Array.isArray(pageSections.rails) && pageSections.rails.length > 0
        ? pageSections.rails
        : [
          { title: 'Trending Now', items: movies.slice(0, 20) },
          { title: 'Popular Movies', items: movies.slice(20, 40) },
          { title: 'Top Rated', items: movies.slice(40, 60) },
          { title: 'Action Movies', items: movies.filter((item) => item.category.includes('Action')) },
          { title: 'Comedy Movies', items: movies.filter((item) => item.category.includes('Comedy')) },
        ],
    [movies, pageSections.rails]
  );

  const allItems = useMemo(
    () => [...movies, ...(pageSections.heroBanner || []), ...sections.flatMap((section) => section.items || [])],
    [movies, pageSections.heroBanner, sections]
  );

  const openWatch = (id) => {
    const selected = allItems.find((item) => item.id === id);
    if (!selected) return;

    setWatchItem(selected);
    setIsWatchOpen(true);
    navigate(`${location.pathname}?watch=${selected.id}&name=${encodeURIComponent(selected.name2)}`);
  };

  const clearWatchFromUrl = () => {
    setIsWatchOpen(false);
    setWatchItem(null);
    navigate(location.pathname);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const watchId = Number(params.get('watch'));
    if (!watchId) {
      setIsWatchOpen(false);
      return;
    }

    const selected = allItems.find((item) => item.id === watchId);
    if (!selected) return;

    setWatchItem(selected);
    setIsWatchOpen(true);
  }, [allItems, location.search]);

  const playFeatured = () => {
    if (!featured) return;
    const streamId = `${featured.type}/${featured.tmdbId}`;
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

  if (props.loading) {
    return (
      <div className="homePage" id="homepage">
        <Skeleton type="banner" />
        <div className="homeShell">
          {[1, 2, 3, 4, 5].map((section) => (
            <Skeleton key={section} type="section" count={10} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {featured && (
        <div className={styles.featured}>

          <section
            className={styles.hero}
            style={{
              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.88), rgba(0,0,0,0.25)), url(${media.matches ? featured.name : featured.img})`,
            }}
          >
            <div className={styles.heroContent}>
              <p className={styles.badge}>FEATURED MOVIE</p>
              <h1 className={styles.title}>{featured.name2}</h1>

              <p className={styles.desc}>{featured.desc}</p>
              <div className={styles.actions}>
                <button type="button" className={styles.btnWatch} onClick={playFeatured}>
                  <i className="fa-solid fa-play"></i> Play
                </button>
                <button
                  type="button"
                  className={styles.btnMore}
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

      {isWatchOpen && watchItem && (
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
      )}
    </div>
  );
};

export default Movie;
