import React, { useEffect, useState, lazy, Suspense } from "react";
import Nav from "./components/Nav/Nav";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import "./App.css";
import { fetchTMDBCatalog, fetchTMDBHomeSections } from "./content/tmdb.js";
import ErrorBoundary from "./components/ErrorBoundary";
import MovieViewAll from "./pages/ViewAll/MovieViewAll.jsx";
import ScrollToTop from "./components/ScrollToTop";
import Streaming from "./pages/Stream/streaming.jsx";

// ✅ Lazy-loaded page components
const Home = lazy(() => import("./pages/Home/Home"));
const Movie = lazy(() => import("./pages/Movies/Movie"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const Tv = lazy(() => import("./pages/TV/Tv"));
const Search = lazy(() => import("./pages/Search/Search"));
const Studio = lazy(() => import("./pages/Studio/Studio"));

const safeParse = (value, fallback) => {
  if (value === null || value === undefined || value === "undefined" || value === "null" || value === "") {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

// ✅ Fallback UI shown while lazy chunks load
function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#141414] text-white">
      <div className="w-12 h-12 border-4 border-white/20 border-t-[#E50914] rounded-full animate-spin mb-4"></div>
      <div className="text-sm tracking-[0.2em] uppercase font-semibold text-gray-400 animate-pulse">
        Loading...
      </div>
    </div>
  );
}

function App() {
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('hasSeenIntro');
  });

  const [catalog, setCatalog] = useState([]);
  const [homeSections, setHomeSections] = useState({ heroBanner: [], rails: [] });
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', isError: false });

  // 🎬 2. Intro Video Logic
  useEffect(() => {
    if (showIntro) {
      sessionStorage.setItem('hasSeenIntro', 'true');

      const fallbackTimer = setTimeout(() => {
        setShowIntro(false);
      }, 10000);

      return () => clearTimeout(fallbackTimer);
    }
  }, [showIntro]);

  useEffect(() => {
    let active = true;
    const loadCatalog = async () => {
      try {
        const [items, sections] = await Promise.all([
          fetchTMDBCatalog({ moviePages: 3, tvPages: 3 }),
          fetchTMDBHomeSections(),
        ]);
        if (active) {
          const merged = [
            ...items,
            ...(sections.heroBanner || []),
            ...((sections.rails || []).flatMap((rail) => rail.items || [])),
          ];
          const unique = [];
          const seen = new Set();
          merged.forEach((entry) => {
            const key = `${entry?.type}:${entry?.tmdbId}`;
            if (!entry || seen.has(key)) return;
            seen.add(key);
            unique.push(entry);
          });
          setCatalog(unique);
          setHomeSections(sections);
        }
      } catch (error) {
        console.error("Failed to load TMDB catalog:", error);
      } finally {
        if (active) setCatalogLoading(false);
      }
    };
    loadCatalog();
    return () => { active = false; };
  }, []);

  const [El, setEl] = useState(() => safeParse(localStorage.getItem('El'), []));

  useEffect(() => {
    localStorage.setItem('El', JSON.stringify(El));
  }, [El]);

  const showToast = (message, isError = false) => {
    setToast({ show: true, message, isError });
    setTimeout(() => {
      setToast({ show: false, message: '', isError: false });
    }, 3000);
  };

  const getStoredDetails = () => {
    const raw = localStorage.getItem('MyListDetails');
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  };

  const add = (e, id, name, mname, type, rating) => {
    setEl(prevEl => {
      if (prevEl.includes(e)) {
        showToast('Removed from My List', true);
        const details = getStoredDetails();
        delete details[e];
        localStorage.setItem('MyListDetails', JSON.stringify(details));
        return prevEl.filter(item => item !== e);
      } else {
        showToast('Added to My List', false);
        const details = getStoredDetails();
        details[e] = { id, name, mname, type, rating };
        localStorage.setItem('MyListDetails', JSON.stringify(details));
        return [...prevEl, e];
      }
    });
  };

  const [Img, setImg] = useState(() => safeParse(localStorage.getItem('IMG'), []));
  const [studio, setStudio] = useState(() => safeParse(localStorage.getItem('STUDIO'), []));

  useEffect(() => {
    localStorage.setItem('IMG', JSON.stringify(Img));
    localStorage.setItem('STUDIO', JSON.stringify(studio));
  }, [Img, studio]);

  const sow = (stud, img) => { setStudio(stud); setImg(img); };

  const [TID, setTID] = useState(() => safeParse(localStorage.getItem('TID'), []));

  useEffect(() => {
    localStorage.setItem('TID', JSON.stringify(TID));
  }, [TID]);

  const play = (tid) => setTID(tid);

  const sharedProps = { data: catalog, loading: catalogLoading, add, e: El, play };

  return (
    <div className="h-[100vh] sm:pt-16 bg-[#141414] text-white font-sans selection:bg-[#E50914] selection:text-white relative">

      {/* ✅ Intro Video Logic */}
      {showIntro ? (
        <div className="fixed inset-0 z-[10000] bg-black flex items-center justify-center overflow-hidden">
          <video
            src="../public/"
            autoPlay
            playsInline
            onEnded={() => setShowIntro(false)}
            className="w-full h-full object-cover sm:object-contain pointer-events-none"
          />
        </div>
      ) : (
        <Router>
          <ScrollToTop />
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* ✅ Auth routes removed */}

                <Route path="/" element={
                  <>
                    <Nav />
                    <Home {...sharedProps} homeSections={homeSections} stu={sow} />
                  </>
                } />
                <Route path="/movies" element={
                  <>
                    <Nav />
                    <Movie {...sharedProps} />
                  </>
                } />
                <Route path="/tv" element={
                  <>
                    <Nav />
                    <Tv {...sharedProps} />
                  </>
                } />
                <Route path="/search" element={
                  <>
                    <Nav />
                    <Search {...sharedProps} />
                  </>
                } />
                <Route path="/studio/:id" element={
                  <>
                    <Nav />
                    <Studio {...sharedProps} studio={studio} img={Img} />
                  </>
                } />
                <Route path="/profile" element={
                  <>
                    <Nav />
                    <Profile {...sharedProps} E={El} tu={sow} />
                  </>
                } />

                <Route path="/streaming/:tmdbId/:season/:episode" element={
                  <>
                    {/* <Nav /> */}
                    <Streaming />
                  </>
                } />
                <Route path="/streaming/:tmdbId" element={
                  <>
                    {/* <Nav /> */}
                    <Streaming />
                  </>
                } />
                <Route path="/viewall" element={
                  <>
                    <Nav />
                    <MovieViewAll {...sharedProps} sow={sow} />
                  </>
                } />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Router>
      )}

      {/* Premium Toast Notification */}
      <div
        className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-4 px-5 py-3 rounded-full shadow-2xl backdrop-blur-md border transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none
    ${toast.show
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-10 scale-90'
          }
    ${toast.isError
            ? 'bg-red-600/90 border-red-500/50 text-white shadow-red-600/20'
            : 'bg-zinc-900/90 border-zinc-700/50 text-white shadow-black/50'
          }`}
      >
        {/* Icon Container with subtle background */}
        <div
          className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition-transform duration-500 delay-100 ${toast.show ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'
            } ${toast.isError ? 'bg-white/20 text-white' : 'bg-green-500/20 text-green-400'
            }`}
        >
          <i className={`fa-solid text-sm ${toast.isError ? 'fa-xmark' : 'fa-check'}`}></i>
        </div>

        {/* Message */}
        <span className="font-medium tracking-wide text-sm whitespace-nowrap">
          {toast.message}
        </span>
      </div>
    </div>
  );
}

export default App;