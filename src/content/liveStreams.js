/**
 * Live Streams & Sports API Service (DAMITV / OnDemand)
 * Handles fetching live match streams, sources, and Live TV channels with resilient fallbacks.
 */

const API_ENDPOINT = 'https://ondemand.st/papi/api/streams';
const PROXY_ENDPOINT = '/papi/api/streams';

export const FALLBACK_STREAMS_DATA = {
  success: true,
  timestamp: Math.floor(Date.now() / 1000),
  READ_ME: 'Free public API by DAMITV. Use embed URLs to show streams on your site.',
  performance: 0.12,
  streams: [
    {
      category: 'football',
      id: 1,
      streams: [
        {
          id: 'mm-au-aus1-401892147',
          name: 'Macarthur FC vs Western Sydney Wanderers FC',
          poster: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
          starts_at: Math.floor(Date.now() / 1000) - 1800,
          ends_at: Math.floor(Date.now() / 1000) + 7200,
          category_name: 'football',
          status: 'live',
          league: 'A-League Men',
          teams: {
            home: {
              name: 'Macarthur FC',
              badge: 'https://a.espncdn.com/i/teamlogos/soccer/500/19340.png',
            },
            away: {
              name: 'Western Sydney Wanderers FC',
              badge: 'https://a.espncdn.com/i/teamlogos/soccer/500/13696.png',
            },
          },
          viewers: 14250,
          always_live: 0,
          sources: [
            {
              source: 'manual',
              id: 'dm1',
              name: 'TNT Sports 3 UK',
              sd: 0,
              hd: 1,
              embed: 'https://damitv.st/player/jw/?url=%2Fc%2F33.m3u8&name=TNT%20Sports%203%20UK',
            },
            {
              source: 'manual',
              id: 'dm2',
              name: 'Sky Sport 3 NZ',
              sd: 0,
              hd: 1,
              embed: 'https://damitv.st/player/jw/?url=%2Fc%2F590.m3u8&name=Sky%20Sport%203%20NZ',
            },
          ],
          embed: 'https://damitv.st/embed/?id=mm-au-aus1-401892147',
        },
        {
          id: 'mm-epl-ars-mci-2026',
          name: 'Arsenal vs Manchester City',
          poster: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80',
          starts_at: Math.floor(Date.now() / 1000) - 2400,
          ends_at: Math.floor(Date.now() / 1000) + 6000,
          category_name: 'football',
          status: 'live',
          league: 'Premier League',
          teams: {
            home: {
              name: 'Arsenal',
              badge: 'https://a.espncdn.com/i/teamlogos/soccer/500/359.png',
            },
            away: {
              name: 'Manchester City',
              badge: 'https://a.espncdn.com/i/teamlogos/soccer/500/382.png',
            },
          },
          viewers: 94500,
          always_live: 0,
          sources: [
            {
              source: 'manual',
              id: 'epl1',
              name: 'Sky Sports Premier League',
              sd: 0,
              hd: 1,
              embed: 'https://damitv.st/embed/?id=mm-epl-ars-mci-2026',
            },
            {
              source: 'manual',
              id: 'epl2',
              name: 'TNT Sports 1 UK',
              sd: 0,
              hd: 1,
              embed: 'https://damitv.st/player/jw/?url=%2Fc%2F31.m3u8&name=TNT%20Sports%201%20UK',
            },
          ],
          embed: 'https://damitv.st/embed/?id=mm-epl-ars-mci-2026',
        },
        {
          id: 'mm-laliga-rma-bar-2026',
          name: 'Real Madrid vs FC Barcelona',
          poster: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
          starts_at: Math.floor(Date.now() / 1000) - 900,
          ends_at: Math.floor(Date.now() / 1000) + 8100,
          category_name: 'football',
          status: 'live',
          league: 'LaLiga EA Sports',
          teams: {
            home: {
              name: 'Real Madrid',
              badge: 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png',
            },
            away: {
              name: 'FC Barcelona',
              badge: 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png',
            },
          },
          viewers: 135800,
          always_live: 0,
          sources: [
            {
              source: 'manual',
              id: 'es1',
              name: 'SuperSport Laliga HD',
              sd: 0,
              hd: 1,
              embed: 'https://damitv.st/embed/?id=mm-laliga-rma-bar-2026',
            },
          ],
          embed: 'https://damitv.st/embed/?id=mm-laliga-rma-bar-2026',
        },
      ],
    },
    {
      category: 'cricket',
      id: 2,
      streams: [
        {
          id: 'crick-ind-aus-2026',
          name: 'India vs Australia - Border Gavaskar Trophy',
          poster: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
          starts_at: Math.floor(Date.now() / 1000) - 3600,
          ends_at: Math.floor(Date.now() / 1000) + 14400,
          category_name: 'cricket',
          status: 'live',
          league: 'ICC Test Championship',
          teams: {
            home: {
              name: 'India',
              badge: 'https://a.espncdn.com/i/teamlogos/cricket/500/6.png',
            },
            away: {
              name: 'Australia',
              badge: 'https://a.espncdn.com/i/teamlogos/cricket/500/2.png',
            },
          },
          viewers: 284000,
          always_live: 0,
          sources: [
            {
              source: 'manual',
              id: 'cr1',
              name: 'Star Sports 1 HD (Hindi)',
              sd: 0,
              hd: 1,
              embed: 'https://damitv.st/embed/?id=crick-ind-aus-2026',
            },
            {
              source: 'manual',
              id: 'cr2',
              name: 'Fox Cricket 501 HD',
              sd: 0,
              hd: 1,
              embed: 'https://damitv.st/player/jw/?url=%2Fc%2F501.m3u8&name=Fox%20Cricket',
            },
            {
              source: 'manual',
              id: 'cr3',
              name: 'Willow Cricket HD',
              sd: 0,
              hd: 1,
              embed: 'https://damitv.st/player/jw/?url=%2Fc%2F102.m3u8&name=Willow%20HD',
            },
          ],
          embed: 'https://damitv.st/embed/?id=crick-ind-aus-2026',
        },
        {
          id: 'ipl-csk-mi-2026',
          name: 'Chennai Super Kings vs Mumbai Indians',
          poster: 'https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=1200&q=80',
          starts_at: Math.floor(Date.now() / 1000) - 1200,
          ends_at: Math.floor(Date.now() / 1000) + 10800,
          category_name: 'cricket',
          status: 'live',
          league: 'Indian Premier League (IPL)',
          teams: {
            home: {
              name: 'Chennai Super Kings',
              badge: 'https://a.espncdn.com/i/teamlogos/cricket/500/4346.png',
            },
            away: {
              name: 'Mumbai Indians',
              badge: 'https://a.espncdn.com/i/teamlogos/cricket/500/4345.png',
            },
          },
          viewers: 420000,
          always_live: 0,
          sources: [
            {
              source: 'manual',
              id: 'ipl1',
              name: 'Star Sports 1 HD',
              sd: 0,
              hd: 1,
              embed: 'https://damitv.st/embed/?id=ipl-csk-mi-2026',
            },
            {
              source: 'manual',
              id: 'ipl2',
              name: 'JioCinema Sports Ultra HD',
              sd: 0,
              hd: 1,
              embed: 'https://damitv.st/player/jw/?url=%2Fc%2F99.m3u8&name=JioCinema%204K',
            },
          ],
          embed: 'https://damitv.st/embed/?id=ipl-csk-mi-2026',
        },
      ],
    },
    {
      category: 'basketball',
      id: 3,
      streams: [
        {
          id: 'nba-lal-gsw-2026',
          name: 'Los Angeles Lakers vs Golden State Warriors',
          poster: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
          starts_at: Math.floor(Date.now() / 1000) - 1500,
          ends_at: Math.floor(Date.now() / 1000) + 6500,
          category_name: 'basketball',
          status: 'live',
          league: 'NBA Regular Season',
          teams: {
            home: {
              name: 'Los Angeles Lakers',
              badge: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
            },
            away: {
              name: 'Golden State Warriors',
              badge: 'https://a.espncdn.com/i/teamlogos/nba/500/gsw.png',
            },
          },
          viewers: 76000,
          always_live: 0,
          sources: [
            {
              source: 'manual',
              id: 'nba1',
              name: 'ESPN USA HD',
              sd: 0,
              hd: 1,
              embed: 'https://damitv.st/embed/?id=nba-lal-gsw-2026',
            },
            {
              source: 'manual',
              id: 'nba2',
              name: 'NBA TV Live',
              sd: 0,
              hd: 1,
              embed: 'https://damitv.st/player/jw/?url=%2Fc%2F21.m3u8&name=NBA%20TV',
            },
          ],
          embed: 'https://damitv.st/embed/?id=nba-lal-gsw-2026',
        },
      ],
    },
    {
      category: 'motorsport',
      id: 4,
      streams: [
        {
          id: 'f1-monaco-gp-2026',
          name: 'Formula 1 Grand Prix - Main Race',
          poster: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
          starts_at: Math.floor(Date.now() / 1000) - 2700,
          ends_at: Math.floor(Date.now() / 1000) + 4500,
          category_name: 'motorsport',
          status: 'live',
          league: 'FIA Formula One World Championship',
          teams: {
            home: {
              name: 'Red Bull Racing',
              badge: 'https://a.espncdn.com/i/teamlogos/f1/500/redbull.png',
            },
            away: {
              name: 'Ferrari Scuderia',
              badge: 'https://a.espncdn.com/i/teamlogos/f1/500/ferrari.png',
            },
          },
          viewers: 112000,
          always_live: 0,
          sources: [
            {
              source: 'manual',
              id: 'f1-1',
              name: 'Sky Sports F1 HD',
              sd: 0,
              hd: 1,
              embed: 'https://damitv.st/embed/?id=f1-monaco-gp-2026',
            },
            {
              source: 'manual',
              id: 'f1-2',
              name: 'F1 TV Pro World Feed',
              sd: 0,
              hd: 1,
              embed: 'https://damitv.st/player/jw/?url=%2Fc%2F401.m3u8&name=F1%20TV%20Pro',
            },
          ],
          embed: 'https://damitv.st/embed/?id=f1-monaco-gp-2026',
        },
      ],
    },
  ],
};

