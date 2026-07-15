import React, { useEffect, useState, lazy, Suspense } from "react";
import Nav from "./components/Nav/Nav";
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import "./App.css"; // Keep if you have global resets, otherwise Tailwind handles styling
import { fetchTMDBCatalog, fetchTMDBHomeSections } from "./content/tmdb.js";
import ErrorBoundary from "./components/ErrorBoundary";
import Skeleton from "./components/Skeleton/Skeleton";
import MovieViewAll from "./pages/ViewAll/MovieViewAll.jsx";

// ✅ Lazy-loaded page components
const Home = lazy(() => import("./pages/Home/Home"));
const Movie = lazy(() => import("./pages/Movies/Movie"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const Stream = lazy(() => import("./pages/Stream/Stream"));
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
  const [catalog, setCatalog] = useState([]);
  const [homeSections, setHomeSections] = useState({ heroBanner: [], rails: [] });
  const [catalogLoading, setCatalogLoading] = useState(true);

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', isError: false });

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

  // Helper to show toasts
  const showToast = (message, isError = false) => {
    setToast({ show: true, message, isError });
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setToast({ show: false, message: '', isError: false });
    }, 3000);
  };

  // ✅ React-way to handle "My List" additions/removals (No manual DOM manipulation)
  const add = (e) => {
    setEl(prevEl => {
      if (prevEl.includes(e)) {
        showToast('Removed from My List', true);
        return prevEl.filter(item => item !== e);
      } else {
        showToast('Added to My List', false);
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
    <div className="min-h-screen bg-[#141414] text-white font-sans selection:bg-[#E50914] selection:text-white relative">
      <Router>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}
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

              <Route path="/studio" element={
                <ProtectedRoute>
                  <Nav />
                  <Studio {...sharedProps} studio={studio} img={Img} />
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <Nav />
                  <Profile {...sharedProps} E={El} tu={sow} />
                </ProtectedRoute>
              } />

              <Route path="/stream" element={
                <ProtectedRoute>
                  <Nav />
                  <Stream tid={TID} />
                </ProtectedRoute>
              } />

              <Route path="/viewall" element={
                <ProtectedRoute>
                  <Nav />
                  <MovieViewAll {...sharedProps} sow={sow} />
                </ProtectedRoute>
              } />

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" />} />

            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Router>

      {/* ✅ Premium Netflix-style Toast Notification */}
      <div 
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded shadow-2xl transition-all duration-300 pointer-events-none flex items-center gap-3 ${
          toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        } ${
          toast.isError ? 'bg-[#E50914] text-white' : 'bg-white text-black font-semibold'
        }`}
      >
        <i className={`fa-solid ${toast.isError ? 'fa-xmark' : 'fa-check'}`}></i>
        {toast.message}
      </div>
    </div>
  );
}

export default App;