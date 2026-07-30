import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { saveContinueWatching, markEpisodeWatched } from '../../utils/continueWatching';

const Streaming = () => {
    // Extract URL parameters passed by React Router
    const { tmdbId, season: urlSeason, episode: urlEpisode } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Optional context passed via navigate(path, { state }) from Watch.jsx
    const state = location.state || {};

    // Determine if it's a TV show
    const isTvShow = Boolean(urlSeason && urlEpisode);

    // ==========================================
    // ADDED: Use local state instead of route navigation
    // ==========================================
    const [currentSeason, setCurrentSeason] = useState(urlSeason);
    const [currentEpisode, setCurrentEpisode] = useState(urlEpisode);

    // Persist "Continue Watching" + "watched episode" state whenever the local state changes.
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tmdbId, currentSeason, currentEpisode, isTvShow]);

    // Construct the iframe source URL based on local state
    const embedUrl = isTvShow
        ? `https://screenscape.me/embed?tmdb=${tmdbId}&type=tv&s=${currentSeason}&e=${currentEpisode}&lan=hindi`
        : `https://screenscape.me/embed?tmdb=${tmdbId}&type=movie&lan=hindi`;



    return (
        <div className="relative flex items-center justify-center h-[100%] w-[100%] overflow-hidden bg-black">

            {/* ─── Top Right Controls (Only for TV Shows) ─── */}
            <button
                className="absolute top-4 right-4 z-10 bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                onClick={() => navigate(-1)}
            >
                X
            </button>

            {tmdbId ? (
                <iframe
                    src={embedUrl}
                    className="w-full border-none"
                    width="100%"
                    height="100%"
                    allowFullScreen
                    allow="accelerometer; autoplay; fullscreen; picture-in-picture encrypted-media; gyroscope;"
                    title="Movie/TV Player"
                ></iframe>
            ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-500">
                    Invalid TMDB ID
                </div>
            )}
        </div>
    );
};

export default Streaming;