// Top Live TV 24/7 Channels
export const LIVE_TV_CHANNELS = [
  {
    id: 'tv-star-sports-1',
    name: 'Star Sports 1 HD',
    category: 'Sports & Cricket',
    badge: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/90/Star_Sports_1_logo.svg/320px-Star_Sports_1_logo.svg.png',
    bg: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80',
    currentShow: 'Live Cricket Broadcast & Match Analysis',
    viewers: '250K',
    hd: true,
    embed: 'https://damitv.st/embed/?id=crick-ind-aus-2026',
  },
  {
    id: 'tv-tnt-sports-1',
    name: 'TNT Sports 1 UK',
    category: 'Football & Premier League',
    badge: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/TNT_Sports_logo.svg/320px-TNT_Sports_logo.svg.png',
    bg: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=600&q=80',
    currentShow: 'Premier League Matchday LIVE',
    viewers: '98K',
    hd: true,
    embed: 'https://damitv.st/player/jw/?url=%2Fc%2F31.m3u8&name=TNT%20Sports%201%20UK',
  },
  {
    id: 'tv-sky-sports-f1',
    name: 'Sky Sports F1 HD',
    category: 'Motorsport & Formula 1',
    badge: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Sky_Sports_F1_logo_2020.svg/320px-Sky_Sports_F1_logo_2020.svg.png',
    bg: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
    currentShow: 'Grand Prix Trackside & Live Paddock',
    viewers: '115K',
    hd: true,
    embed: 'https://damitv.st/embed/?id=f1-monaco-gp-2026',
  },
  {
    id: 'tv-sky-sport-3-nz',
    name: 'Sky Sport 3 NZ',
    category: 'Rugby & International',
    badge: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Sky_Sport_logo_2020.svg/320px-Sky_Sport_logo_2020.svg.png',
    bg: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    currentShow: 'A-League & Rugby Live',
    viewers: '34K',
    hd: true,
    embed: 'https://damitv.st/player/jw/?url=%2Fc%2F590.m3u8&name=Sky%20Sport%203%20NZ',
  },
  {
    id: 'tv-espn-hd',
    name: 'ESPN Sports HD',
    category: 'Basketball & SportsCenter',
    badge: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/320px-ESPN_wordmark.svg.png',
    bg: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80',
    currentShow: 'SportsCenter & NBA Live Arena',
    viewers: '85K',
    hd: true,
    embed: 'https://damitv.st/embed/?id=nba-lal-gsw-2026',
  },
  {
    id: 'tv-willow-cricket',
    name: 'Willow Cricket HD',
    category: 'Cricket 24/7',
    badge: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/db/Willow_TV_logo.svg/320px-Willow_TV_logo.svg.png',
    bg: 'https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=600&q=80',
    currentShow: 'International Cricket Highlights & Live Feeds',
    viewers: '62K',
    hd: true,
    embed: 'https://damitv.st/player/jw/?url=%2Fc%2F102.m3u8&name=Willow%20HD',
  },
];

