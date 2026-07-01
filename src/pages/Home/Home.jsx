import React, { useEffect, useMemo, useState, lazy, Suspense, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
// import Card from '../../components/Card/Card';
import Watch from '../../components/Watch/Watch';
// import Footer from '../../components/Footer/Footer';
const Card = lazy(() => import("../../components/Card/Card"));
const Card2 = lazy(() => import("../../components/Card/Card2"));
const Footer = lazy(() => import("../../components/Footer/Footer"));
// import Card2 from '../../components/Card/Card2';
import Skeleton from '../../components/Skeleton/Skeleton';
import { STUDIO_COLLECTIONS, filterByStudioCollection } from '../../content/studios.js';

import './Home.css';

function Home(props) {
  const trackRefs = useRef({});
  const media = window.matchMedia('(max-width: 768px)');
  const navigate = useNavigate();
  const location = useLocation();
  const data = Array.isArray(props.data) ? props.data : [];
  const homeSections = props.homeSections || { heroBanner: [], rails: [] };
  const heroData = Array.isArray(homeSections.heroBanner) ? homeSections.heroBanner : [];
  const [heroIndex, setHeroIndex] = useState(0);
  const [watchItem, setWatchItem] = useState(data[0] || null);

  const mediaData = useMemo(
    () => (heroData.length > 0 ? heroData.slice(0, 5) : data.slice(0,)),
    [data, heroData]
  );
  // console.log("Home render - mediaData:", mediaData);
  const currentHero = mediaData[heroIndex % Math.max(mediaData.length, 1)] || null;

  useEffect(() => {
    if (!watchItem && data.length > 0) setWatchItem(data[0]);
  }, [data, watchItem]);

  useEffect(() => {
    if (mediaData.length < 2) return undefined;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % mediaData.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [mediaData]);

  const openWatch = (id) => {
    const selected = [...mediaData, ...data].find((item) => item.id === id);
    if (!selected) return;

    setWatchItem(selected);
    // console.log(sele);

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

    const selected = data.find((item) => item.id === watchId);
    if (!selected) return;

    setWatchItem(selected);
    const watch = document.querySelector('#watch');
    if (watch) watch.style.display = 'block';
  }, [data, mediaData, location.search]);

  const playHero = () => {
    if (!currentHero) return;
    const streamId =
      currentHero.type === 'movie'
        ? `${currentHero.type}/${currentHero.tmdbId}`
        : `${currentHero.type}/${currentHero.tmdbId}/1/1`;

    props.play(streamId);
    navigate('/stream');

  };

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

  const handleRailScroll = (railKey, offset) => {
    trackRefs.current[railKey]?.scrollBy({ left: offset, behavior: 'smooth' });
  };

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
    <div className="homePage" id="homepage" >
      <div className="homebanner">

        <section className="heroBanner">
          <div
            className="heroBg"
            style={{
              backgroundImage: `url(${media.matches ? currentHero?.name : currentHero?.img || ''})`,
            }}
          />
          <div className="heroFade" />

          <div className="trendingPill">🔥 Now Trending</div>

          <div className="heroContent">
            <div className="heroTags">
              {currentHero?.category?.slice(0, 2).map((tag) => (
                <span key={tag} className="heroTag">{tag}</span>
              ))}
            </div>

            <h1 className="heroTitle">{currentHero?.name2}</h1>

            <p className="heroDesc">{currentHero?.desc}</p>

            <div className="heroActions">
              <button type="button" className="btnWatch" onClick={playHero}>
                <div className="playTri" /> Watch Now
              </button>
              <button type="button" className="btnWatch more" onClick={() => openWatch(currentHero?.id)} title="More Info">
                More Info
              </button>
            </div>
          </div>

          {/* Prev / Next arrows */}
          <button type="button" className="heroArrow heroArrowL"
            onClick={() => setHeroIndex((heroIndex - 1 + mediaData.length) % mediaData.length)}>
            ‹
          </button>
          <button type="button" className="heroArrow heroArrowR"
            onClick={() => setHeroIndex((heroIndex + 1) % mediaData.length)}>
            ›
          </button>

          {/* Dot indicators */}
          <div className="heroDots">
            {mediaData.slice(0, 5).map((_, i) => (
              <button
                key={i} type="button"
                className={`heroDot ${heroIndex % 5 === i ? 'heroDotActive' : ''}`}
                onClick={() => setHeroIndex(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </section>
      </div>

      <div className="homeShell">
        <Suspense fallback={<Skeleton type="section" count={10} />}>
          {rails.map((rail, index) => {
            const railKey = `${rail.title}-${index}`;
            return (
              <section className="homeSection" key={railKey}>
                <div className="sectionHeader">

                  <h2 className="homeTitle">{rail.title}</h2>
                  <div className="trackBtns">

                    <button
                      className="scrollBtn left"
                      onClick={() => handleRailScroll(railKey, -1000)}
                      aria-label="Scroll left"
                    >
                      ◀
                    </button>
                    <button
                      className="scrollBtn right"
                      onClick={() => handleRailScroll(railKey, 1000)}
                      aria-label="Scroll right"
                    >
                      ▶
                    </button>
                  </div>
                  {/* <Link to={`/viewall?items=${JSON.stringify(rail.items)}&title=${rail.title}`} className="viewAllLink">
                    View All
                  </Link> */}
                </div>
                <div
                  className="homeTrack"
                  ref={(node) => {
                    trackRefs.current[railKey] = node;
                  }}
                >
                  {rail.items
                    .filter((item) => Number(item.rating.toFixed(0)) !== 0)
                    .map((item, index) => {
                      const isTop10 = rail.title === "TOP 10";
                      const cardProps = {
                        sow: openWatch,
                        id: item.id,
                        img: item.name,
                        name: item.name2,
                        ry: item.releaseYear,
                        ua: item.ua,
                        lan: item.language.length,
                        desc: item.desc,
                        s: item.season,
                        type: item.type,
                        tid: item.tmdbId,
                        rating: item.rating,
                        add: props.add,
                        e: props.e,
                        play: props.play,
                      };

                      return isTop10 ? (
                        <div className="cardrank" key={item.id}>
                          <div className="rank">{index + 1}</div>

                          <Card {...cardProps} />

                        </div>
                      ) : (
                        <Card key={item.id} {...cardProps} />
                      );
                    })}
                </div>

              </section>
            );
          })}

          <section className="homeSection">
            <div className="sectionHeader">
              <h2 className="homeTitle">Studios</h2>
              <div className="trackBtns">

                <button
                  className="scrollBtn left"
                  onClick={() => handleRailScroll("Studio", -1000)}
                  aria-label="Scroll left"
                >
                  ◀
                </button>
                <button
                  className="scrollBtn right"
                  onClick={() => handleRailScroll("Studio", 1000)}
                  aria-label="Scroll right"
                >
                  ▶
                </button>
              </div>
            </div>
            <div className="studioTrack" ref={(node) => {
              trackRefs.current["Studio"] = node;
            }}>

              {studios.map((item) => (

                <Card2
                  key={item.studio}
                  color={item.color}
                  bg={item.img}
                  himg={item.himg}
                  img={item.img}
                  studio={item.studio}
                  stu={() => props.stu(item.studio, item.bg)}
                />
              ))}
            </div>
          </section>

          <Footer />
        </Suspense>
      </div>

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
    </div>
  );
}

export default Home;
