import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Watch.module.css';
import Card from '../../components/Card/Card';
import { fetchTMDBDetails, fetchTMDBSeasonDetails } from '../../content/tmdb.js';

const getSeasonNumber = (seasonKey) => {
  const parsed = Number(String(seasonKey).replace('s', ''));
  return Number.isNaN(parsed) || parsed <= 0 ? 1 : parsed;
};

const formatRuntime = (minutes) => {
  const totalMinutes = Number(minutes) || 0;
  if (!totalMinutes) return '';
  return `${totalMinutes}m`;
};

const Watch = (props) => {
  const navigate = useNavigate();
  // const navigate = useNavigate();
  const location = useLocation(); // Initialize useLocation

  // Extract id and type from location.state (Method 1) or URL Search Params (Method 2)
  const queryParams = new URLSearchParams(location.search);
  const id = location.state?.id || queryParams.get('id');
  const type = location.state?.type || queryParams.get('type');
  // console.log(fetchTMDBDetails,);
  const data = Array.isArray(props.data) ? props.data : [];
  const media = window.matchMedia('(max-width: 768px)');
  const [details, setDetails] = useState(null);
  const [seasonDetails, setSeasonDetails] = useState(null);
  const [activeLang, setActiveLang] = useState(null);

  const effectiveEpisodes = details?.episodes || props.s || {};
  const seasonKeys = Object.keys(effectiveEpisodes);
  const effectiveSeasonKeys = type === 'tv' && seasonKeys.length === 0 ? ['s1'] : seasonKeys;
  const [ep, setEp] = useState(seasonKeys[0] || 's1');

  // Load Main Details
  useEffect(() => {
    let active = true;
    const loadDetails = async () => {
      if (!type || !id) {
        if (active) setDetails(null);
        return;
      }
      try {
        const payload = await fetchTMDBDetails(type, id);
        if (active) setDetails(payload);
      } catch {
        if (active) setDetails(null);
      }
    };
    loadDetails();
    return () => { active = false; };
  }, [id, type]);

  // Set default active language when languages load
  useEffect(() => {
    const langs = details?.languages?.length ? details.languages : props.language;
    if (langs?.length && !activeLang) {
      setActiveLang(langs[0]);
    }
  }, [details, props.language]);
  console.log(details);

  // Reset Season Selection on Title Change
  useEffect(() => {
    setEp(effectiveSeasonKeys[0] || 's1');
  }, [props.mname, effectiveSeasonKeys.join(',')]);

  // Load Season Details (Episodes)
  useEffect(() => {
    let active = true;
    const loadSeasonDetails = async () => {
      if (type !== 'tv' || !id) {
        if (active) setSeasonDetails(null);
        return;
      }
      try {
        const payload = await fetchTMDBSeasonDetails(id, getSeasonNumber(ep));
        if (active) setSeasonDetails(payload);
      } catch {
        if (active) setSeasonDetails(null);
      }
    };
    loadSeasonDetails();
    return () => { active = false; };
  }, [ep, id, type]);

  const closeWatch = () => {
    setEp(effectiveSeasonKeys[0] || 's1');
    const watch = document.getElementById('watch');
    if (watch) watch.style.display = 'none';
    if (typeof props.onClose === 'function') props.onClose();
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeWatch();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const selectedSeason = getSeasonNumber(ep);
  const episodeCount = effectiveEpisodes?.[ep] || (props.type === 'tv' ? 10 : 0);
  const shownDesc = details?.desc || props.desc;

  const episodeCards = useMemo(() => {
    if (Array.isArray(seasonDetails?.episodes) && seasonDetails.episodes.length > 0) {
      return seasonDetails.episodes;
    }
    return Array.from({ length: episodeCount }).map((_, index) => ({
      id: `${selectedSeason}-${index + 1}`,
      number: index + 1,
      name: `Episode ${index + 1}`,
      overview: shownDesc || 'Episode details are not available yet.',
      image: props.img,
      runtime: 0,
      airDate: '',
    }));
  }, [episodeCount, props.img, seasonDetails, selectedSeason, shownDesc]);

  const handlePlayNow = () => {
    const streamId = type === 'movie' ? `${type}/${id}` : `${type}/${id}/1/1`;
    props.play(streamId);
    const queryData = {
      title: props.mname,
      type: type,
      tmdbId: id,
      currentSeason: selectedSeason,
      defaultImage: props.img,
      episodes: JSON.stringify(episodeCards)
    };
    const queryString = new URLSearchParams(queryData).toString();
    navigate(`/stream?name=${props.mname}&tmdb=${streamId}&${queryString}`);
  };

  const onSelectSeason = (event) => {
    setEp(event.target.value);
  };

  const seasonLabel = props.type === 'tv'
    ? details?.seasonLabel || `${effectiveSeasonKeys.length} Season${effectiveSeasonKeys.length > 1 ? 's' : ''}`
    : details?.seasonLabel || props.season;

  const year = details?.year;
  const mbg = details?.mbg;
  const logo = details?.nameImg2;
  const trailer = details?.trailerUrl;
  const shownCategories = details?.categories?.length ? details.categories : props.cat;
  const shownLanguages = details?.languages?.length ? details.languages : props.language;
  const shownLanguageCount = shownLanguages?.length || props.lan || 0;
  const shownAgeRating = details?.ageRating || props.ua || 'UA 13+';

  // Right-column meta: cast, genres, mood
  const cast = details?.cast || [];
  const mood = details?.mood || [];

  const related = useMemo(() => {
    const mainCategory = props.cat?.[0];
    if (!mainCategory) return [];
    return data
      .filter((item) =>
        item.name2 !== props.mname &&
        Array.isArray(item.category) &&
        item.category.includes(mainCategory)
      )
      .slice(0, 18);
  }, [data, props.cat, props.mname]);

  const renderMoreLikeThis = () => (
    <section className={styles.relatedSection}>
      <h2 className={styles.relatedTitle}>More Like This</h2>
      <div className={styles.relatedTrack}>
        {related.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              if (typeof props.sow === 'function') props.sow(item.id);
            }}
          >
            <Card
              sow={props?.sow || (() => { })}
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
              add={(value) => props.add(value)}
              e={props.e}
              play={(tid) => props.play(tid)}
            />
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className={styles.con} id="watch">
      <div className={styles.cl} onClick={closeWatch}></div>
      <button type="button" className={styles.close} onClick={closeWatch} aria-label="Close Modal">
        <i className="fa-solid fa-xmark"></i>
      </button>

      <div className={styles.watch}>
        {/* ── Hero Banner ── */}
        <div
          className={styles.sec1}
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.25) 30%, #141414 100%), url('${media.matches ? props.name2 : props.img}')`
          }}
        >
          <div className={styles.psec}>
            {logo
              ? <img src={logo} alt={props.mname} className={styles.name} />
              : <h1 className={styles.title}>{props.mname}</h1>
            }

            <div className={styles.btns}>
              <button className={styles.play} onClick={handlePlayNow}>
                <i className="fa-solid fa-play"></i>
                {props.type === 'movie' ? 'Play' : 'Play S1:E1'}
              </button>
              <button
                className={styles.add}
                style={{
                  borderColor: props.El === 'ADDED' ? '#ffffff' : 'rgba(255,255,255,0.7)',
                  backgroundColor: props.El === 'ADDED' ? 'rgba(255,255,255,0.1)' : 'transparent',
                }}
                onClick={() => props.add(props.sid)}
                aria-label={props.El === 'ADDED' ? 'Added to list' : 'Add to list'}
              >
                {props.El === 'ADDED' ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-plus"></i>}
              </button>
              <button className={styles.thumbBtn} aria-label="Rate">
                <i className="fa-regular fa-thumbs-up"></i>
              </button>
            </div>
          </div>
        </div>

        {/* ── Two-Column Body ── */}
        <div className={styles.body}>
          {/* Left Column */}
          <div className={styles.leftCol}>
            <div className={styles.metaRow}>
              <span className={styles.match}>{(parseFloat((props.rating || 0) / 10) * 100).toFixed(0)}% match</span>
              <span className={styles.metaText}>{props.yr || year}</span>
              {details?.runtime && <span className={styles.metaText}>{formatRuntime(details.runtime)}</span>}
              <span className={styles.hdBadge}>HD</span>
            </div>

            <div className={styles.tagRow}>
              <span className={styles.ratingBadge}>{shownAgeRating}</span>
              {shownCategories?.slice(0, 1).map((tag) => (
                <span key={tag} className={styles.tagText}>{tag}</span>
              ))}
            </div>

            <p className={styles.desc}>
              {shownDesc?.length > 180 ? `${shownDesc.substring(0, 180)}...` : shownDesc}
            </p>

            {/* Language strip */}
            {shownLanguages?.length > 0 && (
              <div className={styles.langStrip}>
                {shownLanguages.map((lang) => (
                  <span
                    key={lang}
                    className={`${styles.langItem} ${activeLang === lang ? styles.langActive : ''}`}
                    onClick={() => setActiveLang(lang)}
                  >
                    {lang}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className={styles.rightCol}>
            {cast.length > 0 && (
              <div className={styles.metaBlock}>
                <span className={styles.metaLabel}>Cast: </span>
                <span className={styles.metaValue}>
                  {cast.slice(0, 4).join(', ')}{cast.length > 4 ? '...' : ''}
                </span>
              </div>
            )}

            {shownCategories?.length > 0 && (
              <div className={styles.metaBlock}>
                <span className={styles.metaLabel}>Genres: </span>
                <span className={styles.metaValue}>{shownCategories.join(', ')}</span>
              </div>
            )}

            {mood.length > 0 && (
              <div className={styles.metaBlock}>
                <span className={styles.metaLabel}>This {props.type === 'movie' ? 'Movie' : 'Show'} is: </span>
                <span className={styles.metaValue}>{mood.join(', ')}</span>
              </div>
            )}

            {props.type === 'tv' && (
              <div className={styles.metaBlock}>
                <span className={styles.metaLabel}>Seasons: </span>
                <span className={styles.metaValue}>{seasonLabel}</span>
              </div>
            )}

            <div className={styles.metaBlock}>
              <span className={styles.metaLabel}>Languages: </span>
              <span className={styles.metaValue}>{shownLanguageCount}</span>
            </div>
          </div>
        </div>

        {/* ── Episodes Section ── */}
        <div className={styles.con2}>
          {props.type === 'tv' && effectiveSeasonKeys.length > 0 && (
            <>
              <div className={styles.episodeHead}>
                <h3 className={styles.episodeTitle}>Episodes</h3>
                <select value={ep} onChange={onSelectSeason} className={styles.select}>
                  {effectiveSeasonKeys.map((key, index) => (
                    <option className={styles.option} key={key} value={key}>
                      SEASON {index + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.episods}>
                {episodeCards.map((episode, index) => (
                  episode.runtime ? (
                    <div
                      className={styles.epi}
                      key={episode.id || index}
                      onClick={() => {
                        const episodeNumber = episode.number || index + 1;
                        const streamId = `${props.type}/${props.id}/${selectedSeason}/${episodeNumber}`;
                        props.play(streamId);
                        const queryData = {
                          title: props.mname,
                          type: props.type,
                          tmdbId: props.id,
                          currentSeason: selectedSeason,
                          defaultImage: props.img,
                          episodes: JSON.stringify(episodeCards)
                        };
                        const queryString = new URLSearchParams(queryData).toString();
                        navigate(`/stream?name=${props.mname}&tmdb=${streamId}&${queryString}`);
                      }}
                    >
                      <div
                        className={styles.epiBanner}
                        style={{ backgroundImage: `url('${episode.image || props.img}')` }}
                      ></div>
                      <div className={styles.epiBody}>
                        <div className={styles.epiTop}>
                          <div className={styles.epiName}>{index + 1}. {episode.name || `Episode ${index + 1}`}</div>
                          {episode.runtime && <p className={styles.epiRuntime}>{formatRuntime(episode.runtime)}</p>}
                        </div>
                        <p className={styles.epiDesc}>{episode.overview || 'Coming soon.'}</p>
                      </div>
                    </div>
                  ) : null
                ))}
              </div>
            </>
          )}

          {renderMoreLikeThis()}

          {trailer && (
            <div style={{ marginTop: '48px', borderRadius: '12px', overflow: 'hidden' }}>
              <iframe
                width="100%"
                height="515"
                src={`https://www.youtube.com/embed/${trailer}?loop=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Watch;