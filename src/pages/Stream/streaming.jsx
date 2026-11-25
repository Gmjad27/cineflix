import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { saveContinueWatching, markEpisodeWatched } from '../../utils/continueWatching';
import { PlayerSkeleton } from '../../components/Skeleton/Skeleton';
import { useNetworkStatus } from '../../context/NetworkContext';

const Streaming = () => {
    const { tmdbId, season: urlSeason, episode: urlEpisode } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isOnline, isWeak, isChecking, checkConnection, downlink, effectiveType } = useNetworkStatus();

    const state = location.state || {};
    const isTvShow = Boolean(urlSeason && urlEpisode);

    const [currentSeason, setCurrentSeason] = useState(urlSeason);
    const [currentEpisode, setCurrentEpisode] = useState(urlEpisode);
    const [streamLoaded, setStreamLoaded] = useState(false);

    useEffect(() => {
        const mobileQuery = window.matchMedia('(max-width: 767px) and (pointer: coarse)');
        const isMobile = mobileQuery.matches;
        const orientation = window.screen.orientation;

        if (!isMobile || !orientation?.lock) {
            return undefined;
        }

        orientation.lock('landscape').catch((error) => {
            console.warn('Landscape orientation lock is unavailable:', error);
        });

        return () => {
            if (orientation.unlock) {
                orientation.unlock();
            }
        };
    }, []);

    useEffect(() => {
        if (!tmdbId) return;

        saveContinueWatching({
            tmdbId,
            type: isTvShow ? 'tv' : (state.type || 'movie'),
            streamId: isTvShow ? `${tmdbId}/${currentSeason}/${currentEpisode}` : String(tmdbId),
            title: state.title || state.episodeName || 'Untitled',
            image: state.image || '',
            season: isTvShow ? currentSeason : undefined,
            episode: isTvShow ? currentEpisode : undefined,
        });

        if (isTvShow) {
            markEpisodeWatched(tmdbId, currentSeason, currentEpisode);
        }
    }, [tmdbId, currentSeason, currentEpisode, isTvShow, state]);

    // const embedUrl = isTvShow
    //     ? `https://screenscape.me/embed?tmdb=${tmdbId}&type=tv&s=${currentSeason}&e=${currentEpisode}`
    //     : `https://screenscape.me/embed?tmdb=${tmdbId}&type=movie`;

    // const embedUrl = isTvShow
    //     ? `https://embed.vidrift.net/embed/tv/${tmdbId}/${currentSeason}/${currentEpisode}?brand=GIRISH&hide=next,episodes&controlBg=solid`
    //     : `https://embed.vidrift.net/embed/movie/${tmdbId}?brand=GIRISH&hide=next,episodes&controlBg=solid`;

    // const embedUrl = isTvShow
    //     ? `https://vidbolt.xyz/tv/${tmdbId}/${currentSeason}/${currentEpisode}?theme=e50914&autoPlay=true&audio=hindi`
    //     : `https://vidbolt.xyz/movie/${tmdbId}?theme=e50914&autoPlay=true&audio=hindi`;

    // const embedUrl = isTvShow
    //     ? `https://vidout.pages.dev/tv/${tmdbId}/s${currentSeason}/e${currentEpisode}`
    //     : `https://vidout.pages.dev/movie/${tmdbId}`;

    // const embedUrl = isTvShow
    //     ? `https://streams.iqsmartgames.com/embed/tv/${tmdbId}/${currentSeason}/${currentEpisode}?key=e11a7debaaa4f5d25b671706ffe4d2acb56efbd4`
    //     : `https://streams.iqsmartgames.com/embed/movie/${tmdbId}?key=e11a7debaaa4f5d25b671706ffe4d2acb56efbd4`;

    const embedUrl = isTvShow
        ? `https://nxsha.space/embed/tv/${tmdbId}/${currentSeason}/${currentEpisode}?color=netflix&disable_app_ad=true&lang=hi`
        : `https://nxsha.space/embed/movie/${tmdbId}?color=netflix&disable_app_ad=true&lang=hi`;

    return (
        <div className="absolute inset-0 flex items-center justify-center h-full w-full overflow-hidden bg-[#07070a]">

            <button
                className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full glass-mirror text-white/80 hover:text-white flex items-center justify-center transition-all hover:scale-110 shadow-glass-md cursor-pointer"
                onClick={() => navigate(-1)}
                aria-label="Close Player"
                title="Back"
            >
                <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            {/* Weak Network Floating HUD Indicator */}
            {isOnline && isWeak && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/85 border border-amber-500/40 text-amber-200 text-xs font-semibold backdrop-blur-xl shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>Slow Connection {downlink ? `(~${downlink} Mbps)` : ''} • May Buffer</span>
                </div>
            )}

            {/* In-Player Offline Interruption Overlay */}
            {!isOnline && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/85 backdrop-blur-md text-white text-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center mb-4 text-[#E50914] shadow-[0_0_25px_rgba(229,9,20,0.5)]">
                        <i className="fa-solid fa-wifi-slash text-2xl animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">Playback Paused • Offline</h3>
                    <p className="text-sm text-gray-300 max-w-sm mb-5 leading-relaxed">
                        Internet connection lost. Reconnect your network to resume playback.
                    </p>
                    <button
                        type="button"
                        onClick={() => checkConnection()}
                        disabled={isChecking}
                        className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs tracking-wider transition-all shadow-[0_0_15px_rgba(229,9,20,0.4)] flex items-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                        <i className={`fa-solid fa-arrows-rotate text-xs ${isChecking ? 'animate-spin' : ''}`} />
                        <span>{isChecking ? 'Checking...' : 'Retry Connection'}</span>
                    </button>
                </div>
            )}

            {tmdbId ? (
                <>
                    {!streamLoaded && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center">
                            <PlayerSkeleton />
                        </div>
                    )}
                    <iframe
                        src={embedUrl}
                        className={`w-full h-full border-none transition-opacity duration-500 ${
                            streamLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        width="100%"
                        height="100%"
                        allowFullScreen
                        allow="accelerometer; autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope;"
                        title="Movie/TV Show Player"
                        sandbox="allow-scripts allow-same-origin"
                        onLoad={() => setStreamLoaded(true)}
                    />
                </>
            ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-500">
                    Invalid TMDB ID
                </div>
            )}
        </div>
    );
};

export default Streaming;