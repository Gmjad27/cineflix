import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import RailRow from '../RailRow/RailRow';
import LiveTVCard from './LiveTVCard';
import { LIVE_CHANNELS } from '../../content/liveStreams';

const LiveSection = ({
  title = 'Live Sports Channels',
  subtitle = 'Watch 24/7 live sports channels with live streaming',
}) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Channels' },
    { id: 'cricket', label: 'Cricket' },
    { id: 'sony', label: 'Sony Sports' },
    { id: 'sky', label: 'Sky Sports' },
    { id: 'tnt', label: 'TNT Sports' },
    { id: 'fox', label: 'Fox Sports' },
  ];

  const filteredChannels = useMemo(() => {
    return LIVE_CHANNELS.filter((ch) => {
      // Category match
      let matchesCategory = true;
      if (selectedCategory === 'cricket') {
        matchesCategory =
          ch.category.toLowerCase().includes('cricket') ||
          ch.name.toLowerCase().includes('cricket') ||
          ch.network === 'Willow' ||
          ch.network === 'Astro';
      } else if (selectedCategory === 'sony') {
        matchesCategory = ch.network === 'Sony Sports';
      } else if (selectedCategory === 'sky') {
        matchesCategory = ch.network === 'Sky Sports';
      } else if (selectedCategory === 'tnt') {
        matchesCategory = ch.network === 'TNT Sports';
      } else if (selectedCategory === 'fox') {
        matchesCategory = ch.network === 'Fox Sports';
      }

      // Search match
      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        matchesSearch =
          ch.name.toLowerCase().includes(q) ||
          ch.category.toLowerCase().includes(q) ||
          ch.network.toLowerCase().includes(q) ||
          String(ch.streamId).includes(q);
      }

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleOpenStream = (channel) => {
    navigate(`/live-stream/${channel.streamId || channel.id}`, {
      state: { stream: channel },
    });
  };

  return (
    <section className="relative z-20 flex flex-col space-y-4 my-4 sm:my-6">
      {/* ── Top Bar: Subtitle & Network Filter Pills & Search ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-2 md:px-0">
        <div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-400 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* Filter Pills & Quick Search */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap overflow-x-auto scrollbar-none pb-1">
          {/* Search box */}
          <div className="relative flex items-center">
            <i className="fa-solid fa-magnifying-glass absolute left-3 text-xs text-gray-400" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-red-500 w-36 sm:w-44 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-xs text-gray-400 hover:text-white"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${isActive
                    ? 'bg-[#E50914] text-white shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
                    }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Live TV Channels Rail ── */}
      {filteredChannels.length > 0 ? (
        <RailRow
          titleAlt={
            <div className="flex items-center gap-2 text-[15px] sm:text-xl md:text-2xl font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_#e50914] shrink-0 animate-pulse" />
              <span>{title}</span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 ml-1">
                {filteredChannels.length} Live
              </span>
            </div>
          }
          items={filteredChannels}
          eager={true}
          renderItem={(channel) => (
            <LiveTVCard
              key={channel.id}
              channel={channel}
              onSelect={handleOpenStream}
            />
          )}
        />
      ) : (
        <div className="w-full py-8 text-center text-gray-400 text-xs sm:text-sm bg-neutral-900/40 rounded-xl border border-white/5">
          <i className="fa-solid fa-tv text-2xl text-gray-500 mb-2 block" />
          No live channels found matching "{searchQuery}".
        </div>
      )}
    </section>
  );
};

export default React.memo(LiveSection);
