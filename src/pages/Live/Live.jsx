import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LiveSection from '../../components/Live/LiveSection';
import Footer from '../../components/Footer/Footer';
import { LIVE_CHANNELS, formatViewerCount } from '../../content/liveStreams';

const Live = () => {
  const navigate = useNavigate();

  const featuredChannel = useMemo(() => {
    return LIVE_CHANNELS[0] || null;
  }, []);

  const handleOpenStream = (channel) => {
    navigate(`/live-stream/${channel.streamId || channel.id}`, {
      state: { stream: channel },
    });
  };

  return (
    <div className="relative min-h-screen bg-[#0e0e0e] text-white selection:bg-[#E50914] selection:text-white pt-[58px] md:pt-[82px]">
      {/* ===== HERO LIVE SHOWCASE ===== */}
      {featuredChannel && (
        <div className="relative w-full min-h-[380px] sm:min-h-[440px] md:min-h-[500px] flex items-center overflow-hidden bg-black">
          {/* Background backdrop */}
          <img
            src={
              featuredChannel.bg ||
              'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1920&q=80'
            }
            alt={featuredChannel.name}
            className="absolute inset-0 w-full h-full object-cover brightness-[0.3]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e0e0e] via-[#0e0e0e]/85 to-transparent" />

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6 sm:py-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 w-full">
            <div className="flex flex-col space-y-3 sm:space-y-4 max-w-2xl w-full">
              {/* Badges */}
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-600 text-white font-extrabold text-[10px] sm:text-xs tracking-wider uppercase shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  FEATURED LIVE CHANNEL
                </span>

                <span className="px-2.5 py-1 rounded bg-white/10 text-[10px] sm:text-xs font-semibold text-gray-200 border border-white/10">
                  {featuredChannel.category}
                </span>

                <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/80 text-[10px] sm:text-xs font-medium text-red-400 border border-white/10">
                  <i className="fa-solid fa-users text-[10px]" />
                  {formatViewerCount(featuredChannel.viewers)} Watching
                </span>
              </div>

              {/* Channel Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {featuredChannel.name}
              </h1>

              <p className="text-sm sm:text-base text-gray-300 max-w-xl">
                {featuredChannel.currentShow || '24/7 Live Sports Broadcast'} - Stream in HD with instant live feed access.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 sm:gap-4 pt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleOpenStream(featuredChannel)}
                  className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg bg-[#E50914] hover:bg-[#f40612] text-white font-extrabold text-xs sm:text-base transition-colors shadow-lg shadow-red-900/40"
                >
                  <i className="fa-solid fa-play text-xs" />
                  <span>WATCH LIVE NOW</span>
                </button>

                <div className="text-[11px] sm:text-xs text-gray-400 flex items-center gap-1.5">
                  <i className="fa-solid fa-satellite-dish text-red-500" />
                  <span>Stream #{featuredChannel.streamId} 24/7</span>
                </div>
              </div>
            </div>

            {/* Right Quick Channel Preview Cards */}
            <div className="hidden lg:flex flex-col gap-2.5 w-80 shrink-0 bg-[#141414] p-3.5 rounded-xl border border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <i className="fa-solid fa-satellite-dish text-red-500" />
                Live Sports Channels
              </span>
              {LIVE_CHANNELS.slice(1, 5).map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => handleOpenStream(ch)}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#222222] border border-white/5 hover:border-red-500/50 cursor-pointer transition-colors group"
                >
                  <div className="w-10 h-10 rounded bg-black p-1 flex items-center justify-center border border-white/10 shrink-0">
                    {ch.badge ? (
                      <img src={ch.badge} alt={ch.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <i className="fa-solid fa-tv text-xs text-red-500" />
                    )}
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
          title="Live Sports Channels"
          subtitle="Watch 24/7 live sports channels including Sony, Willow, Sky, TNT & Fox"
        />

        <Footer />
      </div>
    </div>
  );
};

export default React.memo(Live);
