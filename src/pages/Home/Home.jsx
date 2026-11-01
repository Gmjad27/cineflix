import React, { useEffect, useMemo, useState, useCallback, lazy, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Watch from '../../components/Watch/Watch';
import RailRow from '../../components/RailRow/RailRow.jsx';
import { useRailScroll } from '../../hooks/useRailScroll';
import PrivacyPolicyPopup, { PRIVACY_POLICY_STORAGE_KEY } from '../../components/PrivacyPolicyPopup/PrivacyPolicyPopup.jsx';
import HeroBanner from '../../components/HeroBanner/HeroBanner.jsx';
import { fetchTMDBDetails } from '../../content/tmdb.js';
import Skeleton from '../../components/Skeleton/Skeleton';
import { STUDIO_COLLECTIONS } from '../../content/studios.js';
import { getContinueWatching, removeContinueWatching } from '../../utils/continueWatching';

const Card = lazy(() => import('../../components/Card/Card'));
const Card2 = lazy(() => import('../../components/Card/Card2'));
const Footer = lazy(() => import('../../components/Footer/Footer'));

const HERO_ROTATE_MS = 8000;

function Home(props) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const data = Array.isArray(props.data) ? props.data : [];
  const homeSections = props.homeSections || { heroBanner: [], rails: [] };
  const heroData = Array.isArray(homeSections.heroBanner) ? homeSections.heroBanner : [];

  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  const [continueWatching, setContinueWatching] = useState(() => getContinueWatching());
  const [privacyPopupOpen, setPrivacyPopupOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(PRIVACY_POLICY_STORAGE_KEY) !== 'true';
  });

  // Sync Continue Watching on window focus
  useEffect(() => {
    const refreshContinueWatching = () => setContinueWatching(getContinueWatching());
    refreshContinueWatching();
    window.addEventListener('focus', refreshContinueWatching);
    return () => window.removeEventListener('focus', refreshContinueWatching);
  }, []);

  const mediaData = useMemo(
    () => (heroData.length > 0 ? heroData.slice(0, 6) : data.slice(0, 6)),
    [data, heroData]
  );

  const currentHero = mediaData[heroIndex % Math.max(mediaData.length, 1)] || null;

  // ==========================================
  // Async Fallback URL State Management
  // ==========================================
  const watchId = searchParams.get('watch');
  const [fetchedWatchItem, setFetchedWatchItem] = useState(null);
  const [isWatchLoading, setIsWatchLoading] = useState(false);

  const localWatchItem = useMemo(() => {
    if (!watchId) return null;
    return [...mediaData, ...data].find((item) => String(item.id) === String(watchId));
  }, [watchId, mediaData, data]);

  useEffect(() => {
    if (!watchId || localWatchItem) {
      setFetchedWatchItem(null);
      return;
    }

    let isMounted = true;
    const fetchWatchItem = async () => {
      setIsWatchLoading(true);
      try {
        const [mediaType, tmdbId] = watchId.split('_');
        if (!mediaType || !tmdbId) throw new Error('Invalid watch ID format');

        const details = await fetchTMDBDetails(mediaType, tmdbId);
        if (!details || !isMounted) return;

        setFetchedWatchItem({
          id: watchId,
          tmdbId: Number(tmdbId),
          type: mediaType,
          img: details.mbg,
          name: details.mbg,
          name2: details.title,
          nameImg2: details.nameImg2,
          releaseYear: details.year || new Date().getFullYear(),
          ua: details.ageRating,
          season: details.seasonLabel,
          desc: details.desc,
          category: details.categories,
          language: details.languages,
          episodes: details.episodes,
          rating: 0,
        });
      } catch (error) {
        console.error('Failed to fetch direct watch item:', error);
        if (isMounted) setFetchedWatchItem(null);
      } finally {
        if (isMounted) setIsWatchLoading(false);
      }
    };

    fetchWatchItem();
    return () => {
      isMounted = false;
    };
  }, [watchId, localWatchItem]);

  const watchItem = localWatchItem || fetchedWatchItem;
  const watchOpen = Boolean(watchItem);

  // Auto-rotate Hero Banner (Pauses when user hovers or when Watch Modal is open)
  useEffect(() => {
    if (mediaData.length < 2 || isHeroPaused || watchOpen) return undefined;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % mediaData.length);
    }, HERO_ROTATE_MS);
    return () => clearInterval(interval);
  }, [mediaData.length, isHeroPaused, watchOpen]);

  // Preload next hero backdrop image
  useEffect(() => {
    if (mediaData.length < 2) return;
    const next = mediaData[(heroIndex + 1) % mediaData.length];
    if (!next) return;
    [next.img, next.name, next.nameImg2].filter(Boolean).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [heroIndex, mediaData]);

  const openWatch = useCallback(
    (id, name2) => {
      if (!id) return;
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('watch', id);
      if (name2) nextParams.set('name', name2);
      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams]
  );

  const clearWatchFromUrl = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('watch');
    nextParams.delete('name');
    setSearchParams(nextParams);
    setFetchedWatchItem(null);
  }, [searchParams, setSearchParams]);

  // ==========================================
  // Continue Watching Handlers
  // ==========================================
  const resumeContinueWatching = useCallback(
    (item) => {
      if (!item?.streamId) {
        openWatch(`${item.type}_${item.tmdbId}`);
        return;
      }
      if (typeof props.play === 'function') {
        props.play(item.streamId);
      }
      const streamPath =
        item.type === 'tv'
          ? `${item.tmdbId}/${item.season || 1}/${item.episode || 1}`
          : item.streamId;
      navigate(`/streaming/${streamPath}`);
    },
    [navigate, props, openWatch]
  );

  const handleRemoveContinueWatching = useCallback((e, streamId) => {
    e.stopPropagation();
    if (typeof removeContinueWatching === 'function') {
      removeContinueWatching(streamId);
    }
    setContinueWatching((prev) => prev.filter((item) => item.streamId !== streamId));
  }, []);

  // ==========================================
  // Rails & Studios Data
  // ==========================================
  const rails = useMemo(
    () =>
      Array.isArray(homeSections.rails) && homeSections.rails.length > 0
        ? homeSections.rails
        : [
          { title: 'TOP 10', items: data.slice(0, 10) },
          { title: 'Popular Movies', items: data.filter((item) => item.type === 'movie').slice(0, 20) },
          { title: 'Popular Shows', items: data.filter((item) => item.type === 'tv').slice(0, 20) },
          { title: 'Top Rated', items: data.filter((item) => item.type === 'movie').slice(20, 40) },
          { title: 'Action Thrillers', items: data.filter((item) => item.category?.includes('Action')).slice(0, 20) },
          { title: 'Comedies', items: data.filter((item) => item.category?.includes('Comedy')).slice(0, 20) },
          { title: 'New Releases', items: data.filter((item) => item.type === 'tv').slice(20, 40) },
        ],
    [data, homeSections.rails]
  );

  const railKeys = useMemo(
    () => [
      ...(continueWatching.length ? ['continue-watching'] : []),
      'Studio',
      ...rails.map((rail, index) => `${rail.title}-${index}`),
    ],
    [rails, continueWatching.length]
  );

  const { scrollState, setTrackRef, onRailScroll, handleRailScroll } = useRailScroll(railKeys);

  const studios = useMemo(
    () =>
      STUDIO_COLLECTIONS.map((studio) => ({
        color: studio.color,
        studio: studio.label,
        img: studio.img,
        bg: studio.bg,
        himg: studio.img,
      })),
    []
  );

  if (props.loading) {
    return (
      <div className="min-h-screen bg-[#141414] text-white" id="homepage">
        <Skeleton type="banner" />
        <div className="px-4 sm:px-8 md:px-12 lg:px-16 -mt-12 relative z-20 space-y-8">
          {[1, 2, 3, 4, 5].map((section) => (
            <Skeleton key={section} type="section" count={10} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#141414] text-white overflow-x-hidden selection:bg-[#E50914] selection:text-white" id="homepage">
      <PrivacyPolicyPopup open={privacyPopupOpen} onClose={() => setPrivacyPopupOpen(false)} />

      {/* ===== HERO BILLBOARD (Full-Bleed Top) ===== */}
      <div
        onMouseEnter={() => setIsHeroPaused(true)}
        onMouseLeave={() => setIsHeroPaused(false)}
      >
        <HeroBanner
          mediaData={mediaData}
          currentHero={currentHero}
          heroIndex={heroIndex}
          setHeroIndex={setHeroIndex}
          openWatch={openWatch}
        />
      </div>

      {/* ===== NETFLIX OVERLAPPING RAIL STACK ===== */}
      <div className="relative z-20 -mt-[-10px] sm:-mt-16 md:-mt-28 lg:-mt-36 px-4 sm:px-8 md:px-12 lg:px-16 space-y-8 md:space-y-11 pb-16">
        <Suspense fallback={<Skeleton type="section" count={10} />}>

          {/* 1. Continue Watching Rail */}
          {continueWatching.length > 0 && (
            <RailRow
              titleAlt="Continue Watching for You"
              railKey="continue-watching"
              items={continueWatching}
              scrollState={scrollState}
              setTrackRef={setTrackRef}
              onRailScroll={onRailScroll}
              handleRailScroll={handleRailScroll}
              view="hidden"
              eager
              renderItem={(item) => {
                const progressPercent = Math.min(100, Math.max(12, Number(item.progress) || 65));

                return (
                  <div className="flex-shrink-0 group">
                    <div
                      onClick={() => openWatch(`${item.type}_${item.tmdbId}`, item.title)}
                      title={`Resume ${item.title}`}
                      className="relative w-[200px] sm:w-68 md:w-76 lg:w-80 rounded-[4px] overflow-hidden cursor-pointer bg-[#181818] shadow-md transition-all duration-300 ease-out sm:hover:scale-[1.04] sm:hover:z-30 sm:hover:shadow-2xl ring-1 ring-white/5"
                    >
                      {/* Thumbnail Container */}
                      <div className="relative aspect-video w-full overflow-hidden bg-[#202020]">
                        <img
                          src={item.image || 'https://via.placeholder.com/640x360.png?text=Resume'}
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                          draggable="false"
                          className="block w-full h-full object-cover transition-transform duration-500 ease-out sm:group-hover:scale-105"
                        />

                        {/* Dark Vignette */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#181818] via-black/20 to-transparent opacity-90" />

                        {/* Remove ("X") Button - Top Right */}
                        <button
                          type="button"
                          onClick={(e) => handleRemoveContinueWatching(e, item.streamId)}
                          title="Remove from Continue Watching"
                          aria-label={`Remove ${item.title} from Continue Watching`}
                          className="absolute top-2.5 right-2.5 z-30 w-7 h-7 md:w-8 md:h-8 rounded-full bg-black/75  text-white/80 hover:text-white flex items-center justify-center border border-white/20 hover:border-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                        >
                          <i className="fa-solid fa-xmark text-xs md:text-sm" />
                        </button>

            

                        {/* Episode Badge on Backdrop (Bottom Left) */}
                        {item.type === 'tv' && (
                          <span className="absolute bottom-3 left-3 z-20 text-[11px] md:text-xs font-bold tracking-wide text-white bg-black/65 px-2 py-0.5 rounded backdrop-blur-xs">
                            S{item.season || 1}:E{item.episode || 1}
                          </span>
                        )}

                        {/* Netflix Red Progress Bar */}
                        <div className="absolute bottom-0 inset-x-0 h-[3px] md:h-1 bg-white/25 z-20">
                          <div
                            className="h-full bg-[#E50914]"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Bottom Control Bar (Title + More Info Trigger) */}
                      <div className="flex items-center justify-between px-3 py-2.5 bg-[#181818] text-white">
                        <div className="min-w-0 pr-2">
                          <h4 className="text-xs sm:text-sm font-bold text-gray-100 truncate">
                            {item.title}
                          </h4>
                        </div>

                      
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          )}

          {/* 2. Studios Collection Rail */}
          <RailRow
            railKey="Studio"
            items={studios}
            scrollState={scrollState}
            setTrackRef={setTrackRef}
            onRailScroll={onRailScroll}
            handleRailScroll={handleRailScroll}
            renderItem={(item) => (
              <Card2
                color={item.color}
                bg={item.img}
                himg={item.himg}
                img={item.img}
                studio={item.studio}
                stu={() => props.stu(item.studio, item.bg)}
              />
            )}
          />

          {/* 3. Dynamic Content Rails */}
          {rails.map((rail, index) => {
            const railKey = `${rail.title}-${index}`;
            const isTop10 = rail.title.toUpperCase().includes('TOP 10');
            const visibleItems = rail.items.filter(
              (item) => Number(item.rating?.toFixed(0) || 0) !== 0
            );

            if (!visibleItems.length) return null;

            return (
              <RailRow
                key={railKey}
                title={rail.title}
                railKey={railKey}
                items={visibleItems}
                scrollState={scrollState}
                setTrackRef={setTrackRef}
                onRailScroll={onRailScroll}
                handleRailScroll={handleRailScroll}
                eager={index === 0}
                renderItem={(item, idx) => (
                  <Card
                    sow={openWatch}
                    id={item.id}
                    img={item.name}
                    name={item.name2}
                    type={item.type}
                    rating={item.rating}
                    rank={isTop10 ? idx + 1 : undefined}
                  />
                )}
              />
            );
          })}

          <Footer />
        </Suspense>
      </div >

      {/* Direct URL Watch Loading Indicator */}
      {
        isWatchLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs">
            <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
          </div>
        )
      }

      {/* Watch Modal */}
      {
        watchOpen && watchItem && (
          <Watch
            data={data}
            sow={openWatch}
            onClose={clearWatchFromUrl}
            sid={watchItem.id}
            El={Array.isArray(props.e) && props.e.includes(watchItem.id) ? 'ADDED' : '+'}
            img={watchItem.img}
            type={watchItem.type}
            id={watchItem.tmdbId}
            s={watchItem.episodes}
            mname={watchItem.name2}
            name={watchItem.nameImg2 || watchItem.name2}
            name2={watchItem.name}
            yr={watchItem.releaseYear}
            ua={watchItem.ua}
            season={watchItem.season}
            lan={watchItem.language?.length || 0}
            desc={watchItem.desc}
            cat={watchItem.category}
            language={watchItem.language}
            rating={watchItem.rating}
            add={props.add}
            e={props.e}
            play={props.play}
          />
        )
      }
    </main >
  );
}

export default React.memo(Home);