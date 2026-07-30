import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Watch from '../../components/Watch/Watch';
import { fetchTMDBStudioTitles, buildCreativeRails } from '../../content/tmdb';
import { STUDIO_COLLECTIONS, getStudioConfig } from '../../content/studios';
import Footer from '../../components/Footer/Footer';
import Skeleton from '../../components/Skeleton/Skeleton';
import RailRow from '../../components/RailRow/RailRow';

/**
 * One tile in the horizontally-scrolling "Studios" strip.
 * Redesigned with premium scaling, glassmorphism, and smooth transitions.
 */
const StudioTile = ({ studio, active, onSelect }) => (
  <button
    onClick={() => onSelect(studio.key)}
    className={`group relative flex-shrink-0 w-[100px] h-[60px] md:w-[240px] md:h-[135px] rounded-xl overflow-hidden
      flex items-center justify-center transition-all duration-300 ease-out transform
      ${active
        ? 'scale-105 ring-2 ring-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
        : 'ring-1 ring-white/10 hover:ring-white/40 hover:scale-105 hover:shadow-xl'
      }`}
    style={{
      background: 'linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.8) 100%)',
      backgroundColor: '#1a1a1a'
    }}
  >
    {/* Ambient active glow behind the logo */}
    {active && (
      <div className="absolute inset-0 bg-white/5 animate-pulse rounded-xl" />
    )}

    <img
      src={studio.img}
      alt={studio.label}
      className={`p-3 md:p-6 object-contain w-full h-full relative z-10 transition-transform duration-500 ease-out
        ${active ? 'scale-110 drop-shadow-md' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`}
      loading="lazy"
      draggable={false}
    />
  </button>
);

