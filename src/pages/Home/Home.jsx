import React, { useEffect, useMemo, useState, useCallback, lazy, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Watch from '../../components/Watch/Watch';
import RailRow from '../../components/RailRow/RailRow.jsx';
import { useRailScroll } from '../../hooks/useRailScroll';
import PrivacyPolicyPopup, { PRIVACY_POLICY_STORAGE_KEY } from '../../components/PrivacyPolicyPopup/PrivacyPolicyPopup.jsx';

const Card = lazy(() => import('../../components/Card/Card'));
const Card2 = lazy(() => import('../../components/Card/Card2'));
const Footer = lazy(() => import('../../components/Footer/Footer'));

import Skeleton from '../../components/Skeleton/Skeleton';
import { STUDIO_COLLECTIONS, filterByStudioCollection } from '../../content/studios.js';
import { getContinueWatching } from '../../utils/continueWatching';

const HERO_ROTATE_MS = 8000;

function Home(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const data = Array.isArray(props.data) ? props.data : [];
  const homeSections = props.homeSections || { heroBanner: [], rails: [] };
  const heroData = Array.isArray(homeSections.heroBanner) ? homeSections.heroBanner : [];
  const [heroIndex, setHeroIndex] = useState(0);
  const [watchItem, setWatchItem] = useState(data[0] || null);
  const [watchOpen, setWatchOpen] = useState(false);
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
    if (!watchItem && data.length > 0) setWatchItem(data[0]);
  }, [data, watchItem]);

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

  const openWatch = useCallback((id) => {
    const selected = [...mediaData, ...data].find((item) => item.id === id);
    if (!selected) return;
    setWatchItem(selected);
    setWatchOpen(true);
    navigate(`${location.pathname}?watch=${selected.id}&name=${encodeURIComponent(selected.name2)}`);
  }, [mediaData, data, navigate, location.pathname]);

  const clearWatchFromUrl = useCallback(() => {
    setWatchOpen(false);
    setWatchItem(null);
    navigate(location.pathname);
  }, [navigate, location.pathname]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const watchId = Number(params.get('watch'));
    if (!watchId) return;
    const selected = data.find((item) => item.id === watchId);
    if (!selected) return;
    setWatchItem(selected);
    setWatchOpen(true);
  }, [data, location.search]);

  const playHero = useCallback(() => {
    if (!currentHero) return;
    const streamId =
      currentHero.type === 'movie'
        ? `${currentHero.type}/${currentHero.tmdbId}`
        : `${currentHero.type}/${currentHero.tmdbId}/1/1`;

    props.play(streamId);
    const query = new URLSearchParams({
      title: currentHero.name2 || 'Stream',
      tmdb: streamId,
      defaultImage: currentHero.img || currentHero.name || '',
    });
    navigate(`/stream?${query.toString()}`);
  }, [currentHero, props, navigate]);

  const resumeContinueWatching = useCallback((item) => {
    if (!item?.streamId) return;
    props.play(item.streamId);
    const query = new URLSearchParams({
      title: item.title || 'Stream',
      tmdb: item.streamId,
      defaultImage: item.image || '',
      episodes: JSON.stringify(item.episodes || []),
    });
    navigate(`/stream?${query.toString()}`);
  }, [navigate, props]);

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
      <section className="relative w-full h-[75vh] sm:h-[85vh] md:h-[90vh] lg:h-[100vh] overflow-hidden bg-black">
        {/* Background arts */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center block md:hidden transition-opacity duration-1000 ease-in-out"
            style={currentHero?.name ? { backgroundImage: `url(${currentHero.name})` } : undefined}
          />
          <div
            className="absolute inset-0 bg-cover bg-center hidden md:block transition-opacity duration-1000 ease-in-out"
            style={currentHero?.img ? { backgroundImage: `url(${currentHero.img})` } : undefined}
          />
        </div>
        
        {/* Netflix Signature Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-[#141414]/40 to-transparent w-[80%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent bottom-0 h-[100%]" />

        {/* Hero content */}
        <div className="absolute bottom-[10%] sm:bottom-[15%] left-0 w-full px-6 md:px-12 lg:px-16 flex flex-col items-start gap-4 z-10 w-full max-w-[90%] md:max-w-[50%]">
          
          {/* Logo or Title */}
          {currentHero?.nameImg2 ? (
             <img src={currentHero.nameImg2} alt={currentHero.name2} className="max-w-[200px] md:max-w-[400px] lg:max-w-[500px] object-contain drop-shadow-2xl mb-2" />
          ) : (
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight drop-shadow-2xl line-clamp-2">
              {currentHero?.name2}
            </h1>
          )}

          {/* Ranking / Category Badge */}
          <div className="flex items-center gap-3 drop-shadow-md">
            <span className="flex items-center justify-center font-bold text-[#E50914] text-2xl md:text-4xl">
              N
            </span>
            <span className="text-gray-300 font-semibold tracking-wide text-xs sm:text-sm uppercase flex items-center gap-2">
              <span className="text-white">Film</span>
            </span>
          </div>
          
          <h2 className="text-xl md:text-2xl font-bold drop-shadow-md flex items-center gap-2">
             <span className="bg-[#E50914] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">TOP 10</span>
             #{heroIndex + 1} in Trending Today
          </h2>

          <p className="hidden md:block text-base lg:text-lg text-gray-200 drop-shadow-lg line-clamp-3 leading-snug text-shadow-md">
            {currentHero?.desc}
          </p>

          <div className="mt-4 flex gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={playHero}
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 sm:px-8 py-2 md:py-2.5 bg-white text-black font-bold text-sm md:text-xl rounded hover:bg-white/80 active:scale-95 transition"
            >
              <i className="fa-solid fa-play"></i>
              Play
            </button>
            <button
              type="button"
              onClick={() => openWatch(currentHero?.id)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 sm:px-8 py-2 md:py-2.5 bg-[#6d6d6e]/70 text-white font-bold text-sm md:text-xl rounded hover:bg-[#6d6d6e] active:scale-95 transition backdrop-blur-sm"
              title="More Info"
            >
              <i className="fa-solid fa-circle-info"></i>
              More Info
            </button>
          </div>
        </div>

        {/* Progress dots (Optional: Netflix rarely uses them now, but keeping for UX mapping) */}
        <div className="absolute bottom-6 md:bottom-10 left-0 w-full flex justify-center gap-2 z-10">
          {mediaData.slice(0, 5).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`h-1 rounded-full transition-all duration-300 ${heroIndex % 5 === i ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/70 w-3'}`}
              onClick={() => setHeroIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      {/* Heavy negative margin to pull rails up over the hero gradient */}
      <div className="px-6 md:px-12 lg:px-16 relative z-20 space-y-12 pb-12 -mt-0 md:-mt-[-5px]">
        <Suspense fallback={<Skeleton type="section" count={10} />}>
          
          {/* Continue Watching */}
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
                  className="relative flex-shrink-0 w-44 md:w-64 lg:w-72 aspect-video rounded overflow-hidden cursor-pointer group hover:ring-2 hover:ring-white transition-all bg-[#181818] duration-300"
                  onClick={() => resumeContinueWatching(item)}
                  title={item.title}
                >
                  <img 
                     src={item.image || "https://via.placeholder.com/640x360.png?text=Resume"} 
                     alt={item.title}
                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  {/* Hover Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <i className="fa-regular fa-circle-play text-5xl text-white drop-shadow-lg scale-90 group-hover:scale-100 transition-transform"></i>
                  </div>
                  {/* Progress Bar Mockup (Static 50% for visual effect if backend doesn't supply progress) */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                    <div className="h-full bg-[#E50914]" style={{ width: '50%' }}></div>
                  </div>
                  {/* Episode Badge */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 drop-shadow-md">
                     {item.type === 'tv' && (
                        <span className="font-bold text-white text-xs sm:text-sm drop-shadow-md">
                          S{item.season}:E{item.episode}
                        </span>
                     )}
                     {!item.image && (
                         <span className="font-bold text-white text-xs sm:text-sm drop-shadow-md line-clamp-1">{item.title}</span>
                     )}
                  </div>
                </div>
              )}
            />
          )}

          {/* Dynamic Rails */}
          {rails.map((rail, index) => {
            const railKey = `${rail.title}-${index}`;
            const isTop10 = rail.title === 'Top 10 Today';
            const visibleItems = rail.items.filter((item) => Number(item.rating.toFixed(0)) !== 0);

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
                    <div className="relative flex items-center justify-end pl-6 md:pl-10 overflow-hidden">
                      {/* Massive Netflix-style stroked number */}
                      <div 
                        className="absolute left-0 bottom-[-10px] md:bottom-[-20px] text-[100px] md:text-[180px] font-black leading-none text-[#141414] select-none z-0 tracking-tighter drop-shadow-md overflow-hidden"
                        style={{ WebkitTextStroke: '3px #595959' }}
                      >
                        {idx + 1}
                      </div>
                      <div className="relative z-10 w-full ml-8 md:ml-16">
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

          {/* Studios rail */}
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

          <Footer />
        </Suspense>
      </div>

      {/* Watch modal */}
      {watchOpen && (
        <Watch
          data={data}
          sow={openWatch}
          onClose={clearWatchFromUrl}
          sid={watchItem?.id}
          El={Array.isArray(props.e) && props.e.includes(watchItem?.id) ? 'ADDED' : '+'}
          img={watchItem?.img}
          type={watchItem?.type}
          id={watchItem?.tmdbId}
          s={watchItem?.episodes}
          mname={watchItem?.name2}
          name={watchItem?.nameImg2 || watchItem?.name2}
          name2={watchItem?.name}
          yr={watchItem?.releaseYear}
          ua={watchItem?.ua}
          season={watchItem?.season}
          lan={watchItem?.language?.length || 0}
          desc={watchItem?.desc}
          cat={watchItem?.category}
          language={watchItem?.language}
          rating={watchItem?.rating}
          add={props.add}
          e={props.e}
          play={props.play}
        />
      )}
    </div>
  );
}

export default React.memo(Home);