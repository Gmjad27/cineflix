import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './profile.module.css';
import Card from '../../components/Card/Card';
import Footer from '../../components/Footer/Footer';
import Watch from '../../components/Watch/Watch';
import Skeleton from '../../components/Skeleton/Skeleton';

const Profile = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = Array.isArray(props.data) ? props.data : [];
  const [watchItem, setWatchItem] = useState(data[0] || null);

  // 1. Convert user to state so the UI updates instantly when a picture is uploaded
  const [userData, setUserData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });

  // 2. Reference for the hidden file input
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!watchItem && data.length > 0) setWatchItem(data[0]);
  }, [data, watchItem]);

  const watchListItems = useMemo(() => {
    if (!Array.isArray(props.E)) return [];
    return data.filter((item) => props.E.includes(item.id));
  }, [data, props.E]);

  const movieItems = watchListItems.filter((item) => item.type === 'movie');
  const seriesItems = watchListItems.filter((item) => item.type === 'tv');

  // ==========================================
  // Image Upload Logic
  // ==========================================
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        
        // Update state
        const updatedUser = { ...userData, profilePic: base64String };
        setUserData(updatedUser);
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
      };
      
      // Read the file as a data URL (Base64)
      reader.readAsDataURL(file);
    }
  };

  const openWatch = (id) => {
    const selected = data.find((item) => item.id === id);
    if (!selected) return;

    setWatchItem(selected);
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
  }, [data, location.search]);

  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const renderRail = (items) => (
    <div className={styles.track}>
      {items.map((item) => (
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
        />
      ))}
    </div>
  );

  if (props.loading) {
    return <Skeleton type="card" count={6} />;
  }

  return (
    <>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.info}>
            
            {/* 3. Clickable Profile Picture Area */}
            <div 
              className={styles.p_img} 
              onClick={() => fileInputRef.current?.click()}
              title="Click to change profile picture"
              style={{
                backgroundImage: userData.profilePic ? `url(${userData.profilePic})` : '',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              {/* Show a camera icon if no picture is set yet */}
              {!userData.profilePic && (
                <i className="fa-solid fa-camera" style={{ color: '#fff', fontSize: '1.2rem', opacity: 0.8 }}></i>
              )}
            </div>

            {/* Hidden File Input */}
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleImageUpload} 
            />

            <div>
              <p className={styles.label}>PROFILE</p>
              <h1 className={styles.name}>{String(userData?.name || 'Guest')}</h1>
              <p className={styles.sub}>Manage your saved titles and continue watching.</p>
            </div>
          </div>

          <div className={styles.actions}>
            <div className={styles.stat}>
              <span>{watchListItems.length}</span>
              <p>Watchlist</p>
            </div>
            <div className={styles.stat}>
              <span>{movieItems.length}</span>
              <p>Movies</p>
            </div>
            <div className={styles.stat}>
              <span>{seriesItems.length}</span>
              <p>Series</p>
            </div>
            <button type="button" className={styles.logout} onClick={logout}>
              Logout
            </button>
          </div>
        </section>

        {watchListItems.length === 0 ? (
          <section className={styles.empty}>
            <h2>Your watchlist is empty</h2>
            <p>Add titles from Home, Movies, TV, or Search to see them here.</p>
            <button type="button" onClick={() => navigate('/search')}>
              Explore Titles
            </button>
          </section>
        ) : (
          <div className={styles.rails}>
            {movieItems.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.heading}>Saved Movies</h2>
                {renderRail(movieItems)}
              </section>
            )}

            {seriesItems.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.heading}>Saved Series</h2>
                {renderRail(seriesItems)}
              </section>
            )}

            <section className={styles.section}>
              <h2 className={styles.heading}>All Watchlist</h2>
              {renderRail(watchListItems)}
            </section>
          </div>
        )}

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
      </div>
      <Footer />
    </>
  );
};

export default Profile;
