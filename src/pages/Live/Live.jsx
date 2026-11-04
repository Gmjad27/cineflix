import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LiveSection from '../../components/Live/LiveSection';
import Footer from '../../components/Footer/Footer';
import {
  fetchLiveStreamsData,
  flattenLiveMatches,
  LIVE_TV_CHANNELS,
  formatViewerCount,
} from '../../content/liveStreams';

const Live = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetchLiveStreamsData();
        if (active) setData(res);
      } catch (err) {
        console.error('Error loading live streams page:', err);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const allMatches = useMemo(() => flattenLiveMatches(data), [data]);
  const featuredMatch = allMatches[0] || null;

  const handleOpenStream = (stream) => {
    navigate(`/live-stream/${stream.id}`, { state: { stream } });
  };

  return (
    <div className="relative min-h-screen bg-[#0e0e0e] text-white selection:bg-[#E50914] selection:text-white pt-[58px] md:pt-[82px]">
      {/* ===== HERO LIVE SHOWCASE ===== */}
      {featuredMatch && (
        <div className="relative w-full min-h-[380px] sm:min-h-[440px] md:min-h-[520px] flex items-center overflow-hidden bg-black">
          {/* Background backdrop without blur */}
          <img
            src={
              featuredMatch.poster ||
              'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1920&q=80'
            }
            alt={featuredMatch.name}
            className="absolute inset-0 w-full h-full object-cover brightness-[0.32]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e0e0e] via-[#0e0e0e]/85 to-transparent" />

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6 sm:py-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 w-full">
            <div className="flex flex-col space-y-3 sm:space-y-4 max-w-2xl w-full">
              {/* Badges */}
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                <span className="flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-red-600 text-white font-extrabold text-[10px] sm:text-xs tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  FEATURED LIVE
                </span>

                <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-white/10 text-[10px] sm:text-xs font-semibold text-gray-200 border border-white/10">
                  {featuredMatch.league || 'Championship Match'}
                </span>

                {featuredMatch.viewers > 0 && (
                  <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-black/80 text-[10px] sm:text-xs font-medium text-red-400 border border-white/10">
                    <i className="fa-solid fa-users text-[9px] sm:text-[10px]" />
                    {formatViewerCount(featuredMatch.viewers)} Watching
                  </span>
                )}
              </div>

              {/* Match Title */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {featuredMatch.name}
              </h1>

              {/* Teams Presentation Card */}
              {featuredMatch.teams?.home && featuredMatch.teams?.away && (
                <div className="flex items-center gap-2.5 sm:gap-5 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl bg-[#161616] border border-white/10 w-fit max-w-full">
                  <div className="flex items-center gap-2 min-w-0">
                    {featuredMatch.teams.home.badge && (
                      <img
                        src={featuredMatch.teams.home.badge}
                        alt={featuredMatch.teams.home.name}
                        className="w-7 h-7 sm:w-9 sm:h-9 object-contain shrink-0"
                      />
                    )}
                    <span className="font-bold text-xs sm:text-base text-white truncate max-w-[100px] sm:max-w-none">
                      {featuredMatch.teams.home.name}
                    </span>
                  </div>

                  <span className="text-[10px] sm:text-xs font-black text-red-500 bg-red-950/80 px-1.5 sm:px-2 py-0.5 rounded border border-red-500/40 shrink-0">
                    VS
                  </span>

                  <div className="flex items-center gap-2 min-w-0">
                    {featuredMatch.teams.away.badge && (
                      <img
                        src={featuredMatch.teams.away.badge}
                        alt={featuredMatch.teams.away.name}
                        className="w-7 h-7 sm:w-9 sm:h-9 object-contain shrink-0"
                      />
                    )}
                    <span className="font-bold text-xs sm:text-base text-white truncate max-w-[100px] sm:max-w-none">
                      {featuredMatch.teams.away.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 sm:gap-4 pt-1 sm:pt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleOpenStream(featuredMatch)}
                  className="flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-[#E50914] hover:bg-[#f40612] text-white font-extrabold text-xs sm:text-base transition-colors shadow-md"
                >
                  <i className="fa-solid fa-play text-xs" />
                  <span>WATCH LIVE NOW</span>
                </button>

                <div className="text-[11px] sm:text-xs text-gray-400 flex items-center gap-1.5">
                  <i className="fa-solid fa-shield-halved text-emerald-400" />
                  <span>Official Live Stadium Broadcast</span>
                </div>
              </div>
            </div>

            {/* Right Quick Channel Preview Cards */}
            <div className="hidden lg:flex flex-col gap-2.5 w-80 shrink-0 bg-[#141414] p-3.5 rounded-xl border border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <i className="fa-solid fa-satellite-dish text-red-500" />
                Live Sports Feeds
              </span>
              {LIVE_TV_CHANNELS.slice(0, 3).map((ch) => (
                <div
                  key={ch.id}
                  onClick={() =>
                    handleOpenStream({
                      id: ch.id,
                      name: ch.name,
                      embedUrl: ch.embed,
                      category_name: ch.category,
                      viewers: ch.viewers,
                      sources: [{ id: ch.id, name: ch.name, embed: ch.embed, hd: 1 }],
                    })
                  }
                  className="flex items-center gap-3 p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#222222] border border-white/5 hover:border-red-500/50 cursor-pointer transition-colors group"
                >
                  <div className="w-10 h-10 rounded bg-black p-1 flex items-center justify-center border border-white/10 shrink-0">
                    <img src={ch.badge} alt={ch.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
                      {ch.name}
                    </span>
                    <span className="text-[10px] text-gray-400 truncate">{ch.currentShow}</span>
                  </div>
                  <i className="fa-solid fa-play text-[10px] text-gray-400 group-hover:text-red-500 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== MAIN CONTENT RAILS ===== */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 space-y-6 sm:space-y-8 pb-24 md:pb-16">
        <LiveSection
          showChannels={true}
          title="Live Sports Matches"
          subtitle="Real-time multi-angle stadium broadcasts and matches"
        />

        <Footer />
      </div>
    </div>
  );
};

export default React.memo(Live);
