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
        <div className="min-h-screen bg-[#141414] text-white pt-24 px-6 md:px-12 lg:px-16 pb-16 font-sans selection:bg-[#E50914] selection:text-white">
            <div className="max-w-[1400px] mx-auto">
                {/* ─── Header ─── */}
                <header className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-12 pb-4 border-b border-[#2a2a2a]">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
                        aria-label="Go back"
                    >
                        <svg 
                            viewBox="0 0 24 24" 
                            width="24" 
                            height="24" 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                            fill="none" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className="transform group-hover:-translate-x-1.5 transition-transform duration-300"
                        >
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        <span className="hidden sm:inline text-sm font-bold uppercase tracking-wider">Back</span>
                    </button>
                    
                    <div className="h-6 w-px bg-gray-700 hidden sm:block"></div>
                    
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-md truncate">
                        {pageTitle}
                    </h1>
                </header>

                {/* ─── Grid Content ─── */}
                <div>
                    {items.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10 animate-[fadeIn_0.5s_ease-out]">
                            {items.map((item) => (
                                <div key={item.id} className="w-full flex justify-center">
                                    <Card
                                        sow={openWatch} // Now calls the local openWatch function
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
                        <div className="flex flex-col items-center justify-center py-32 text-center animate-[fadeIn_0.5s_ease-out]">
                            <i className="fa-regular fa-folder-open text-6xl text-gray-600 mb-4"></i>
                            <h2 className="text-2xl font-bold text-gray-300 mb-2">No items found</h2>
                            <p className="text-gray-500 max-w-md">
                                There are currently no titles available in this collection. Try going back and selecting a different category.
                            </p>
                            <button
                                onClick={() => navigate(-1)}
                                className="mt-8 px-8 py-3 bg-white text-black font-bold rounded hover:bg-gray-200 active:scale-95 transition"
                            >
                                Go Back
                            </button>
                        </div>
                    )}
                </div>
            </div>

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