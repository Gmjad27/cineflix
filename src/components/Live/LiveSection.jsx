import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RailRow from '../RailRow/RailRow';
import LiveTVCard from './LiveTVCard';
import { LIVE_CHANNELS } from '../../content/liveStreams';

const CATEGORIES = [
  { id: 'all', label: 'All Channels', match: () => true },
  {
    id: 'cricket',
    label: 'Cricket',
    match: (ch) =>
      ch.category?.toLowerCase().includes('cricket') ||
      ch.name?.toLowerCase().includes('cricket') ||
      ['Willow', 'Astro'].includes(ch.network),
  },
  { id: 'sony', label: 'Sony Sports', match: (ch) => ch.network === 'Sony Sports' },
  { id: 'sky', label: 'Sky Sports', match: (ch) => ch.network === 'Sky Sports' },
  { id: 'tnt', label: 'TNT Sports', match: (ch) => ch.network === 'TNT Sports' },
  { id: 'fox', label: 'Fox Sports', match: (ch) => ch.network === 'Fox Sports' },
];

const LiveSection = ({
  title = 'Live Sports Channels',
  subtitle = 'Watch 24/7 live sports channels with live streaming',
}) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChannels = useMemo(() => {
    const activeCategory = CATEGORIES.find((c) => c.id === selectedCategory);
    const q = searchQuery.toLowerCase().trim();

    return LIVE_CHANNELS.filter((ch) => {
      const matchesCategory = activeCategory ? activeCategory.match(ch) : true;
      if (!matchesCategory) return false;

      if (!q) return true;
      return (
        ch.name?.toLowerCase().includes(q) ||
        ch.category?.toLowerCase().includes(q) ||
        ch.network?.toLowerCase().includes(q) ||
        String(ch.streamId ?? '').includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  const handleOpenStream = useCallback(
    (channel) => {
      navigate(`/live-stream/${channel.streamId || channel.id}`, {
        state: { stream: channel },
      });
    },
    [navigate]
  );

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
  };

  return (
    <section className="relative z-20 flex flex-col gap-3 sm:gap-4 my-4 sm:my-6">
      {/* ── Header & Controls Bar ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-3 sm:px-4 md:px-0">
        

        {/* Responsive Search + Filter Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
         

          {/* Horizontal Scrollable Category Pills (Bleeds cleanly on mobile) */}
          <div
            role="tablist"
            aria-label="Channel networks"
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0 py-0.5"
          >
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 select-none transition-all active:scale-95 ${
                    isActive
                      ? 'bg-[#E50914] text-white shadow-[0_2px_10px_rgba(229,9,20,0.35)]'
                      : 'bg-white/[0.06] text-gray-300 border border-white/10 active:bg-white/15 sm:hover:bg-white/12 sm:hover:text-white'
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
            <div className="flex items-center gap-2 text-base sm:text-xl md:text-2xl font-bold px-3 sm:px-4 md:px-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 shadow-[0_0_8px_#e50914]" />
              </span>
              <span className="truncate">{title}</span>
              <span className="text-[10px] sm:text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 shrink-0">
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
        <div className="mx-3 sm:mx-4 md:mx-0 py-10 px-4 text-center text-gray-400 bg-neutral-900/50 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center mb-3">
            <i className="fa-solid fa-tv text-lg text-gray-400" />
          </div>
          <p className="text-xs sm:text-sm text-gray-300 font-medium max-w-md">
            {searchQuery.trim()
              ? `No live channels found matching "${searchQuery}".`
              : 'No live channels available in this category right now.'}
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-4 py-1.5 rounded-full bg-white/10 active:bg-white/20 sm:hover:bg-white/15 active:scale-95 text-white text-xs font-semibold transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default React.memo(LiveSection);