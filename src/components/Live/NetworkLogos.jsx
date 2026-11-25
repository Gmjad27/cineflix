import React from 'react';

/**
 * High-fidelity, self-contained SVG logos matching the exact style in the reference image:
 * ESPN, NFL Network, ABC, ESPN 2, Willow Cricket, NBC, Fox Footy, Sky Sports, Sony Sports, etc.
 */
export const NetworkLogo = ({ name, network, className = 'h-8 sm:h-10 w-auto' }) => {
  const norm = `${name || ''} ${network || ''}`.toLowerCase();

  // ESPN 2
  if (norm.includes('espn 2') || norm.includes('espn2')) {
    return (
      <div className={`flex items-center justify-center font-black italic tracking-tighter ${className}`}>
        <span className="text-red-600 text-2xl sm:text-3xl drop-shadow-[0_2px_10px_rgba(220,38,38,0.5)]">
          ESPN<span className="text-white ml-1 text-xl sm:text-2xl not-italic font-extrabold">2</span>
        </span>
      </div>
    );
  }

  // ESPN
  if (norm.includes('espn')) {
    return (
      <div className={`flex items-center justify-center font-black italic tracking-tighter ${className}`}>
        <span className="text-red-600 text-2xl sm:text-3xl drop-shadow-[0_2px_10px_rgba(220,38,38,0.5)]">
          ESPN
        </span>
      </div>
    );
  }

  // NFL Network
  if (norm.includes('nfl')) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className="relative flex items-center justify-center">
          {/* NFL Shield */}
          <div className="w-8 h-9 sm:w-9 sm:h-10 bg-[#013369] rounded-b-xl border-2 border-white/90 flex flex-col items-center justify-center shadow-md">
            <span className="text-[7px] text-white font-bold leading-none">★ ★</span>
            <span className="text-red-600 text-[10px] font-black italic tracking-tight leading-none mt-0.5">NFL</span>
          </div>
        </div>
        <span className="text-white text-[9px] sm:text-[10px] font-black tracking-widest uppercase mt-1 drop-shadow">
          NETWORK
        </span>
      </div>
    );
  }

  // ABC
  if (norm.includes('abc')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center shadow-lg">
          <span className="text-black font-black text-xl sm:text-2xl tracking-tighter lowercase leading-none select-none font-sans">
            abc
          </span>
        </div>
      </div>
    );
  }

  // Willow Cricket
  if (norm.includes('willow')) {
    return (
      <div className={`flex items-center justify-center font-black tracking-wider ${className}`}>
        <span className="text-white text-xl sm:text-2xl flex items-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] font-sans">
          WILL<span className="relative inline-flex items-center justify-center mx-0.5">
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#dc2626] border-2 border-white shadow-sm inline-block" />
          </span>W
        </span>
      </div>
    );
  }

  // NBC
  if (norm.includes('nbc')) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        {/* Peacock Feathers */}
        <div className="flex items-end justify-center gap-0.5 h-6 sm:h-7">
          <span className="w-1.5 h-4 sm:h-5 rounded-full bg-[#f59e0b] -rotate-45 origin-bottom" />
          <span className="w-1.5 h-5 sm:h-6 rounded-full bg-[#ef4444] -rotate-20 origin-bottom" />
          <span className="w-1.5 h-6 sm:h-7 rounded-full bg-[#a855f7] origin-bottom" />
          <span className="w-1.5 h-6 sm:h-7 rounded-full bg-[#3b82f6] origin-bottom" />
          <span className="w-1.5 h-5 sm:h-6 rounded-full bg-[#10b981] rotate-20 origin-bottom" />
          <span className="w-1.5 h-4 sm:h-5 rounded-full bg-[#eab308] rotate-45 origin-bottom" />
        </div>
        <span className="text-white text-xs sm:text-sm font-black tracking-widest uppercase mt-0.5 drop-shadow">
          NBC
        </span>
      </div>
    );
  }

  // Fox Footy / Fox Sports
  if (norm.includes('fox footy') || norm.includes('footy')) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className="flex items-center gap-1">
          <span className="text-white text-base sm:text-lg font-black italic tracking-tighter">FOX</span>
          <span className="text-orange-400 font-extrabold text-xs sm:text-sm bg-orange-950/80 px-1.5 py-0.2 rounded border border-orange-500/30">
            504
          </span>
        </div>
        <span className="text-orange-400 text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
          FOOTY
        </span>
      </div>
    );
  }

  if (norm.includes('fox')) {
    return (
      <div className={`flex items-center justify-center font-black italic tracking-tighter ${className}`}>
        <span className="text-orange-500 text-xl sm:text-2xl drop-shadow">
          FOX <span className="text-white not-italic font-bold text-sm">SPORTS</span>
        </span>
      </div>
    );
  }

  // Sky Sports
  if (norm.includes('sky')) {
    return (
      <div className={`flex items-center justify-center font-black tracking-tight ${className}`}>
        <span className="text-sky-400 text-xl sm:text-2xl font-black italic drop-shadow">
          sky <span className="text-white not-italic font-bold text-sm tracking-widest">SPORTS</span>
        </span>
      </div>
    );
  }

  // Sony Sports / Sony
  if (norm.includes('sony')) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <span className="text-white text-base sm:text-lg font-black tracking-widest">SONY</span>
        <span className="text-blue-400 text-[9px] font-bold tracking-wider uppercase">SPORTS</span>
      </div>
    );
  }

  // Default Fallback
  return (
    <div className={`flex flex-col items-center justify-center text-center px-2 ${className}`}>
      <i className="fa-solid fa-satellite-dish text-red-500 text-base sm:text-lg mb-1 drop-shadow" />
      <span className="text-white text-xs sm:text-sm font-extrabold tracking-wide uppercase truncate max-w-[140px]">
        {name || 'Channel'}
      </span>
    </div>
  );
};

export default NetworkLogo;
