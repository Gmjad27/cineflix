import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import Card from '../../components/Card/Card';
import Watch from '../../components/Watch/Watch';

const MovieViewAll = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Page State
    const [items, setItems] = useState([]);
    const [pageTitle, setPageTitle] = useState('Full Library');

    // Watch Modal State
    const [watchOpen, setWatchOpen] = useState(false);
    const [watchItem, setWatchItem] = useState(null);

    // Combined lookup array (URL items + Global App Data)
    const combinedData = useMemo(() => {
        const appData = Array.isArray(props.data) ? props.data : [];
        return [...items, ...appData];
    }, [items, props.data]);

    // Parse items and title from URL
    useEffect(() => {
        const itemsParam = searchParams.get('items');
        const titleParam = searchParams.get('title');

        if (titleParam) {
            setPageTitle(titleParam);
        }

        if (itemsParam) {
            try {
                const parsedItems = JSON.parse(itemsParam);
                setItems(parsedItems);
            } catch (error) {
                console.error("Error parsing items from URL:", error);
                setItems([]);
            }
        }
    }, [searchParams]);

    // ==========================================
    // Watch Modal Logic
    // ==========================================
    const openWatch = useCallback((id) => {
        const selected = combinedData.find((item) => item.id === id);
        if (!selected) return;

        setWatchItem(selected);
        setWatchOpen(true);

        // Preserve existing URL params (items, title) while appending watch params
        const newParams = new URLSearchParams(searchParams);
        newParams.set('watch', selected.id);
        newParams.set('name', selected.name2);
        navigate(`${location.pathname}?${newParams.toString()}`);
    }, [combinedData, searchParams, navigate, location.pathname]);

    const clearWatchFromUrl = useCallback(() => {
        setWatchOpen(false);

        // Remove watch params but keep the page content params
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('watch');
        newParams.delete('name');
        navigate(`${location.pathname}?${newParams.toString()}`);
    }, [searchParams, navigate, location.pathname]);

    // Handle deep-linking directly to a watch modal inside ViewAll
    useEffect(() => {
        const watchId = Number(searchParams.get('watch'));
        if (!watchId) {
            setWatchOpen(false);
            return;
        }

        const selected = combinedData.find((item) => item.id === watchId);
        if (!selected) return;

        setWatchItem(selected);
        setWatchOpen(true);
    }, [searchParams, combinedData]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#E50914] selection:text-white pb-24">

            {/* ─── Cinematic Header ─── */}
            <header className="relative pt-24 pb-8 px-6 md:px-12 lg:px-16 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a24] via-[#0a0a0a] to-[#0a0a0a] border-b border-white/5">
                <div className="max-w-[1600px] mx-auto flex items-center gap-5 sm:gap-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-x-1 backdrop-blur-sm shadow-lg"
                        aria-label="Go back"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            width="22"
                            height="22"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-300 group-hover:text-white transition-colors"
                        >
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>

                    <div className="h-10 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent hidden sm:block"></div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight drop-shadow-sm truncate">
                        {pageTitle}
                    </h1>
                </div>
            </header>

            {/* ─── Grid Content ─── */}
            <main className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 pt-12">
                {items.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-x-4 gap-y-10 animate-[fadeIn_0.5s_ease-out]">
                        {items.map((item) => (
                            <div key={item.id} className="w-full flex justify-center transition-transform duration-300 hover:scale-105 hover:z-10">
                                <Card
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
                                    rating={item.rating}
                                    width="100%"
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    /* ─── Premium Empty State ─── */
                    <div className="flex flex-col items-center justify-center py-32 text-center animate-[fadeIn_0.5s_ease-out]">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10 shadow-inner">
                            <svg
                                className="w-12 h-12 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">No titles found</h2>
                        <p className="text-gray-400 text-lg max-w-md mb-10 font-light">
                            There are currently no titles available in this collection. Try exploring a different category or return home.
                        </p>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-all duration-200 shadow-lg shadow-white/10 active:scale-95"
                        >
                            Explore Something Else
                        </button>
                    </div>
                )}
            </main>

            {/* ─── Watch Modal ─── */}
            {watchOpen && watchItem && (
                <Watch
                    data={combinedData}
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
                    rating={watchItem?.rating}
                    language={watchItem?.language}
                    add={props.add}
                    e={props.e}
                    play={props.play}
                />
            )}
        </div>
    );
};

export default MovieViewAll;