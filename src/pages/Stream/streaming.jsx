import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { saveContinueWatching, markEpisodeWatched } from '../../utils/continueWatching';

const Streaming = () => {
    const { tmdbId, season: urlSeason, episode: urlEpisode } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const state = location.state || {};
    const isTvShow = Boolean(urlSeason && urlEpisode);

    const [currentSeason, setCurrentSeason] = useState(urlSeason);
    const [currentEpisode, setCurrentEpisode] = useState(urlEpisode);

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

    const embedUrl = isTvShow
        ? `https://screenscape.me/embed?tmdb=${tmdbId}&type=tv&s=${currentSeason}&e=${currentEpisode}`
        : `https://screenscape.me/embed?tmdb=${tmdbId}&type=movie`;

    return (
        <div className="absolute inset-0 flex items-center justify-center h-[100%] w-[100%] pt-16 pb-16 sm:pt-0 sm:pb-0 overflow-hidden bg-black">

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
                    allow="accelerometer; autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope;"
                    title="Movie/TV Player"
                    sandbox="allow-scripts allow-same-origin allow-forms"
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