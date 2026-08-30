import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Watch from '../../components/Watch/Watch';
import Skeleton from '../../components/Skeleton/Skeleton';
import Footer from '../../components/Footer/Footer';
import RailRow from '../../components/RailRow/RailRow';
import { useRailScroll } from '../../hooks/useRailScroll';
import { fetchTMDBMovieSections } from '../../content/tmdb.js';

// Imported HeroBanner
import HeroBanner from '../../components/HeroBanner/HeroBanner.jsx';

const HERO_ROTATE_MS = 8000;

const Movie = (props) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const data = Array.isArray(props.data) ? props.data : [];
  const movies = useMemo(() => data.filter((item) => item.type === 'movie'), [data]);
  const [pageSections, setPageSections] = useState({ heroBanner: [], rails: [] });
  const [sectionsLoading, setSectionsLoading] = useState(true);
  
  // Hero Banner State
  const [heroIndex, setHeroIndex] = useState(0);

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

  // Determine mediaData for HeroBanner (fallback to top recent movies if no TMDB hero banner)
  const heroData = useMemo(() => {
    if (Array.isArray(pageSections.heroBanner) && pageSections.heroBanner.length > 0) {
      return pageSections.heroBanner.slice(0, 5);
    }
    if (movies.length === 0) return [];
    return [...movies].sort((a, b) => b.releaseYear - a.releaseYear).slice(0, 5);
  }, [movies, pageSections.heroBanner]);

  const currentHero = heroData[heroIndex % Math.max(heroData.length, 1)] || null;

  // Rotate Hero Images
  useEffect(() => {
    if (heroData.length < 2) return undefined;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroData.length);
    }, HERO_ROTATE_MS);
    return () => clearInterval(interval);
  }, [heroData]);

  // Warm cache for next hero image
  useEffect(() => {
    if (heroData.length < 2) return;
    const next = heroData[(heroIndex + 1) % heroData.length];
    if (!next) return;
    [next.img, next.name].filter(Boolean).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [heroIndex, heroData]);

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
  // URL State Management for Watch Modal
  // ==========================================
  const watchId = searchParams.get('watch');

  const watchItem = useMemo(() => {
    if (!watchId) return null;
    return allItems.find((item) => String(item.id) === String(watchId));
  }, [watchId, allItems]);

  const isWatchOpen = !!watchItem;

  const openWatch = useCallback((id) => {
    const selected = allItems.find((item) => String(item.id) === String(id));
    if (!selected) return;

    searchParams.set('watch', selected.id);
    if (selected.name2) searchParams.set('name', selected.name2);
    setSearchParams(searchParams);
  }, [allItems, searchParams, setSearchParams]);

  const clearWatchFromUrl = useCallback(() => {
    searchParams.delete('watch');
    searchParams.delete('name');
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);
  // ==========================================

  // Loading state
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
      <HeroBanner
        mediaData={heroData}
        currentHero={currentHero}
        heroIndex={heroIndex}
        setHeroIndex={setHeroIndex}
        openWatch={openWatch}
      />

      {/* ── Movie Rails ── */}
      <div className="px-6 md:px-12 lg:px-16 relative z-20 space-y-12 pb-12 ">
        {sections.map((section, idx) => {
          const railKey = `rail-${idx}`;
          return (
            <div key={section.title}>
              <RailRow
                title={section.title === 'Popular Movies & TV Series' ? 'Popular Movies' : section.title}
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