/**
 * Fetch live streams from API with multiple resilient fallbacks
 */
export async function fetchLiveStreamsData() {
  const cacheKey = 'cineflix_live_streams_cache';
  const cached = sessionStorage.getItem(cacheKey);

  // Check in-session cache (valid for 60 seconds)
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < 60000 && parsed.data?.streams?.length) {
        return parsed.data;
      }
    } catch {
      // ignore
    }
  }

  // 1. Try Direct API with 4s timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(API_ENDPOINT, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.streams) && json.streams.length > 0) {
        sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: json }));
        return json;
      }
    }
  } catch (err) {
    // Direct API failed (e.g. CORS or network)
  }

  // 2. Try Local Vite Proxy
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(PROXY_ENDPOINT, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.streams) && json.streams.length > 0) {
        sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: json }));
        return json;
      }
    }
  } catch (err) {
    // Proxy failed
  }

  // 3. Resilient Fallback Data
  return FALLBACK_STREAMS_DATA;
}

/**
 * Normalizes all match streams into a flat list
 */
export function flattenLiveMatches(apiResponse) {
  if (!apiResponse || !Array.isArray(apiResponse.streams)) {
    return [];
  }

  const flattened = [];
  apiResponse.streams.forEach((group) => {
    const categoryName = group.category || 'sports';
    if (Array.isArray(group.streams)) {
      group.streams.forEach((match) => {
        flattened.push({
          ...match,
          category_name: match.category_name || categoryName,
          category_id: group.id,
          // ensure embed URL is formatted
          embedUrl: match.embed || `https://damitv.st/embed/?id=${match.id}`,
        });
      });
    }
  });

  return flattened;
}

/**
 * Format viewer count: 1250 -> "1.3K", 284000 -> "284K"
 */
export function formatViewerCount(viewers) {
  const num = Number(viewers) || 0;
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return String(num);
}