const Studio = (props) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const data = Array.isArray(props.data) ? props.data : [];
  const [studioData, setStudioData] = useState([]);
  const [studioLoading, setStudioLoading] = useState(false);

  const studioName = String(id || props.studio || '').trim().toUpperCase();
  const studioConfig = useMemo(() => getStudioConfig(studioName), [studioName]);

  // Fetch studio data
  useEffect(() => {
    let active = true;
    const loadStudioData = async () => {
      if (!studioName) {
        if (active) setStudioData([]);
        return;
      }
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
    window.scrollTo({ top: 0, behavior: 'instant' });
    return () => { active = false; };
  }, [studioName]);

  const allData = useMemo(() => [...studioData, ...data], [data, studioData]);
  const rails = useMemo(() => buildCreativeRails(studioData), [studioData]);

  const goToStudio = useCallback(
    (key) => navigate(`/studio/${encodeURIComponent(key.toLowerCase())}`),
    [navigate]
  );

  // Watch modal logic
  const watchId = searchParams.get('watch');
  const watchItem = useMemo(() => {
    if (!watchId) return null;
    return allData.find((i) => String(i.id) === String(watchId));
  }, [watchId, allData]);

  const watchOpen = !!watchItem;

  const openWatch = useCallback(
    (itemId) => {
      const selected = allData.find((i) => String(i.id) === String(itemId));
      if (!selected) return;

      setSearchParams((prev) => {
        prev.set('watch', selected.id);
        if (selected.name2) prev.set('name', selected.name2);
        return prev;
      });
    },
    [allData, setSearchParams]
  );

  const clearWatchFromUrl = useCallback(() => {
    setSearchParams((prev) => {
      prev.delete('watch');
      prev.delete('name');
      return prev;
    });
  }, [setSearchParams]);

  // Loading skeleton
  if (props.loading || (studioLoading && studioData.length === 0)) {
    return (
      <div className="min-h-screen w-full bg-[#141414] text-white">
        <div className="h-[30vh] md:h-[45vh] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-[#141414]" />
          <div className="w-48 md:w-72 h-12 md:h-20 rounded-lg bg-white/10 animate-pulse relative z-10" />
        </div>
        <div className="px-6 md:px-12 lg:px-16 mt-4 space-y-12 pb-20">
          {[1, 2, 3].map((section) => (
            <Skeleton key={section} type="section" count={6} />
          ))}
        </div>
      </div>
    );
  }

  const themeColor = studioConfig?.color || '#333333';

  return (
    <div className="min-h-screen w-full bg-[#141414] text-white font-sans selection:bg-white/90 selection:text-black">

      {/* ── Cinematic Hero Section ── */}
      <div className="relative w-full h-[30vh] md:h-[45vh] flex items-center justify-center overflow-hidden bg-[#141414]">
        {/* Ambient background glow based on studio color */}
        <div
          className="absolute top-[-20%] w-[120%] h-[120%] opacity-40 blur-[80px] md:blur-[120px] mix-blend-screen transition-colors duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${themeColor} 0%, transparent 60%)`
          }}
        />
        {/* Vignette fade to dark at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#141414]/10 via-[#141414]/40 to-[#141414] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center transform translate-y-4 md:translate-y-8 animate-fade-in-up">
          {studioConfig?.img ? (
            <img
              src={studioConfig.img}
              alt={studioConfig.label}
              className="w-[180px] md:w-[320px] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
            />
          ) : (
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-xl">
              {studioName || 'Studio'}
            </h1>
          )}
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="relative z-20 px-4 md:px-12 lg:px-16 mx-auto -mt-8 md:-mt-12 pb-20 space-y-12 md:space-y-16 w-full">

        {/* ── Studios Navigation Strip ── */}
        <section className="relative">
          <h2 className="text-sm md:text-base font-bold text-white/80 uppercase tracking-wider mb-4 px-2">
            Explore Studios
          </h2>
          <div className="pb-4">
            <RailRow
              title=""
              items={STUDIO_COLLECTIONS}
              renderItem={(studio) => (
                <StudioTile
                  key={studio.key}
                  studio={studio}
                  active={studio.key.toUpperCase() === studioName}
                  onSelect={goToStudio}
                />
              )}
            />
          </div>
        </section>

        {/* ── Curated Content Rails ── */}
        <div className="space-y-10 md:space-y-14">
          {rails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white/5 rounded-2xl border border-white/10 mx-2">
              <div className="w-20 h-20 mb-6 rounded-full bg-white/5 flex items-center justify-center">
                <i className="fa-solid fa-film text-3xl text-white/40"></i>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white/90">No titles available</h2>
              <p className="text-white/50 text-base md:text-lg max-w-md px-4">
                We're currently updating our catalog for {studioConfig?.label || studioName}. Check back soon or explore another studio above.
              </p>
            </div>
          ) : (
            rails.map((rail, idx) => (
              <RailRow
                key={idx}
                title={<span className="text-xl md:text-2xl font-bold tracking-wide text-white/95">{rail.title}</span>}
                items={rail.items}
                renderItem={(item) => (
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
                    rating={item.rating}
                  />
                )}
              />
            ))
          )}
        </div>
      </div>

      <Footer />

      {/* ── Watch Modal ── */}
      {watchOpen && watchItem && (
        <Watch
          data={allData}
          sow={openWatch}
          onClose={clearWatchFromUrl}
          sid={watchItem.id}
          El={Array.isArray(props.e) && props.e.includes(watchItem.id) ? 'ADDED' : '+'}
          img={watchItem.img}
          type={watchItem.type}
          id={watchItem.tmdbId}
          s={watchItem.episodes}
          mname={watchItem.name2}
          name={watchItem.nameImg}
          name2={watchItem.name}
          yr={watchItem.releaseYear}
          ua={watchItem.ua}
          season={watchItem.season}
          lan={watchItem.language?.length || 0}
          desc={watchItem.desc}
          cat={watchItem.category}
          rating={watchItem.rating}
          language={watchItem.language}
          add={props.add}
          e={props.e}
          play={props.play}
        />
      )}
    </div>
  );
};

export default React.memo(Studio);