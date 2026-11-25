import React, { useEffect, useState, useCallback, lazy, Suspense } from "react";
import Nav from "./components/Nav/Nav";
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import "./App.css";
import { fetchTMDBCatalog, fetchTMDBHomeSections } from "./content/tmdb.js";
import ErrorBoundary from "./components/ErrorBoundary";
import MovieViewAll from "./pages/ViewAll/MovieViewAll.jsx";
import ScrollToTop from "./components/ScrollToTop";
import PWAInstallPrompt from "./components/PWAInstallPrompt/PWAInstallPrompt";
import { NetworkProvider, useNetworkStatus } from "./context/NetworkContext";
import NetworkStatusAlert from "./components/NetworkStatus/NetworkStatusAlert";


const Home = lazy(() => import("./pages/Home/Home"));
const Movie = lazy(() => import("./pages/Movies/Movie"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const Streaming = lazy(() => import("./pages/Stream/streaming.jsx"));
const LiveStreaming = lazy(() => import("./pages/Stream/LiveStreaming.jsx"));
const Tv = lazy(() => import("./pages/TV/Tv"));
const Live = lazy(() => import("./pages/Live/Live"));
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#07070a] text-white">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-white/10 border-t-[#E50914] animate-spin shadow-[0_0_20px_rgba(229,9,20,0.5)]"></div>
        <span className="absolute font-black text-[#E50914] text-lg">C</span>
      </div>
      <div className="text-xs tracking-[0.3em] uppercase font-semibold text-gray-400 animate-pulse mt-4">
        Loading CineFlix...
      </div>
    </div>
  );
}

function AppContent() {
  const { isOnline, wasOffline } = useNetworkStatus();

  const [introPlaying, setIntroPlaying] = useState(() => {
    if (sessionStorage.getItem('hasSeenIntro')) {
      return false;
    }

    sessionStorage.setItem('hasSeenIntro', 'true');
    return true;
  });

  const [catalog, setCatalog] = useState([]);
  const [homeSections, setHomeSections] = useState({ heroBanner: [], rails: [] });
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', isError: false });

  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    try {
      const [items, sections] = await Promise.all([
        fetchTMDBCatalog({ moviePages: 3, tvPages: 3 }),
        fetchTMDBHomeSections(),
      ]);
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
    } catch (error) {
      console.error("Failed to load TMDB catalog:", error);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  // When returning online and catalog is currently empty, automatically refresh
  useEffect(() => {
    if (wasOffline && catalog.length === 0) {
      loadCatalog();
    }
  }, [wasOffline, catalog.length, loadCatalog]);

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

  const sharedProps = { data: catalog, loading: catalogLoading, add, e: El, play, onRetryCatalog: loadCatalog, isOnline };

  return (
    <div className="h-full bg-[#07070a] text-white font-sans relative min-h-dvh">

      

      {introPlaying && (
        <div className="fixed inset-0 z-[10000] w-screen h-screen overflow-hidden bg-black">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="/intro.mp4"
            autoPlay
            muted
            playsInline
            onEnded={() => setIntroPlaying(false)}
            onError={() => setIntroPlaying(false)}
          />
        </div>
      )}

      {/* Global Network Status Alert (No Internet / Weak Internet / Back Online) */}
      <NetworkStatusAlert />

      {
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
                <Route path="/live" element={
                  <ProtectedRoute>
                    <Nav />
                    <Live {...sharedProps} />
                  </ProtectedRoute>
                } />
                <Route path="/sports" element={<Navigate to="/live" replace />} />
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
                <Route path="/live-stream/:streamId" element={<ProtectedRoute><LiveStreaming /></ProtectedRoute>} />
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
      }

      {/* Toast Notification */}
      <PWAInstallPrompt />
      <div
        className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl backdrop-blur-2xl border transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none
    ${toast.show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}
    ${toast.isError
            ? 'bg-[#0f0709]/90 border-[#E50914]/50 text-white shadow-[0_10px_30px_rgba(229,9,20,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)]'
            : 'bg-[#070f0a]/90 border-emerald-500/50 text-white shadow-[0_10px_30px_rgba(16,185,129,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)]'
          }`}
      >
        <div className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${toast.isError ? 'bg-[#E50914]/25 text-[#E50914] shadow-[0_0_10px_#E50914]' : 'bg-emerald-500/25 text-emerald-400 shadow-[0_0_10px_#10b981]'
          }`}>
          <i className={`fa-solid text-xs ${toast.isError ? 'fa-xmark' : 'fa-check'}`}></i>
        </div>
        <span className="font-semibold tracking-wide text-xs sm:text-sm whitespace-nowrap">
          {toast.message}
        </span>
      </div>
    </div >
  );
}

export default function App() {
  return (
    <NetworkProvider>
      <AppContent />
    </NetworkProvider>
  );
}