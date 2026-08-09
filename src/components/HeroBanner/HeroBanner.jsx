import React from 'react';

function HeroBanner({ mediaData, currentHero, heroIndex, setHeroIndex, openWatch }) {
    if (!currentHero) return null;

    return (
        <section className="relative w-full h-[75vh] sm:h-[85vh] md:h-[90vh] lg:h-[100vh] overflow-hidden bg-black">
            <div className="absolute inset-0">
                <div
                    className="absolute inset-0 bg-cover bg-center block md:hidden transition-opacity duration-1000 ease-in-out"
                    style={currentHero?.name ? { backgroundImage: `url(${currentHero.name})` } : undefined}
                />
                <div
                    className="absolute inset-0 bg-cover bg-center hidden md:block transition-opacity duration-1000 ease-in-out"
                    style={currentHero?.img ? { backgroundImage: `url(${currentHero.img})` } : undefined}
                />
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-[#141414]/40 to-transparent w-[80%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent bottom-0 h-[100%]" />

            <div className="absolute bottom-[10%] sm:bottom-[15%] left-0 w-full px-6 md:px-12 lg:px-16 flex flex-col items-start gap-4 z-10 max-w-[90%] md:max-w-[50%]">
                {currentHero?.nameImg2 ? (
                    <img
                        src={currentHero.nameImg2}
                        alt={currentHero.name2}
                        className="max-w-[200px] md:max-w-[400px] lg:max-w-[500px] object-contain drop-shadow-2xl mb-2"
                    />
                ) : (
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight drop-shadow-2xl line-clamp-2">
                        {currentHero?.name2}
                    </h1>
                )}

                <div className="flex items-center gap-3 drop-shadow-md">
                    <span className="flex items-center justify-center font-bold text-[#E50914] text-2xl md:text-4xl">
                        N
                    </span>
                    <span className="text-gray-300 font-semibold tracking-wide text-xs sm:text-sm uppercase flex items-center gap-2">
                        <span className="text-white">Film</span>
                    </span>
                </div>

                <h2 className="text-xl md:text-2xl font-bold drop-shadow-md flex items-center gap-2">
                    <span className="bg-[#E50914] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">TOP 10</span>
                    #{heroIndex + 1} in Trending Today
                </h2>

                <p className="hidden md:block text-base lg:text-lg text-gray-200 drop-shadow-lg line-clamp-3 leading-snug text-shadow-md">
                    {currentHero?.desc}
                </p>

                <div className="mt-4 flex gap-3 sm:gap-4 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={() => openWatch(currentHero?.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 sm:px-8 py-2 md:py-2.5 bg-[#6d6d6e]/70 text-white font-bold text-sm md:text-xl rounded hover:bg-[#6d6d6e] active:scale-95 transition backdrop-blur-sm"
                        title="More Info"
                    >
                        <i className="fa-solid fa-circle-info"></i>
                        More Info
                    </button>
                </div>
            </div>

            <div className="absolute bottom-6 md:bottom-10 left-0 w-full flex justify-center gap-2 z-10">
                {mediaData.slice(0, 5).map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        className={`h-1 rounded-full transition-all duration-300 ${heroIndex % 5 === i ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/70 w-3'}`}
                        onClick={() => setHeroIndex(i)}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}

export default React.memo(HeroBanner);