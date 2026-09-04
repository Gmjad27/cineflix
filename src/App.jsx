import React, { useEffect, useState, lazy, Suspense } from "react";
import Nav from "./components/Nav/Nav";
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import "./App.css";
import { fetchTMDBCatalog, fetchTMDBHomeSections } from "./content/tmdb.js";
import ErrorBoundary from "./components/ErrorBoundary";
import MovieViewAll from "./pages/ViewAll/MovieViewAll.jsx";
import ScrollToTop from "./components/ScrollToTop";

const Home = lazy(() => import("./pages/Home/Home"));
const Movie = lazy(() => import("./pages/Movies/Movie"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const Streaming = lazy(() => import("./pages/Stream/streaming.jsx"));
const Tv = lazy(() => import("./pages/TV/Tv"));
const Search = lazy(() => import("./pages/Search/Search"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Signup = lazy(() => import("./pages/Auth/Signup"));
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

  // ✅ New state to handle smooth fade-out of the intro
  const [introFading, setIntroFading] = useState(false);

  const [catalog, setCatalog] = useState([]);
  const [homeSections, setHomeSections] = useState({ heroBanner: [], rails: [] });
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', isError: false });

  // 🎬 Intro Animation Logic
  useEffect(() => {
    if (showIntro) {
      sessionStorage.setItem('hasSeenIntro', 'true');

      const fadeTimer = setTimeout(() => {
        setIntroFading(true);
      }, 3500);

      const removeTimer = setTimeout(() => {
        setShowIntro(false);
      }, 4500);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
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
    <div className="h-[100vh] bg-[#141414] text-white font-sans selection:bg-[#E50914] selection:text-white relative">

      {/* ✅ Netflix-style animated intro (bars converge, logo flashes in) */}
      {showIntro ? (
        <div
          className={`fixed inset-0 z-[10000] bg-black flex items-center justify-center overflow-hidden transition-opacity duration-700 ease-in-out ${introFading ? "opacity-0" : "opacity-100"
            }`}
        >
          {/* Vertical Colorful Bars - Left Side */}
          <div className="absolute left-0 top-0 h-full flex">
            <div className="bar-v bar-v-1"></div>
            <div className="bar-v bar-v-2"></div>
            <div className="bar-v bar-v-3"></div>
            <div className="bar-v bar-v-4"></div>
            <div className="bar-v bar-v-5"></div>
            <div className="bar-v bar-v-6"></div>
            <div className="bar-v bar-v-7"></div>
            <div className="bar-v bar-v-8"></div>
          </div>

          {/* Vertical Colorful Bars - Right Side */}
          <div className="absolute right-0 top-0 h-full flex">
            <div className="bar-v bar-v-9"></div>
            <div className="bar-v bar-v-10"></div>
            <div className="bar-v bar-v-11"></div>
            <div className="bar-v bar-v-12"></div>
            <div className="bar-v bar-v-13"></div>
            <div className="bar-v bar-v-14"></div>
            <div className="bar-v bar-v-15"></div>
            <div className="bar-v bar-v-16"></div>
          </div>

          {/* Center Red Glow */}
          <div className="netflix-center-glow"></div>

          {/* Logo Container */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* CineFlix Logo */}
            <h1 className="netflix-logo text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-[0.25em]">
              CineFlix
            </h1>

            {/* Tagline */}
            <p className="netflix-tagline text-xs md:text-sm text-gray-400 tracking-[0.5em] uppercase mt-4">
              Unlimited Entertainment
            </p>
          </div>

          <style>{`
      /* Base bar styles */
      .bar-v {
        width: 50px;
        height: 100%;
        opacity: 0;
        transform: scaleY(0);
        transform-origin: center;
      }

      /* Left side bars - Warm colors */
      .bar-v-1 { 
        background: linear-gradient(180deg, #8B0000 0%, #DC143C 50%, #8B0000 100%); 
        animation: bar-vertical-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0s forwards;
      }
      .bar-v-2 { 
        background: linear-gradient(180deg, #DC143C 0%, #FF4500 50%, #DC143C 100%); 
        animation: bar-vertical-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.05s forwards;
      }
      .bar-v-3 { 
        background: linear-gradient(180deg, #FF4500 0%, #FF6347 50%, #FF4500 100%); 
        animation: bar-vertical-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.1s forwards;
      }
      .bar-v-4 { 
        background: linear-gradient(180deg, #FFD700 0%, #FFA500 50%, #FFD700 100%); 
        animation: bar-vertical-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.15s forwards;
      }
      .bar-v-5 { 
        background: linear-gradient(180deg, #32CD32 0%, #00FF00 50%, #32CD32 100%); 
        animation: bar-vertical-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
      }
      .bar-v-6 { 
        background: linear-gradient(180deg, #00CED1 0%, #00FFFF 50%, #00CED1 100%); 
        animation: bar-vertical-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.25s forwards;
      }
      .bar-v-7 { 
        background: linear-gradient(180deg, #FF1493 0%, #FF69B4 50%, #FF1493 100%); 
        animation: bar-vertical-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards;
      }
      .bar-v-8 { 
        background: linear-gradient(180deg, #C71585 0%, #DB7093 50%, #C71585 100%); 
        animation: bar-vertical-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.35s forwards;
      }

      /* Right side bars - Cool colors */
      .bar-v-9 { 
        background: linear-gradient(180deg, #4169E1 0%, #6495ED 50%, #4169E1 100%); 
        animation: bar-vertical-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards;
      }
      .bar-v-10 { 
        background: linear-gradient(180deg, #1E90FF 0%, #87CEEB 50%, #1E90FF 100%); 
        animation: bar-vertical-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.45s forwards;
      }
      .bar-v-11 { 
        background: linear-gradient(180deg, #00BFFF 0%, #ADD8E6 50%, #00BFFF 100%); 
        animation: bar-vertical-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.5s forwards;
      }
      .bar-v-12 { 
        background: linear-gradient(180deg, #191970 0%, #4169E1 50%, #191970 100%); 
        animation: bar-vertical-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.55s forwards;
      }
      .bar-v-13 { 
        background: linear-gradient(180deg, #4B0082 0%, #8A2BE2 50%, #4B0082 100%); 
        animation: bar-vertical-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s forwards;
      }
      .bar-v-14 { 
        background: linear-gradient(180deg, #800080 0%, #BA55D3 50%, #800080 100%); 
        animation: bar-vertical-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.65s forwards;
      }
      .bar-v-15 { 
        background: linear-gradient(180deg, #9932CC 0%, #DA70D6 50%, #9932CC 100%); 
        animation: bar-vertical-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.7s forwards;
      }
      .bar-v-16 { 
        background: linear-gradient(180deg, #9400D3 0%, #DDA0DD 50%, #9400D3 100%); 
        animation: bar-vertical-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.75s forwards;
      }

      @keyframes bar-vertical-in {
        0% {
          opacity: 0;
          transform: scaleY(0);
        }
        50% {
          opacity: 1;
          transform: scaleY(1.2);
        }
        100% {
          opacity: 0.9;
          transform: scaleY(1);
        }
      }

      /* Center red glow effect */
      .netflix-center-glow {
        position: absolute;
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, rgba(229,9,20,0.5) 0%, rgba(229,9,20,0.2) 40%, transparent 70%);
        border-radius: 50%;
        opacity: 0;
        animation: center-glow-pulse 1.5s ease-out 1s forwards;
      }

      @keyframes center-glow-pulse {
        0% {
          opacity: 0;
          transform: scale(0.5);
        }
        50% {
          opacity: 1;
          transform: scale(1.2);
        }
        100% {
          opacity: 0.6;
          transform: scale(1);
        }
      }

      /* Netflix-style Logo */
      .netflix-logo {
        color: #E50914;
        text-shadow: 0 0 50px rgba(229,9,20,0.8), 0 0 100px rgba(229,9,20,0.4);
        opacity: 0;
        transform: scale(0.3) rotateX(90deg);
        filter: blur(10px);
        animation: logo-netflix-reveal 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.2s forwards;
      }

      @keyframes logo-netflix-reveal {
        0% {
          opacity: 0;
          transform: scale(0.2) rotateX(90deg) translateY(50px);
          filter: blur(20px);
          letter-spacing: 0.5em;
        }
        40% {
          opacity: 1;
          transform: scale(1.15) rotateX(10deg) translateY(0);
          filter: blur(0px);
          letter-spacing: 0.3em;
        }
        70% {
          transform: scale(0.95) rotateX(-5deg);
          letter-spacing: 0.22em;
        }
        100% {
          opacity: 1;
          transform: scale(1) rotateX(0deg);
          filter: blur(0px);
          letter-spacing: 0.25em;
        }
      }

      /* Tagline animation */
      .netflix-tagline {
        opacity: 0;
        transform: translateY(20px);
        animation: tagline-fade-in 0.8s ease-out 2s forwards;
      }

      @keyframes tagline-fade-in {
        0% {
          opacity: 0;
          transform: translateY(20px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Flash effect behind logo */
      .netflix-logo::before {
        content: '';
        position: absolute;
        inset: -100px;
        background: radial-gradient(circle, rgba(229,9,20,0.6) 0%, transparent 70%);
        opacity: 0;
        animation: logo-flash 0.5s ease-out 1.4s forwards;
        z-index: -1;
      }

      @keyframes logo-flash {
        0% {
          opacity: 0;
          transform: scale(0.5);
        }
        50% {
          opacity: 1;
          transform: scale(1.5);
        }
        100% {
          opacity: 0;
          transform: scale(2);
        }
      }
    `}</style>
        </div>
      ) : (
        // Your existing Router code here
        <Router>
          <ScrollToTop />
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route path="/" element={
                  <ProtectedRoute>
                    <Nav />
                    <Home {...sharedProps} homeSections={homeSections} stu={sow} />
                  </ProtectedRoute>
                } />
                <Route path="/movies" element={
                  <ProtectedRoute>
                    <Nav />
                    <Movie {...sharedProps} />
                  </ProtectedRoute>
                } />
                <Route path="/tv" element={
                  <ProtectedRoute>
                    <Nav />
                    <Tv {...sharedProps} />
                  </ProtectedRoute>
                } />
                <Route path="/search" element={
                  <ProtectedRoute>
                    <Nav />
                    <Search {...sharedProps} />
                  </ProtectedRoute>
                } />
                <Route path="/studio/:id" element={
                  <ProtectedRoute>
                    <Nav />
                    <Studio {...sharedProps} studio={studio} img={Img} />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Nav />
                    <Profile {...sharedProps} E={El} stu={sow} />
                  </ProtectedRoute>
                } />
                <Route path="/streaming/:tmdbId/:season/:episode" element={
                  <ProtectedRoute>
                    {/* <Nav /> */}
                    <Streaming />
                  </ProtectedRoute>
                } />
                <Route path="/streaming/:tmdbId" element={
                  <ProtectedRoute>
                    {/* <Nav /> */}
                    <Streaming />
                  </ProtectedRoute>
                } />
                <Route path="/viewall" element={
                  <ProtectedRoute>
                    <Nav />
                    <MovieViewAll {...sharedProps} sow={sow} />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Router>
      )
      }

      {/* Toast Notification */}
      <div
        className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl backdrop-blur-md border transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none
    ${toast.show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}
    ${toast.isError
            ? 'bg-zinc-900/95 border-[#E50914]/50 text-white shadow-[#E50914]/20'
            : 'bg-zinc-900/95 border-green-500/50 text-white shadow-green-500/20'
          }`}
      >
        <div className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${toast.isError ? 'bg-[#E50914]/20 text-[#E50914]' : 'bg-green-500/20 text-green-400'
          }`}>
          <i className={`fa-solid text-xs ${toast.isError ? 'fa-xmark' : 'fa-check'}`}></i>
        </div>
        <span className="font-medium tracking-wide text-sm whitespace-nowrap">
          {toast.message}
        </span>
      </div>
    </div >
  );
}

export default App;