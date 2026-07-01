import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './stream.module.css';

const Stream = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const activeCardRef = useRef(null);
  const queryParams = new URLSearchParams(location.search);

  // Retrieve state passed from Watch.jsx navigate()
  const navState = location.state || {};
  // console.log(navState);
  const title = queryParams.get('title') || navState.name || 'Stream';
  const episodesString = queryParams.get('episodes');

  // BUG FIX 1: JSON.parse on null/invalid strings throws and crashes the
  // whole component (an uncaught exception in render unmounts the tree).
  // Wrap it safely and fall back through props -> empty array.
  const passedEpisodes = useMemo(() => {
    if (!episodesString) return props.episodes || [];
    try {
      const parsed = JSON.parse(episodesString);
      return Array.isArray(parsed) ? parsed : (props.episodes || []);
    } catch (err) {
      console.warn('Stream: failed to parse episodes param, falling back.', err);
      return props.episodes || [];
    }
  }, [episodesString, props.episodes]);

  const defaultImage = queryParams.get('defaultImage') || props.img || '';
  const streamId = queryParams.get('tmdb') || props.tid || '';

  // Parse the incoming stream ID (e.g., "tv/12345/1/1" or "movie/12345")
  const parts = streamId.split('/');
  const streamType = parts[0] ? parts[0].toLowerCase() : '';
  const id = parts[1] || '';

  // State for TV shows
  const [currentSeason, setCurrentSeason] = useState(
    parts[2] ? parseInt(parts[2], 10) : (Number(queryParams.get('currentSeason')) || 1)
  );
  const [currentEpisode, setCurrentEpisode] = useState(
    parts[3] ? parseInt(parts[3], 10) : 1
  );

  // Dynamic Video Source
  const src = useMemo(() => {
    if (!streamType || !id) return '';
    if (streamType === 'tv') {
      return `https://vidnest.fun/tv/${id}/${currentSeason}/${currentEpisode}?color=D52E3C`;
    }
    return `https://vidnest.fun/movie/${id}`;
  }, [streamType, id, currentSeason, currentEpisode]);

  // BUG FIX 2: isLoading was only ever reset inside handleEpisodeChange,
  // so any other source change (e.g. id/season changing via props or a
  // future season switcher) would never show the loader again, and on
  // first mount there was no guarantee the loader cleared if onLoad fired
  // before the listener was effectively attached. Tie it directly to `src`.
  useEffect(() => {
    if (src) setIsLoading(true);
  }, [src]);

  // Handle iframe resize safely, debounced so it doesn't thrash on drag-resize
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);
  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsDesktop(window.innerWidth >= 992), 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // NEW: keep the active episode card visible in the sidebar without
  // forcing the user to scroll manually when switching episodes.
  useEffect(() => {
    if (activeCardRef.current) {
      activeCardRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [currentEpisode]);

  // Update episode and URL without leaving the page
  const handleEpisodeChange = (episodeNum) => {
    if (episodeNum === currentEpisode) return; // BUG FIX 3: avoid redundant navigate/reload on same episode click
    setCurrentEpisode(episodeNum);
  };

  // NEW: simple "next episode" helper, bounded by the episode list length
  const hasNextEpisode = streamType === 'tv' && currentEpisode < passedEpisodes.length;
  const handleNextEpisode = () => {
    if (hasNextEpisode) handleEpisodeChange(currentEpisode + 1);
  };

  return (
    <div className={styles.container}>
      <header className={styles.topBar}>
        <div className={styles.meta}>
          <p className={styles.title}>
            {/* {navState.title ? `${navState.name.toUpperCase()}` : (streamType ? `${streamType.toUpperCase()} STREAM` : 'STREAM')} */}
            {title}
          </p>
          {streamType === 'tv' && (
            <span className={styles.streamTag}>
              Season {currentSeason} | Episode {currentEpisode}
            </span>
          )}
        </div>
      </header>

      {src ? (
        <div className={styles.contentLayout}>
          {/* Main Video Player */}
          <div className={styles.playerWrapper}>
            <div className={styles.playerFrame}>
              {/* {isLoading && (
                <div className={styles.loader}>
                  <div className={styles.spinner}></div>
                  <span>Loading stream...</span>
                </div>
              )} */}
              <iframe id="iframe"
                loading="lazy"
                width="100%"
                height="100%"
                src={src}
                scrolling="no"
                frameborder="0"
                marginwidth="0"
                marginheight="0"
                webkitallowfullscreen="true"
                mozallowfullscreen="true"
                allowfullscreen=""
                data-rocket-lazyload="fitvidscompatible"
                data-lazy-src=""
                data-rocket-lazy-bg-7461e3bc-75dd-4ddd-a0e2-0561dad7cd4c="loaded"
                data-ll-status="loaded"
                class="entered lazyloaded">
              </iframe>

            </div>

            {/* NEW: lightweight next-episode action under the player */}
           
          </div>

          {/* Detailed TV Show Episode Sidebar */}
          {streamType === 'tv' && passedEpisodes.length > 0 && (
            <div className={styles.episodesSidebar}>
              <div className={styles.sidebarHeader}>
                <h3 className={styles.sidebarTitle}>Season {currentSeason}</h3>
                <p className={styles.epCount}>{passedEpisodes.length} Episodes</p>
              </div>

              <div className={styles.episodesList}>
                {passedEpisodes.map((episode, index) => {
                  const epNum = episode.number || index + 1;
                  const isActive = currentEpisode === epNum;

                  return (
                    <div
                      key={episode.id != null ? `ep-${episode.id}` : `ep-idx-${index}`}
                      ref={isActive ? activeCardRef : null}
                      className={`${styles.detailedEpisodeCard} ${isActive ? styles.activeDetailed : ''}`}
                      onClick={() => handleEpisodeChange(epNum)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') handleEpisodeChange(epNum);
                      }}
                    >
                      <div
                        className={styles.epThumb}
                        style={{ backgroundImage: `url('${episode.image || defaultImage}')` }}
                      >
                        {isActive && (
                          <div className={styles.playingOverlay}>
                            <i className="fa-solid fa-play"></i>
                          </div>
                        )}
                      </div>

                      <div className={styles.epInfo}>
                        <h4 className={styles.epTitle}>
                          {epNum}. {episode.name || `Episode ${epNum}`}
                        </h4>
                        {episode.runtime > 0 && <span className={styles.epRuntime}>{episode.runtime}m</span>}
                        <p className={styles.epDesc}>
                          {episode.overview ? episode.overview : 'No description available.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.emptyWrap}>
          <p className={styles.empty}>No stream selected.</p>
          <button type="button" className={styles.goHome} onClick={() => navigate('/')}>
            Browse Home
          </button>
        </div>
      )}
    </div>
  );
};

export default Stream;