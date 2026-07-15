import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Watch from '../../components/Watch/Watch';
import Skeleton from '../../components/Skeleton/Skeleton';
import Footer from '../../components/Footer/Footer';
import RailRow from '../../components/RailRow/RailRow';
import { useRailScroll } from '../../hooks/useRailScroll';
import { fetchTMDBMovieSections } from '../../content/tmdb.js';

const Movie = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = Array.isArray(props.data) ? props.data : [];
  const movies = useMemo(() => data.filter((item) => item.type === 'movie'), [data]);
  const [pageSections, setPageSections] = useState({ heroBanner: [], rails: [] });
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [watchItem, setWatchItem] = useState(null);
  const [isWatchOpen, setIsWatchOpen] = useState(false);

  // Fetch TMDB movie sections
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
    return () => { active = false; };
  }, []);

  const featured = useMemo(() => {
    if (Array.isArray(pageSections.heroBanner) && pageSections.heroBanner.length > 0)
      return pageSections.heroBanner[0];
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
    () => [
      ...movies,
      ...(pageSections.heroBanner || []),
      ...sections.flatMap((section) => section.items || []),
    ],
    [movies, pageSections.heroBanner, sections]
  );

  const railKeys = useMemo(() => sections.map((_, idx) => `rail-${idx}`), [sections]);
  const { scrollState, setTrackRef, onRailScroll, handleRailScroll } = useRailScroll(railKeys);

  // ==========================================
  // Watch modal logic
  // ==========================================
  const openWatch = useCallback((id) => {
    const selected = allItems.find((item) => item.id === id);
    if (!selected) return;
    setWatchItem(selected);
    setIsWatchOpen(true);
    navigate(`${location.pathname}?watch=${selected.id}&name=${encodeURIComponent(selected.name2)}`);
  }, [allItems, navigate, location.pathname]);

  const clearWatchFromUrl = useCallback(() => {
    setIsWatchOpen(false);
    setWatchItem(null);
    navigate(location.pathname);
  }, [navigate, location.pathname]);

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

  const playFeatured = useCallback(() => {
    if (!featured) return;
    const streamId = `${featured.type}/${featured.tmdbId}`;
    props.play(streamId);
    navigate('/stream');
  }, [featured, props, navigate]);

  // ==========================================
  // Loading state
  // ==========================================
  if (props.loading || sectionsLoading) {
    return (
      <div className="min-h-screen bg-[#141414] text-white">
        <Skeleton type="banner" />
        <div className="px-6 md:px-12 lg:px-16 mt-4 space-y-12">
          {[1, 2, 3, 4, 5].map((section) => (
            <Skeleton key={section} type="section" count={10} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#141414] text-white overflow-hidden selection:bg-[#E50914] selection:text-white">
      {/* ── Hero Banner ── */}
      {featured && (
        <section className="relative w-full h-[75vh] sm:h-[85vh] md:h-[90vh] lg:h-[100vh] overflow-hidden bg-black">
          {/* Background Images */}
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 bg-cover bg-center block md:hidden transition-opacity duration-1000 ease-in-out"
              style={{ backgroundImage: `url(${featured.name})` }}
            />
            <div
              className="absolute inset-0 bg-cover bg-center hidden md:block transition-opacity duration-1000 ease-in-out"
              style={{ backgroundImage: `url(${featured.img})` }}
            />
          </div>

          {/* Netflix Signature Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-[#141414]/40 to-transparent w-[80%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent bottom-0 h-[100%]" />

          {/* Hero Content */}
          <div className="absolute bottom-[10%] sm:bottom-[15%] left-0 w-full px-6 md:px-12 lg:px-16 flex flex-col items-start gap-4 z-10 w-full max-w-[90%] md:max-w-[50%]">
            
            {/* Netflix Film Badge */}
            <div className="flex items-center gap-3 drop-shadow-md">
              <span className="flex items-center justify-center font-bold text-[#E50914] text-2xl md:text-4xl">
                N
              </span>
              <span className="text-gray-300 font-semibold tracking-wide text-xs sm:text-sm uppercase flex items-center gap-2">
                <span className="text-white">Film</span>
              </span>
            </div>
            
            {featured.nameImg2 ? (
              <img src={featured.nameImg2} alt={featured.name2} className="max-w-[200px] md:max-w-[400px] lg:max-w-[500px] object-contain drop-shadow-2xl mb-2" />
            ) : (
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight drop-shadow-2xl line-clamp-2">
                {featured.name2}
              </h1>
            )}

            <div className="flex items-center gap-3 text-sm md:text-base font-semibold drop-shadow-md text-gray-300">
               <span className="text-[#46d369] font-bold">New</span>
               {/* <span>{featured.releaseYear}</span>
               <span className="border border-gray-400 px-1.5 py-0.5 text-xs rounded-sm text-gray-300">{featured.ua || 'UA 13+'}</span> */}
            </div>
            
            <p className="hidden md:block text-base lg:text-lg text-gray-200 drop-shadow-lg line-clamp-3 leading-snug text-shadow-md mt-2">
              {featured.desc}
            </p>
            
            <div className="mt-4 flex gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={playFeatured}
                className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 sm:px-8 py-2 md:py-2.5 bg-white text-black font-bold text-sm md:text-xl rounded hover:bg-white/80 active:scale-95 transition"
              >
                <i className="fa-solid fa-play" /> Play
              </button>
              <button
                onClick={() => openWatch(featured.id)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 sm:px-8 py-2 md:py-2.5 bg-[#6d6d6e]/70 text-white font-bold text-sm md:text-xl rounded hover:bg-[#6d6d6e] active:scale-95 transition backdrop-blur-sm"
              >
                <i className="fa-solid fa-circle-info" /> More Info
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Movie Rails ── */}
      {/* Heavy negative margin to pull rails up over the hero gradient */}
      <div className="px-6 md:px-12 lg:px-16 relative z-20 space-y-12 pb-12 -mt-26 md:-mt-32">
        {sections.map((section, idx) => {
          const railKey = `rail-${idx}`;
          return (
            <div key={section.title}>
              <RailRow
                title={section.title}
                railKey={railKey}
                items={section.items}
                scrollState={scrollState}
                setTrackRef={setTrackRef}
                onRailScroll={onRailScroll}
                handleRailScroll={handleRailScroll}
                eager={idx === 0}
                renderItem={(item) => (
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
                  />
                )}
              />
            </div>
          );
        })}

        <Footer />
      </div>

      {/* ── Watch Modal ── */}
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

export default React.memo(Movie);