import React, { useEffect, useState, lazy, Suspense } from "react";
import Nav from "./components/Nav/Nav";
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import "./App.css";
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
const Watch = lazy(() => import("./pages/Watch/Watch"));
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
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#0a0a0a',
      color: '#fff',
      fontSize: '1rem',
      letterSpacing: '0.1em',
      opacity: 0.6,
    }}>
      Loading...
    </div>
  );
}

function App() {
  const [catalog, setCatalog] = useState([]);
  const [homeSections, setHomeSections] = useState({ heroBanner: [], rails: [] });
  const [catalogLoading, setCatalogLoading] = useState(true);

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
  useEffect(() => { localStorage.setItem('El', JSON.stringify(El)); }, [El]);

  const add = (e) => {
    setEl(prevEl => {
      if (prevEl.includes(e)) {
        document.getElementById('alert-r')?.classList.add('show');
        setTimeout(() => document.getElementById('alert-r')?.classList.remove('show'), 2000);
        return prevEl.filter(item => item !== e);
      } else {
        document.getElementById('alert')?.classList.add('show');
        setTimeout(() => document.getElementById('alert')?.classList.remove('show'), 2000);
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
  useEffect(() => { localStorage.setItem('TID', JSON.stringify(TID)); }, [TID]);
  const play = (tid) => setTID(tid);

  const sharedProps = { data: catalog, loading: catalogLoading, add, e: El, play };

  return (
    <>
      {/* <div className="img">
        <p className="author">Jadav Girish</p>
      </div> */}

      <Router>
        <ErrorBoundary>
          <Suspense fallback={<Skeleton type="section" count={6} />}>
            <Routes>

              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route path="/" element={
                <ProtectedRoute><><Nav />
                  <Home {...sharedProps} homeSections={homeSections} stu={sow} />
                </></ProtectedRoute>
              } />

              <Route path="/movies" element={
                <ProtectedRoute><><Nav /><Movie {...sharedProps} /></></ProtectedRoute>
              } />

              <Route path="/tv" element={
                <ProtectedRoute><><Nav /><Tv {...sharedProps} /></></ProtectedRoute>
              } />

              <Route path="/search" element={
                <ProtectedRoute><><Nav /><Search {...sharedProps} /></></ProtectedRoute>
              } />

              <Route path="/studio" element={
                <ProtectedRoute><><Nav />
                  <Studio {...sharedProps} studio={studio} img={Img} />
                </></ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute><><Nav />
                  <Profile {...sharedProps} E={El} tu={sow} />
                </></ProtectedRoute>
              } />

              <Route path="/stream" element={
                <ProtectedRoute><Nav ></Nav><Stream tid={TID} /></ProtectedRoute>
              } />
              <Route path="/viewall" element={
                <ProtectedRoute><><Nav />
                  <MovieViewAll {...sharedProps} sow={sow} />
                </></ProtectedRoute>
              } />
              <Route path="/watch" element={
                <ProtectedRoute><><Nav />
                  <Watch {...sharedProps} />
                </></ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" />} />

            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Router>

      <div id="alert" className="alert">Added to Watch List</div>
      <div id="alert-r" className="alert" style={{ backgroundColor: '#730000b5' }}>Removed from Watch List</div>
    </>
  );
}

export default App;
