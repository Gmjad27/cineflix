import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RailRow from '../RailRow/RailRow';
import LiveTVCard from './LiveTVCard';
import LiveMatchCard from './LiveMatchCard';
import { useLiveFavorites } from '../../hooks/useLiveFavorites';
import { LiveMatchSkeleton, LiveChannelSkeleton } from '../Skeleton/Skeleton';
import {
  LIVE_CHANNELS,
  fetchLiveStreamsData,
  getCachedLiveMatches,
} from '../../content/liveStreams';

const LiveSection = ({
  title = 'Live Now',
  tag = 'LIVE',
  subtitle,
  defaultTab = 'all',
  showAllLink = true,
  matches: externalMatches,
  channels: externalChannels,
  isLoading: externalLoading,
  searchQuery = '',
  hideTabs = false,
  layout = 'rail',
  onSelect: externalOnSelect,
  multiRail = false, // When true, renders Live Now, Upcoming Matches, and Trending Channels
}) => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useLiveFavorites();

  const [internalMatches, setInternalMatches] = useState(() => getCachedLiveMatches() || []);
  const [internalLoading, setInternalLoading] = useState(
    !externalMatches && !(getCachedLiveMatches()?.length > 0)
  );

  const effectiveMatches = externalMatches || internalMatches;
  const effectiveChannels = externalChannels || LIVE_CHANNELS;
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;

  // Auto-fetch data if parent didn't provide matches
  const loadData = useCallback(async () => {
    if (externalMatches) return;
    try {
      const data = await fetchLiveStreamsData();
      if (Array.isArray(data?.matches)) {
        setInternalMatches(data.matches);
      }
    } catch (err) {
      console.error('Failed to load live data:', err);
    } finally {
      setInternalLoading(false);
    }
  }, [externalMatches]);

  useEffect(() => {
    if (!externalMatches) {
      loadData();
      const interval = setInterval(() => loadData(), 90000);
      return () => clearInterval(interval);
    }
  }, [externalMatches, loadData]);

  // Filter matches
  const filteredMatches = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return effectiveMatches;
    return effectiveMatches.filter((m) => {
      const home = (m.teams?.home?.name || '').toLowerCase();
      const away = (m.teams?.away?.name || '').toLowerCase();
      const name = (m.name || '').toLowerCase();
      const league = (m.league || '').toLowerCase();
      return home.includes(q) || away.includes(q) || name.includes(q) || league.includes(q);
    });
  }, [effectiveMatches, searchQuery]);

  // Filter channels
  const filteredChannels = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return effectiveChannels;
    return effectiveChannels.filter((ch) => {
      return (
        ch.name?.toLowerCase().includes(q) ||
        ch.category?.toLowerCase().includes(q) ||
        ch.network?.toLowerCase().includes(q) ||
        String(ch.streamId ?? '').includes(q)
      );
    });
  }, [effectiveChannels, searchQuery]);

  // Separate matches into Live Now vs Upcoming
  const { liveNowMatches, upcomingMatches } = useMemo(() => {
    const live = [];
    const upcoming = [];

    filteredMatches.forEach((m) => {
      const isUp =
        m.status === 'upcoming' ||
        m.category_name === 'upcoming-matches' ||
        (m.starts_at && m.starts_at * 1000 > Date.now());

      if (isUp) {
        upcoming.push(m);
      } else {
        live.push(m);
      }
    });

    if (live.length > 0 && upcoming.length === 0 && filteredMatches.length > 4) {
      return {
        liveNowMatches: filteredMatches.slice(0, Math.ceil(filteredMatches.length / 2)),
        upcomingMatches: filteredMatches.slice(Math.ceil(filteredMatches.length / 2)),
      };
    }

    return {
      liveNowMatches: live.length > 0 ? live : filteredMatches.slice(0, 6),
      upcomingMatches: upcoming.length > 0 ? upcoming : filteredMatches.slice(6),
    };
  }, [filteredMatches]);

  const handleOpenStream = useCallback(
    (item) => {
      if (typeof externalOnSelect === 'function') {
        externalOnSelect(item);
        return;
      }
      navigate(`/live-stream/${item.streamId || item.id}`, {
        state: { stream: item },
      });
    },
    [externalOnSelect, navigate]
  );

  // Loading Skeleton State
  if (isLoading && effectiveMatches.length === 0 && effectiveChannels.length === 0) {
    return (
      <div className="space-y-6 sm:space-y-8 my-4">
        <LiveMatchSkeleton count={4} layout="rail" />
        <LiveChannelSkeleton count={5} layout="rail" />
      </div>
    );
  }

  // ── MULTI-RAIL MODE (Matches the 3-row layout in user's image) ──
  if (multiRail || (!externalMatches && !externalChannels)) {
    return (
      <div className="space-y-6 sm:space-y-8 my-4">
        {/* ROW 1: LIVE | Live Now */}
        <RailRow
          tag="LIVE"
          showAccentBar
          showExploreAll={false}
          headerArrows
          eager
          titleAlt="Live Now"
          items={liveNowMatches}
          renderItem={(match) => (
            <LiveMatchCard
              key={match.id}
              match={match}
              variant="live"
              onSelect={handleOpenStream}
              isFavorite={isFavorite(match)}
              onToggleFavorite={toggleFavorite}
            />
          )}
        />

        {/* ROW 2: | Upcoming Matches */}
        <RailRow
          tag={null}
          showAccentBar
          showExploreAll={false}
          headerArrows
          eager
          titleAlt="Upcoming Matches"
          items={upcomingMatches}
          renderItem={(match) => (
            <LiveMatchCard
              key={match.id}
              match={match}
              variant="upcoming"
              onSelect={handleOpenStream}
              isFavorite={isFavorite(match)}
              onToggleFavorite={toggleFavorite}
            />
          )}
        />

        {/* ROW 3: TV | Trending Channels */}
        <RailRow
          tag="TV"
          showAccentBar
          showExploreAll={false}
          headerArrows
          eager
          titleAlt="Trending Channels"
          items={filteredChannels}
          renderItem={(channel) => (
            <LiveTVCard
              key={channel.id}
              channel={channel}
              onSelect={handleOpenStream}
              isFavorite={isFavorite(channel)}
              onToggleFavorite={toggleFavorite}
            />
          )}
        />
      </div>
    );
  }

  // ── SINGLE RAIL / CUSTOM MODE ──
  if (externalChannels && !externalMatches) {
    return (
      <RailRow
        tag={tag || 'TV'}
        showAccentBar
        showExploreAll={false}
        headerArrows
        eager
        title={title || 'Trending Channels'}
        items={filteredChannels}
        renderItem={(channel) => (
          <LiveTVCard
            key={channel.id}
            channel={channel}
            onSelect={handleOpenStream}
            isFavorite={isFavorite(channel)}
            onToggleFavorite={toggleFavorite}
          />
        )}
      />
    );
  }

  return (
    <RailRow
      tag={tag || 'LIVE'}
      showAccentBar
      showExploreAll={false}
      headerArrows
      eager
      title={title || 'Live Now'}
      items={filteredMatches}
      renderItem={(match) => (
        <LiveMatchCard
          key={match.id}
          match={match}
          variant={match.status === 'upcoming' ? 'upcoming' : 'live'}
          onSelect={handleOpenStream}
          isFavorite={isFavorite(match)}
          onToggleFavorite={toggleFavorite}
        />
      )}
    />
  );
};

export default React.memo(LiveSection);
