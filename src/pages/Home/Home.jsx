import React, { useEffect, useMemo, useState, useCallback, lazy, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Watch from '../../components/Watch/Watch';
import RailRow from '../../components/RailRow/RailRow.jsx';
import { useRailScroll } from '../../hooks/useRailScroll';
import PrivacyPolicyPopup, { PRIVACY_POLICY_STORAGE_KEY } from '../../components/PrivacyPolicyPopup/PrivacyPolicyPopup.jsx';

// New Component Import
import HeroBanner from '../../components/HeroBanner/HeroBanner.jsx';

import { fetchTMDBDetails } from '../../content/tmdb.js';

const Card = lazy(() => import('../../components/Card/Card'));
const Card2 = lazy(() => import('../../components/Card/Card2'));
const Footer = lazy(() => import('../../components/Footer/Footer'));

import Skeleton from '../../components/Skeleton/Skeleton';
import { STUDIO_COLLECTIONS, filterByStudioCollection } from '../../content/studios.js';
import { getContinueWatching, removeContinueWatching } from '../../utils/continueWatching';

const HERO_ROTATE_MS = 8000;

function Home(props) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const data = Array.isArray(props.data) ? props.data : [];
  const homeSections = props.homeSections || { heroBanner: [], rails: [] };
  const heroData = Array.isArray(homeSections.heroBanner) ? homeSections.heroBanner : [];
  const [heroIndex, setHeroIndex] = useState(0);

  const [continueWatching, setContinueWatching] = useState(() => getContinueWatching());
  const [privacyPopupOpen, setPrivacyPopupOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(PRIVACY_POLICY_STORAGE_KEY) !== 'true';
  });

  useEffect(() => {
    const refreshContinueWatching = () => setContinueWatching(getContinueWatching());
    refreshContinueWatching();
    window.addEventListener('focus', refreshContinueWatching);
    return () => window.removeEventListener('focus', refreshContinueWatching);
  }, []);

  const mediaData = useMemo(
    () => (heroData.length > 0 ? heroData.slice(0, 5) : data.slice(0)),
    [data, heroData]
  );
  const currentHero = mediaData[heroIndex % Math.max(mediaData.length, 1)] || null;

  useEffect(() => {
    if (mediaData.length < 2) return undefined;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % mediaData.length);
    }, HERO_ROTATE_MS);
    return () => clearInterval(interval);
  }, [mediaData]);

  // Warm cache for next hero image
  useEffect(() => {
    if (mediaData.length < 2) return;
    const next = mediaData[(heroIndex + 1) % mediaData.length];
    if (!next) return;
    [next.img, next.name].filter(Boolean).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [heroIndex, mediaData]);


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

    const fetchWatchItem = async () => {
      setIsWatchLoading(true);
      try {
        const [mediaType, tmdbId] = watchId.split('_');
        if (!mediaType || !tmdbId) throw new Error("Invalid watch ID format");

        const details = await fetchTMDBDetails(mediaType, tmdbId);
        if (!details) throw new Error('Media not found');

        const mappedItem = {
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
        };

        setFetchedWatchItem(mappedItem);
      } catch (error) {
        console.error("Failed to fetch direct watch item:", error);
        setFetchedWatchItem(null);
      } finally {
        setIsWatchLoading(false);
      }
    };

    fetchWatchItem();
  }, [watchId, localWatchItem]);

  const watchItem = localWatchItem || fetchedWatchItem;
  const watchOpen = !!watchItem;

  const openWatch = useCallback((id, name2) => {
    if (!id) return;
    searchParams.set('watch', id);
    if (name2) searchParams.set('name', name2);
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  const clearWatchFromUrl = useCallback(() => {
    searchParams.delete('watch');
    searchParams.delete('name');
    setSearchParams(searchParams);
    setFetchedWatchItem(null);
  }, [searchParams, setSearchParams]);
  // ==========================================

  const resumeContinueWatching = useCallback((item) => {
    if (!item?.streamId) return;
    props.play(item.streamId);
    const streamId = item.type === 'tv' ? `${item.tmdbId}/${item.season}/${item.episode}` : item.streamId;
    navigate(`/streaming/${streamId}`);
  }, [navigate, props]);

  const handleRemoveContinueWatching = useCallback((e, streamId) => {
    e.stopPropagation();
    if (typeof removeContinueWatching === 'function') {
      removeContinueWatching(streamId);
    }
    setContinueWatching((prev) => prev.filter((item) => item.streamId !== streamId));
  }, []);

  const rails = useMemo(
    () => (Array.isArray(homeSections.rails) && homeSections.rails.length > 0 ? homeSections.rails : [
      { title: 'TOP 10', items: data.slice(0, 10) },
      { title: 'Popular Movies', items: data.filter((item) => item.type === 'movie').slice(0, 20) },
      { title: 'Popular Shows', items: data.filter((item) => item.type === 'tv').slice(0, 20) },
      { title: 'Top Rated', items: data.filter((item) => item.type === 'movie').slice(20, 40) },
      { title: 'Action Movies', items: data.filter((item) => item.category.includes('Action')).slice(0, 20) },
      { title: 'Comedy Movies', items: data.filter((item) => item.category.includes('Comedy')).slice(0, 20) },
      { title: 'New Episodes', items: data.filter((item) => item.type === 'tv').slice(20, 40) },
    ]),
    [data, homeSections.rails]
  );

  const railKeys = useMemo(
    () => [
      ...(continueWatching.length ? ['continue-watching'] : []),
      ...rails.map((rail, index) => `${rail.title}-${index}`),
      'Studio',
    ],
    [rails, continueWatching.length]
  );

  const { scrollState, setTrackRef, onRailScroll, handleRailScroll } = useRailScroll(railKeys);

  const studios = useMemo(
    () =>
      STUDIO_COLLECTIONS.map((studio) => {
        const titles = filterByStudioCollection(data, studio.key);
        const sample = titles[0] || data[0];
        return {
          color: studio.color,
          studio: studio.label,
          img: studio.img,
          bg: studio.bg,
          himg: studio.img,
        };
      }),
    [data]
  );

  if (props.loading) {
    return (
      <div className="min-h-screen bg-[#141414] text-white" id="homepage">
        <Skeleton type="banner" />
        <div className="px-6 md:px-12 lg:px-16 mt-4 space-y-8">
          {[1, 2, 3, 4, 5].map((section) => (
            <Skeleton key={section} type="section" count={10} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#141414] text-white overflow-hidden" id="homepage">
      <PrivacyPolicyPopup open={privacyPopupOpen} onClose={() => setPrivacyPopupOpen(false)} />

      {/* ===== HERO BANNER ===== */}
      <HeroBanner
        mediaData={mediaData}
        currentHero={currentHero}
        heroIndex={heroIndex}
        setHeroIndex={setHeroIndex}
        openWatch={openWatch}
      />

      {/* ===== MAIN CONTENT ===== */}
      <div className="px-6 md:px-12 lg:px-16 relative z-20 space-y-12 pb-12 mt-6 md:-mt-0">
        <Suspense fallback={<Skeleton type="section" count={10} />}>

          {continueWatching.length > 0 && (
            <RailRow
              title="Continue Watching"
              railKey="continue-watching"
              items={continueWatching}
              scrollState={scrollState}
              setTrackRef={setTrackRef}
              onRailScroll={onRailScroll}
              handleRailScroll={handleRailScroll}
              eager
              renderItem={(item) => (
                <div
                  className="relative flex-shrink-0 w-56 sm:w-64 md:w-80 lg:w-96 aspect-video rounded-md overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-all duration-300 bg-[#181818]"
                  onClick={() => openWatch(`${item.type}_${item.tmdbId}`)}
                  title={item.title}
                >
                  <button
                    onClick={(e) => handleRemoveContinueWatching(e, item.streamId)}
                    className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white/70 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 border border-transparent hover:border-white/50 backdrop-blur-sm"
                    title="Remove from row"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>

                  <img
                    src={item.image || "https://via.placeholder.com/640x360.png?text=Resume"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-90" />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-white flex items-center justify-center bg-black/50 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                      <i className="fa-solid fa-play text-white text-xl md:text-2xl ml-1"></i>
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex flex-col justify-end pointer-events-none">
                    <h4 className="text-white font-bold text-sm md:text-base line-clamp-1 drop-shadow-md">
                      {item.title}
                    </h4>
                    {item.type === 'tv' && (
                      <span className="text-gray-300 text-xs md:text-sm font-medium drop-shadow-md mt-0.5">
                        S{item.season}:E{item.episode}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1 md:h-1.5 bg-gray-500/50">
                    <div className="h-full bg-[#E50914] rounded-r-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              )}
            />
          )}

          <RailRow
            title="Studios"
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

          {/* Dynamic Rails */}
          {rails.map((rail, index) => {
            const railKey = `${rail.title}-${index}`;
            const isTop10 = rail.title === 'Top 10 Today';
            const visibleItems = rail.items.filter((item) => Number(item.rating?.toFixed(0) || 0) !== 0);

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
                renderItem={(item, idx) =>
                  isTop10 ? (
                    <div className="relative flex items-center justify-end pl-10 sm:pl-12 md:pl-20 py-2 sm:py-4 group">
                      <div
                        className="absolute left-0 bottom-[2%] md:bottom-[5%] text-[100px] sm:text-[140px] md:text-[200px] lg:text-[230px] font-black leading-none text-[#141414] select-none z-0 tracking-tighter drop-shadow-2xl transition-transform duration-300 group-hover:scale-105 origin-bottom-left"
                        style={{
                          WebkitTextStroke: '4px #595959',
                          textShadow: '0px 10px 20px rgba(0,0,0,0.8)'
                        }}
                      >
                        {idx + 1}
                      </div>

                      <div className="relative z-10 w-full ml-4 md:ml-8 transform transition-transform duration-300 group-hover:-translate-y-2">
                        <Card
                          sow={openWatch}
                          id={item.id}
                          img={item.name}
                          name={item.name2}
                          type={item.type}
                          rating={item.rating}
                        />
                      </div>
                    </div>
                  ) : (
                    <Card
                      sow={openWatch}
                      id={item.id}
                      img={item.name}
                      name={item.name2}
                      type={item.type}
                      rating={item.rating}
                    />
                  )
                }
              />
            );
          })}

          <Footer />
        </Suspense>
      </div>

      {/* Watch modal */}
      {watchOpen && watchItem && (
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
      )}
    </div>
  );
}

export default React.memo(Home);