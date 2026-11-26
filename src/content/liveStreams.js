/**
 * Live Channels Data & Embed Configuration
 * DaddyLive / TheDaddy iframe streams
 */

export const STREAM_BASE_URL = 'https://thedaddy.li/cast/stream-';

export const getStreamEmbedUrl = (streamId) => {
  if (!streamId) return '';
  return `https://thedaddy.li/cast/stream-${streamId}.php`;
};

export const LIVE_CHANNELS = [
  // --- CRICKET ---
  {
    id: 'f981bc52ad',
    streamId: 'f981bc52ad',
    name: 'Sony Sports Ten 1',
    category: 'Cricket',
    network: 'Sony Sports',
    color: '#1d4ed8',
    badge: 'https://ondemand.st/img/c/f981bc52ad.png',
    bg: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Live International Cricket & Sports',
    viewers: '96K',
    hd: true,
    embed: 'https://ondemand.to/player/hls/?v=542&url=https%3A%2F%2Fmessi.damitv.st%2Fc%2Ff981bc52ad.m3u8&name=SONY%20TEN%201',
  },
  {
    id: '38718c06fb',
    streamId: '38718c06fb',
    name: 'Sony Sports Ten 2',
    category: 'Football',
    network: 'Sony Sports',
    color: '#2563eb',
    badge: 'https://ondemand.st/img/c/38718c06fb.png',
    bg: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    currentShow: 'UEFA Champions League & Live Football',
    viewers: '84K',
    hd: true,
    embed: 'https://ondemand.to/player/hls/?v=542&url=https%3A%2F%2Fmessi.damitv.st%2Fc%2F38718c06fb.m3u8&name=SONY%20TEN%202',
  },
  {
    id: '9ab66e8d5e',
    streamId: '9ab66e8d5e',
    name: 'Sony Sports Ten 3',
    category: 'Cricket',
    network: 'Sony Sports',
    color: '#0284c7',
    badge: 'https://ondemand.st/img/c/9ab66e8d5e.png',
    bg: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Live Cricket & Sports (Hindi)',
    viewers: '79K',
    hd: true,
    embed: 'https://ondemand.to/player/hls/?v=542&url=https%3A%2F%2Fmessi.damitv.st%2Fc%2F9ab66e8d5e.m3u8&name=SONY%20TEN%203',
  },
  {
    id: '28897bfbe1',
    streamId: '28897bfbe1',
    name: 'Cricbuzz / SuperSport Cricket',
    category: 'Cricket',
    network: 'SuperSport',
    color: '#16a34a',
    badge: 'https://ondemand.st/img/c/28897bfbe1.png',
    bg: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Live International Test & ODI Cricket',
    viewers: '84K',
    hd: true,
    embed: 'https://ondemand.to/player/hls/?v=542&url=%2Fc%2F28897bfbe1.m3u8&name=SuperSport%20Cricket',
  },
  {
    id: '1f31c3c89a',
    streamId: '1f31c3c89a',
    name: 'Willow Cricket',
    category: 'Cricket',
    network: 'Willow',
    color: '#16a34a',
    badge: 'https://ondemand.st/img/c/1f31c3c89a.png',
    bg: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Live International & T20 Cricket',
    viewers: '89K',
    hd: true,
    embed: 'https://ondemand.to/player/hls/?v=542&url=%2Fc%2F1f31c3c89a.m3u8&name=Willow%20Cricket',
  },
  {
    id: '91a93f700c',
    streamId: '91a93f700c',
    name: 'Willow 2',
    category: 'Cricket',
    network: 'Willow',
    color: '#16a34a',
    badge: 'https://ondemand.st/img/c/91a93f700c.png',
    bg: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Live T20, Test & ODI Series',
    viewers: '64K',
    hd: true,
    embed: 'https://ondemand.to/player/hls/?v=542&url=%2Fc%2F91a93f700c.m3u8&name=Willow%202%20Cricket',
  },
  {
    id: '2622840eac',
    streamId: '2622840eac',
    name: 'Astro Cricket',
    category: 'Cricket',
    network: 'Astro',
    color: '#e11d48',
    badge: 'https://ondemand.st/img/c/2622840eac.png',
    bg: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Live Asia Cup & International Cricket',
    viewers: '52K',
    hd: true,
    embed: 'https://ondemand.to/player/hls/?v=542&url=%2Fc%2F2622840eac.m3u8&name=Astro%20Cricket',
  },
  {
    id: '9bec686fd0',
    streamId: '9bec686fd0',
    name: 'Sky Sports Cricket UK',
    category: 'Cricket',
    network: 'Sky Sports',
    color: '#0284c7',
    badge: 'https://ondemand.st/img/c/9bec686fd0.png',
    bg: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Live Test & WBBL Cricket Coverage',
    viewers: '78K',
    hd: true,
    embed: 'https://ondemand.to/player/hls/?v=542&url=%2Fc%2F9bec686fd0.m3u8&name=Sky%20Sports%20Cricket',
  },
  {
    id: '11f7be7b85',
    streamId: '11f7be7b85',
    name: 'Sky Sport 1 NZ',
    category: 'Cricket',
    network: 'Sky Sport NZ',
    color: '#0369a1',
    badge: 'https://ondemand.st/img/c/11f7be7b85.png',
    bg: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Blackcaps Live Home Series',
    viewers: '41K',
    hd: true,
    embed: 'https://ondemand.to/player/hls/?v=542&url=%2Fc%2F11f7be7b85.m3u8&name=Sky%20Sport%201%20NZ',
  },
  {
    id: '87cad238ba',
    streamId: '87cad238ba',
    name: 'Sky Sport 2 NZ',
    category: 'Cricket',
    network: 'Sky Sport NZ',
    color: '#0369a1',
    badge: 'https://ondemand.st/img/c/87cad238ba.png',
    bg: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Live WBBL & NBL Action',
    viewers: '29K',
    hd: true,
    embed: 'https://ondemand.to/player/hls/?v=542&url=%2Fc%2F87cad238ba.m3u8&name=Sky%20Sport%202%20NZ',
  },
  {
    id: 'dc53c01717',
    streamId: 'dc53c01717',
    name: 'Sky Sport 3 NZ',
    category: 'Cricket',
    network: 'Sky Sport NZ',
    color: '#0369a1',
    badge: 'https://ondemand.st/img/c/dc53c01717.png',
    bg: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Live NZ Cricket & Rugby Coverage',
    viewers: '25K',
    hd: true,
    embed: 'https://ondemand.to/player/hls/?v=542&url=%2Fc%2Fdc53c01717.m3u8&name=Sky%20Sport%203%20NZ',
  },
  {
    id: '08ba71acd4',
    streamId: '08ba71acd4',
    name: 'Sky Sport 4 NZ',
    category: 'Cricket',
    network: 'Sky Sport NZ',
    color: '#0369a1',
    badge: 'https://ondemand.st/img/c/08ba71acd4.png',
    bg: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Live International Sports Feed',
    viewers: '22K',
    hd: true,
    embed: 'https://ondemand.to/player/hls/?v=542&url=%2Fc%2F08ba71acd4.m3u8&name=Sky%20Sport%204%20NZ',
  },
  {
    id: '313936da1d',
    streamId: '313936da1d',
    name: 'Sky Sport 5 NZ',
    category: 'Cricket',
    network: 'Sky Sport NZ',
    color: '#0369a1',
    badge: 'https://ondemand.st/img/c/313936da1d.png',
    bg: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Live Super Smash & Tour Matches',
    viewers: '19K',
    hd: true,
    embed: 'https://ondemand.to/player/hls/?v=542&url=%2Fc%2F313936da1d.m3u8&name=Sky%20Sport%205%20NZ',
  },
  {
    id: 'ddf48bc5e1',
    streamId: 'ddf48bc5e1',
    name: 'Sky Sport 6 NZ',
    category: 'Cricket',
    network: 'Sky Sport NZ',
    color: '#0369a1',
    badge: 'https://ondemand.st/img/c/ddf48bc5e1.png',
    bg: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Live Cricket & Multi-Sport Broadcast',
    viewers: '18K',
    hd: true,
    embed: 'https://ondemand.to/player/hls/?v=542&url=%2Fc%2Fddf48bc5e1.m3u8&name=Sky%20Sport%206%20NZ',
  },
  {
    id: '716de83302',
    streamId: '716de83302',
    name: 'SuperSport Grandstand',
    category: 'Cricket',
    network: 'SuperSport',
    color: '#1e40af',
    badge: 'https://ondemand.st/img/c/716de83302.png',
    bg: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Premier Live Multi-Sport Broadcast',
    viewers: '55K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=540&url=%2Fc%2F716de83302.m3u8&name=SuperSport%20Grandstand',
  },
  {
    id: '247-fox-cricket',
    streamId: '247-fox-cricket',
    name: 'Fox Cricket',
    category: 'Cricket',
    network: 'Fox Sports',
    color: '#f97316',
    badge: 'https://ondemand.st/img/c/247-fox-cricket.png',
    bg: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80',
    currentShow: '24/7 Australian & Big Bash Cricket',
    viewers: '49K',
    hd: true,
    embed: 'https://ondemand.to/player/hls/?v=542&v=jw2&url=https%3A%2F%2Fmessi.damitv.st%2Flive-hls%2Fchannel%2F247-fox-cricket%2Fplaylist.m3u8%3Ftk%3DFNeQkqBJupVsXD0Ua_xr-g%26e%3D1795107503&name=Live',
  },

  // --- FOOTBALL ---
  {
    id: '8afdcdd622',
    streamId: '8afdcdd622',
    name: 'TNT Sports 1 UK',
    category: 'Football',
    network: 'TNT Sports',
    color: '#dc2626',
    badge: 'https://ondemand.st/img/c/8afdcdd622.png',
    bg: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    currentShow: 'UEFA Champions League & Live Sports',
    viewers: '142K',
    hd: true,
    embed: 'https://ondemand.to/player/hls/?v=542&url=%2Fc%2F8afdcdd622.m3u8&name=TNT%20Sports%201%20UK',
  },
  {
    id: '3477a63c86',
    streamId: '3477a63c86',
    name: 'TNT Sports 2 UK',
    category: 'Football',
    network: 'TNT Sports',
    color: '#dc2626',
    badge: 'https://ondemand.st/img/c/3477a63c86.png',
    bg: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    currentShow: 'UEFA Champions League Live Matchday',
    viewers: '110K',
    hd: true,
    embed: 'https://ondemand.to/player/hls/?v=542&url=%2Fc%2F3477a63c86.m3u8&name=TNT%20Sports%202%20UK',
  },
  {
    id: 'f3c06b44b0',
    streamId: 'f3c06b44b0',
    name: 'TNT Sports 3 UK',
    category: 'Football',
    network: 'TNT Sports',
    color: '#dc2626',
    badge: 'https://ondemand.st/img/c/f3c06b44b0.png',
    bg: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    currentShow: 'UEFA Europa & Conference League',
    viewers: '76K',
    hd: true,
    embed: 'https://ondemand.to/player/hls/?v=542&url=%2Fc%2Ff3c06b44b0.m3u8&name=TNT%20Sports%203%20UK',
  },
  {
    id: 'd4a4fa01bf',
    streamId: 'd4a4fa01bf',
    name: 'TNT Sports 4 UK',
    category: 'Football',
    network: 'TNT Sports',
    color: '#dc2626',
    badge: 'https://ondemand.st/img/c/d4a4fa01bf.png',
    bg: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    currentShow: 'European Football Live Coverage',
    viewers: '61K',
    hd: true,
    embed: 'https://ondemand.to/player/hls/?v=542&url=%2Fc%2Fd4a4fa01bf.m3u8&name=TNT%20Sports%204%20UK',
  },
  {
    id: '4a2c801ab2',
    streamId: '4a2c801ab2',
    name: 'Sky Sports Main Event',
    category: 'Football',
    network: 'Sky Sports',
    color: '#0284c7',
    badge: 'https://ondemand.st/img/c/4a2c801ab2.png',
    bg: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Premier League Live Matchday',
    viewers: '185K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F4a2c801ab2.m3u8&name=Sky%20Sports%20Main%20Event',
  },
  {
    id: '3490f75e3e',
    streamId: '3490f75e3e',
    name: 'Sky Sports Football UK',
    category: 'Football',
    network: 'Sky Sports',
    color: '#0284c7',
    badge: 'https://ondemand.st/img/c/3490f75e3e.png',
    bg: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
    currentShow: 'EFL Championship & League One Live',
    viewers: '94K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F3490f75e3e.m3u8&name=Sky%20Sports%20Football%20UK',
  },
  {
    id: '60d47ba098',
    streamId: '60d47ba098',
    name: 'Sky Sports+ Plus',
    category: 'Football',
    network: 'Sky Sports',
    color: '#0369a1',
    badge: 'https://ondemand.st/img/c/60d47ba098.png',
    bg: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    currentShow: 'EFL Multi-Match Live Streams',
    viewers: '72K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F60d47ba098.m3u8&name=Sky%20Sports%2B%20Plus',
  },
  {
    id: '0ff8b6a8e2',
    streamId: '0ff8b6a8e2',
    name: 'USA Network',
    category: 'Football',
    network: 'NBCUniversal',
    color: '#2563eb',
    badge: 'https://ondemand.st/img/c/0ff8b6a8e2.png',
    bg: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Premier League & Bundesliga Live',
    viewers: '118K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F0ff8b6a8e2.m3u8&name=USA%20Network',
  },
  {
    id: 'b8e5c6f84d',
    streamId: 'b8e5c6f84d',
    name: 'ESPN Deportes',
    category: 'Football',
    network: 'ESPN',
    color: '#dc2626',
    badge: 'https://ondemand.st/img/c/b8e5c6f84d.png',
    bg: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    currentShow: 'LaLiga EA Sports en Vivo',
    viewers: '88K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2Fb8e5c6f84d.m3u8&name=ESPN%20Deportes',
  },
  {
    id: 'a4c6e785dd',
    streamId: 'a4c6e785dd',
    name: 'Sky Sport Bundesliga 1 HD',
    category: 'Football',
    network: 'Sky Sport DE',
    color: '#b91c1c',
    badge: 'https://ondemand.st/img/c/a4c6e785dd.png',
    bg: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    currentShow: 'German Bundesliga Live Conference',
    viewers: '83K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2Fa4c6e785dd.m3u8&name=Sky%20Sport%20Bundesliga%201%20HD',
  },
  {
    id: '702329d6bf',
    streamId: '702329d6bf',
    name: 'DAZN ZONA Italy',
    category: 'Football',
    network: 'DAZN',
    color: '#18181b',
    badge: 'https://ondemand.st/img/c/702329d6bf.png',
    bg: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Serie A Enilive Matchday',
    viewers: '79K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F702329d6bf.m3u8&name=DAZN%20ZONA%20Italy',
  },
  {
    id: 'c31105efdf',
    streamId: 'c31105efdf',
    name: 'DAZN Ligue 1 France',
    category: 'Football',
    network: 'DAZN',
    color: '#18181b',
    badge: 'https://ondemand.st/img/c/c31105efdf.png',
    bg: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Ligue 1 McDonald’s Live',
    viewers: '67K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2Fc31105efdf.m3u8&name=DAZN%20Ligue%201%20France',
  },
  {
    id: '176d6d52c2',
    streamId: '176d6d52c2',
    name: 'ESPN 1 NL',
    category: 'Football',
    network: 'ESPN',
    color: '#dc2626',
    badge: 'https://ondemand.st/img/c/176d6d52c2.png',
    bg: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Dutch Eredivisie Live',
    viewers: '44K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F176d6d52c2.m3u8&name=ESPN%201%20NL',
  },
  {
    id: '77badd3359',
    streamId: '77badd3359',
    name: 'beIN SPORTS 1 Turkey',
    category: 'Football',
    network: 'beIN Sports',
    color: '#7e22ce',
    badge: 'https://ondemand.st/img/c/77badd3359.png',
    bg: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Trendyol Süper Lig Live',
    viewers: '58K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F77badd3359.m3u8&name=beIN%20SPORTS%201%20Turkey',
  },
  {
    id: 'da07f60d06',
    streamId: 'da07f60d06',
    name: 'TUDN USA',
    category: 'Football',
    network: 'TelevisaUnivision',
    color: '#15803d',
    badge: 'https://ondemand.st/img/c/da07f60d06.png',
    bg: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Liga MX Fútbol en Vivo',
    viewers: '71K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2Fda07f60d06.m3u8&name=TUDN%20USA',
  },
  {
    id: '14166f2f0b',
    streamId: '14166f2f0b',
    name: 'ESPN Premium Argentina',
    category: 'Football',
    network: 'ESPN',
    color: '#dc2626',
    badge: 'https://ondemand.st/img/c/14166f2f0b.png',
    bg: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Liga Profesional Argentina',
    viewers: '63K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F14166f2f0b.m3u8&name=ESPN%20Premium%20Argentina',
  },
  {
    id: 'b9f75401ab',
    streamId: 'b9f75401ab',
    name: 'Premiere BR',
    category: 'Football',
    network: 'Globo',
    color: '#16a34a',
    badge: 'https://ondemand.st/img/c/b9f75401ab.png',
    bg: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Brasileirão Série A Ao Vivo',
    viewers: '54K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2Fb9f75401ab.m3u8&name=Premiere%20BR',
  },
  {
    id: '09ac381bfd',
    streamId: '09ac381bfd',
    name: 'Premiere 2 BR',
    category: 'Football',
    network: 'Globo',
    color: '#16a34a',
    badge: 'https://ondemand.st/img/c/09ac381bfd.png',
    bg: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Brasileirão Série A Ao Vivo',
    viewers: '41K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F09ac381bfd.m3u8&name=Premiere%202%20BR',
  },
  {
    id: '8d81ac280f',
    streamId: '8d81ac280f',
    name: 'Premiere 3 BR',
    category: 'Football',
    network: 'Globo',
    color: '#16a34a',
    badge: 'https://ondemand.st/img/c/8d81ac280f.png',
    bg: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Brasileirão Série A Ao Vivo',
    viewers: '36K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F8d81ac280f.m3u8&name=Premiere%203%20BR',
  },
  {
    id: '6bfdfa6321',
    streamId: '6bfdfa6321',
    name: 'CBS Sports Golazo',
    category: 'Football',
    network: 'CBS Sports',
    color: '#1d4ed8',
    badge: 'https://ondemand.st/img/c/6bfdfa6321.png',
    bg: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    currentShow: 'UEFA Women’s Champions League',
    viewers: '39K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F6bfdfa6321.m3u8&name=CBS%20Sports%20Golazo',
  },
  {
    id: 'dc270c3a28',
    streamId: 'dc270c3a28',
    name: 'BBC Three UK',
    category: 'Football',
    network: 'BBC',
    color: '#e11d48',
    badge: 'https://ondemand.st/img/c/dc270c3a28.png',
    bg: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Live UWCL Football',
    viewers: '45K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2Fdc270c3a28.m3u8&name=BBC%20Three%20UK',
  },
  {
    id: '046efe45b0',
    streamId: '046efe45b0',
    name: 'ZDF Sport DE',
    category: 'Football',
    network: 'ZDF',
    color: '#ea580c',
    badge: 'https://ondemand.st/img/c/046efe45b0.png',
    bg: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
    currentShow: 'German & European Football Live',
    viewers: '48K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F046efe45b0.m3u8&name=ZDF%20Sport%20DE',
  },
  {
    id: 'af1507623a',
    streamId: 'af1507623a',
    name: 'beIN Sports 3 Malaysia',
    category: 'Football',
    network: 'beIN Sports',
    color: '#7e22ce',
    badge: 'https://ondemand.st/img/c/af1507623a.png',
    bg: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Live European Club Football',
    viewers: '31K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2Faf1507623a.m3u8&name=beIN%20Sports%203%20Malaysia',
  },
  {
    id: '48d000fae1',
    streamId: '48d000fae1',
    name: 'RTP 2 Portugal',
    category: 'Football',
    network: 'RTP',
    color: '#059669',
    badge: 'https://ondemand.st/img/c/48d000fae1.png',
    bg: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Portuguese & European Sports',
    viewers: '27K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F48d000fae1.m3u8&name=RTP%202%20Portugal',
  },
  {
    id: '98916a4ffd',
    streamId: '98916a4ffd',
    name: 'Apple TV MLS',
    category: 'Football',
    network: 'Apple TV',
    color: '#27272a',
    badge: 'https://ondemand.st/img/c/98916a4ffd.png',
    bg: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
    currentShow: 'MLS Season Pass Live',
    viewers: '53K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F98916a4ffd.m3u8&name=Apple%20TV',
  },

  // --- BASKETBALL ---
  {
    id: '3c1c199431',
    streamId: '3c1c199431',
    name: 'ESPN USA',
    category: 'Basketball',
    network: 'ESPN',
    color: '#dc2626',
    badge: 'https://ondemand.st/img/c/3c1c199431.png',
    bg: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    currentShow: 'NBA & NCAA Live Primetime',
    viewers: '165K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F3c1c199431.m3u8&name=ESPN%20USA',
  },
  {
    id: 'c43be3accb',
    streamId: 'c43be3accb',
    name: 'NBA TV USA',
    category: 'Basketball',
    network: 'NBA',
    color: '#1d4ed8',
    badge: 'https://ondemand.st/img/c/c43be3accb.png',
    bg: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=800&q=80',
    currentShow: 'NBA Live Games & Hardwood Classics',
    viewers: '112K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2Fc43be3accb.m3u8&name=NBA%20TV%20USA',
  },
  {
    id: '59b807e4a5',
    streamId: '59b807e4a5',
    name: 'NBA League Pass',
    category: 'Basketball',
    network: 'NBA',
    color: '#1e40af',
    badge: 'https://ondemand.st/img/c/59b807e4a5.png',
    bg: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Out-of-Market Live NBA Games',
    viewers: '98K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F59b807e4a5.m3u8&name=NBA%20League%20Pass',
  },
  {
    id: '60f7152988',
    streamId: '60f7152988',
    name: 'Spectrum SportsNet USA',
    category: 'Basketball',
    network: 'Spectrum',
    color: '#0284c7',
    badge: 'https://ondemand.st/img/c/60f7152988.png',
    bg: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Los Angeles Lakers Live Coverage',
    viewers: '87K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F60f7152988.m3u8&name=Spectrum%20SportsNet%20USA',
  },
  {
    id: '351b9e9a45',
    streamId: '351b9e9a45',
    name: 'NBCS California USA',
    category: 'Basketball',
    network: 'NBC Sports',
    color: '#2563eb',
    badge: 'https://ondemand.st/img/c/351b9e9a45.png',
    bg: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Sacramento Kings Live Basketball',
    viewers: '49K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F351b9e9a45.m3u8&name=NBCS%20California%20USA',
  },
  {
    id: 'f00beb2c93',
    streamId: 'f00beb2c93',
    name: 'NBCS Bay Area USA',
    category: 'Basketball',
    network: 'NBC Sports',
    color: '#2563eb',
    badge: 'https://ondemand.st/img/c/f00beb2c93.png',
    bg: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Golden State Warriors & Live Sports',
    viewers: '74K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2Ff00beb2c93.m3u8&name=NBCS%20Bay%20Area%20USA',
  },
  {
    id: '6da7108b96',
    streamId: '6da7108b96',
    name: 'MSG USA',
    category: 'Basketball',
    network: 'MSG Networks',
    color: '#ea580c',
    badge: 'https://ondemand.st/img/c/6da7108b96.png',
    bg: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    currentShow: 'New York Knicks Live',
    viewers: '69K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F6da7108b96.m3u8&name=MSG%20USA',
  },
  {
    id: '4c830cb083',
    streamId: '4c830cb083',
    name: 'BTN USA',
    category: 'Basketball',
    network: 'Big Ten Network',
    color: '#0284c7',
    badge: 'https://ondemand.st/img/c/4c830cb083.png',
    bg: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=800&q=80',
    currentShow: 'NCAAB & NCAAF Big Ten Action',
    viewers: '51K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F4c830cb083.m3u8&name=BTN%20USA',
  },
  {
    id: 'da98cf8d61',
    streamId: 'da98cf8d61',
    name: 'ACC Network USA',
    category: 'Basketball',
    network: 'ESPN',
    color: '#1d4ed8',
    badge: 'https://ondemand.st/img/c/da98cf8d61.png',
    bg: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    currentShow: 'ACC College Basketball Live',
    viewers: '43K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2Fda98cf8d61.m3u8&name=ACC%20Network%20USA',
  },
  {
    id: '6e51e0fd3a',
    streamId: '6e51e0fd3a',
    name: 'Nova Sports Prime Greece',
    category: 'Basketball',
    network: 'Nova Sports',
    color: '#0369a1',
    badge: 'https://ondemand.st/img/c/6e51e0fd3a.png',
    bg: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Turkish Airlines EuroLeague Live',
    viewers: '57K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=540&url=%2Fc%2F6e51e0fd3a.m3u8&name=Nova%20Sports%20Prime%20Greece',
  },
  {
    id: '9b87bf6a59',
    streamId: '9b87bf6a59',
    name: 'Arena 1 Premium Serbia',
    category: 'Basketball',
    network: 'Arena Sport',
    color: '#dc2626',
    badge: 'https://ondemand.st/img/c/9b87bf6a59.png',
    bg: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    currentShow: 'EuroLeague & NBA Live Coverage',
    viewers: '62K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=540&url=%2Fc%2F9b87bf6a59.m3u8&name=Arena%201%20Premium%20Serbia',
  },
  {
    id: 'c2ca1e9995',
    streamId: 'c2ca1e9995',
    name: 'Sportklub 1 Croatia',
    category: 'Basketball',
    network: 'Sportklub',
    color: '#0284c7',
    badge: 'https://ondemand.st/img/c/c2ca1e9995.png',
    bg: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=800&q=80',
    currentShow: 'EuroLeague Basketball Live',
    viewers: '46K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=540&url=%2Fc%2Fc2ca1e9995.m3u8&name=Sportklub%201%20Croatia',
  },
  {
    id: '0278c7d01a',
    streamId: '0278c7d01a',
    name: 'Sport 5 Israel',
    category: 'Basketball',
    network: 'Sport 5',
    color: '#2563eb',
    badge: 'https://ondemand.st/img/c/0278c7d01a.png',
    bg: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    currentShow: 'EuroLeague & NBA Live',
    viewers: '38K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=540&url=%2Fc%2F0278c7d01a.m3u8&name=Sport%205%20Israel',
  },
  {
    id: 'ec14aa2419',
    streamId: 'ec14aa2419',
    name: 'beIN Sports 1 France',
    category: 'Basketball',
    network: 'beIN Sports',
    color: '#7e22ce',
    badge: 'https://ondemand.st/img/c/ec14aa2419.png',
    bg: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=800&q=80',
    currentShow: 'NBA Extra & Live Games',
    viewers: '66K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2Fec14aa2419.m3u8&name=beIN%20Sports%201%20France',
  },

  // --- HOCKEY ---
  {
    id: '95d02851f1',
    streamId: '95d02851f1',
    name: 'TNT USA',
    category: 'Hockey',
    network: 'TNT Sports',
    color: '#dc2626',
    badge: 'https://ondemand.st/img/c/95d02851f1.png',
    bg: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=800&q=80',
    currentShow: 'NHL on TNT Live',
    viewers: '91K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F95d02851f1.m3u8&name=TNT%20USA',
  },
  {
    id: '4d6dffafb2',
    streamId: '4d6dffafb2',
    name: 'Altitude USA',
    category: 'Hockey',
    network: 'Altitude Sports',
    color: '#1d4ed8',
    badge: 'https://ondemand.st/img/c/4d6dffafb2.png',
    bg: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Colorado Avalanche Live Hockey',
    viewers: '42K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F4d6dffafb2.m3u8&name=Altitude%20USA',
  },
  {
    id: 'b0362efc67',
    streamId: 'b0362efc67',
    name: 'Sportsnet One',
    category: 'Hockey',
    network: 'Sportsnet',
    color: '#dc2626',
    badge: 'https://ondemand.st/img/c/b0362efc67.png',
    bg: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=800&q=80',
    currentShow: 'NHL & NBA Live Action',
    viewers: '68K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2Fb0362efc67.m3u8&name=Sportsnet%20One',
  },
  {
    id: '619836ea5d',
    streamId: '619836ea5d',
    name: 'Sportsnet East',
    category: 'Hockey',
    network: 'Sportsnet',
    color: '#dc2626',
    badge: 'https://ondemand.st/img/c/619836ea5d.png',
    bg: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Toronto Maple Leafs Live',
    viewers: '73K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F619836ea5d.m3u8&name=Sportsnet%20East',
  },
  {
    id: '9047d6ff46',
    streamId: '9047d6ff46',
    name: 'Sportsnet West',
    category: 'Hockey',
    network: 'Sportsnet',
    color: '#dc2626',
    badge: 'https://ondemand.st/img/c/9047d6ff46.png',
    bg: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Edmonton Oilers & NHL Live',
    viewers: '65K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F9047d6ff46.m3u8&name=Sportsnet%20West',
  },
  {
    id: '55fafe7b0e',
    streamId: '55fafe7b0e',
    name: 'Sportsnet+ (CA)',
    category: 'Hockey',
    network: 'Sportsnet',
    color: '#dc2626',
    badge: 'https://ondemand.st/img/c/55fafe7b0e.png',
    bg: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=800&q=80',
    currentShow: 'NHL Canadian Broadcast Live',
    viewers: '59K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F55fafe7b0e.m3u8&name=Sportsnet%2B%20(CA)',
  },
  {
    id: 'd25f2e314a',
    streamId: 'd25f2e314a',
    name: 'TSN2',
    category: 'Hockey',
    network: 'TSN',
    color: '#b91c1c',
    badge: 'https://ondemand.st/img/c/d25f2e314a.png',
    bg: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Montreal Canadiens Live Hockey',
    viewers: '54K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2Fd25f2e314a.m3u8&name=TSN2',
  },
  {
    id: 'a3b8955efe',
    streamId: 'a3b8955efe',
    name: 'TSN3',
    category: 'Hockey',
    network: 'TSN',
    color: '#b91c1c',
    badge: 'https://ondemand.st/img/c/a3b8955efe.png',
    bg: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Winnipeg Jets Live Hockey',
    viewers: '48K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2Fa3b8955efe.m3u8&name=TSN3',
  },
  {
    id: '2bf2123218',
    streamId: '2bf2123218',
    name: 'SportsNet Pittsburgh',
    category: 'Hockey',
    network: 'SportsNet',
    color: '#ca8a04',
    badge: 'https://ondemand.st/img/c/2bf2123218.png',
    bg: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Pittsburgh Penguins & NCAAF Live',
    viewers: '37K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F2bf2123218.m3u8&name=SportsNet%20Pittsburgh',
  },
  {
    id: '8853be9c63',
    streamId: '8853be9c63',
    name: 'Monumental Sports Network',
    category: 'Hockey',
    network: 'Monumental',
    color: '#dc2626',
    badge: 'https://ondemand.st/img/c/8853be9c63.png',
    bg: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Washington Capitals Live',
    viewers: '34K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F8853be9c63.m3u8&name=Monumental%20Sports%20Network',
  },
  {
    id: '32ff1a6fd2',
    streamId: '32ff1a6fd2',
    name: 'NBCS Philadelphia USA',
    category: 'Hockey',
    network: 'NBC Sports',
    color: '#ea580c',
    badge: 'https://ondemand.st/img/c/32ff1a6fd2.png',
    bg: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Philadelphia Flyers Live',
    viewers: '40K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F32ff1a6fd2.m3u8&name=NBCS%20Philadelphia%20USA',
  },
  {
    id: 'ca4553fbbf',
    streamId: 'ca4553fbbf',
    name: 'Chicago Sports Network',
    category: 'Hockey',
    network: 'CHSN',
    color: '#dc2626',
    badge: 'https://ondemand.st/img/c/ca4553fbbf.png',
    bg: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Chicago Blackhawks Live',
    viewers: '45K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2Fca4553fbbf.m3u8&name=Chicago%20Sports%20Network',
  },
  {
    id: 'b50d6e58d4',
    streamId: 'b50d6e58d4',
    name: 'NHL Gamecenter',
    category: 'Hockey',
    network: 'NHL',
    color: '#18181b',
    badge: 'https://ondemand.st/img/c/b50d6e58d4.png',
    bg: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=800&q=80',
    currentShow: 'NHL Out-of-Market Live Broadcast',
    viewers: '61K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2Fb50d6e58d4.m3u8&name=NHL%20Gamecenter',
  },
  {
    id: '5ba39a95b5',
    streamId: '5ba39a95b5',
    name: 'Viaplay Sports 1 UK',
    category: 'Hockey',
    network: 'Viaplay',
    color: '#e11d48',
    badge: 'https://ondemand.st/img/c/5ba39a95b5.png',
    bg: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Live NHL & European Sports',
    viewers: '33K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F5ba39a95b5.m3u8&name=Viaplay%20Sports%201%20UK',
  },
  {
    id: '267f9c71ba',
    streamId: '267f9c71ba',
    name: 'Viaplay Sports 2 UK',
    category: 'Hockey',
    network: 'Viaplay',
    color: '#e11d48',
    badge: 'https://ondemand.st/img/c/267f9c71ba.png',
    bg: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Live NHL Ice Hockey',
    viewers: '28K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F267f9c71ba.m3u8&name=Viaplay%20Sports%202%20UK',
  },
  {
    id: '2b5a227a54',
    streamId: '2b5a227a54',
    name: 'V Sport Premium',
    category: 'Hockey',
    network: 'Viaplay',
    color: '#be123c',
    badge: 'https://ondemand.st/img/c/2b5a227a54.png',
    bg: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=800&q=80',
    currentShow: 'NHL Live Hockey Coverage',
    viewers: '35K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F2b5a227a54.m3u8&name=V%20Sport%20Premium',
  },
  {
    id: '247-nhl-network-29780',
    streamId: '247-nhl-network-29780',
    name: 'NHL Network',
    category: 'Hockey',
    network: 'NHL',
    color: '#18181b',
    badge: 'https://ondemand.st/img/c/247-nhl-network-29780.png',
    bg: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=800&q=80',
    currentShow: '24/7 NHL Tonight & Live Look-Ins',
    viewers: '52K',
    hd: true,
    embed: 'https://damitv.st/embed/?id=247-nhl-network-29780',
  },

  // --- MOTORSPORTS ---
  {
    id: 'f3534236bb',
    streamId: 'f3534236bb',
    name: 'Sky Sports F1 UK',
    category: 'Motorsports',
    network: 'Sky Sports',
    color: '#dc2626',
    badge: 'https://ondemand.st/img/c/f3534236bb.png',
    bg: 'https://images.unsplash.com/photo-1532906619279-a4b7267faa66?auto=format&fit=crop&w=800&q=80',
    currentShow: 'F1 Las Vegas Grand Prix Weekend',
    viewers: '154K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2Ff3534236bb.m3u8&name=Sky%20Sports%20F1%20UK',
  },
  {
    id: '87c190704e',
    streamId: '87c190704e',
    name: 'CANAL+ MotoGP France',
    category: 'Motorsports',
    network: 'CANAL+',
    color: '#18181b',
    badge: 'https://ondemand.st/img/c/87c190704e.png',
    bg: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
    currentShow: 'MotoGP Valencia Grand Prix',
    viewers: '68K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F87c190704e.m3u8&name=CANAL%2B%20MotoGP%20France',
  },
  {
    id: '247-rally-tv',
    streamId: '247-rally-tv',
    name: 'Rally TV',
    category: 'Motorsports',
    network: 'WRC',
    color: '#ea580c',
    badge: 'https://ondemand.st/img/c/247-rally-tv.png',
    bg: 'https://images.unsplash.com/photo-1532906619279-a4b7267faa66?auto=format&fit=crop&w=800&q=80',
    currentShow: '24/7 World Rally Championship',
    viewers: '26K',
    hd: true,
    embed: 'https://damitv.st/embed/?id=247-rally-tv',
  },

  // --- AMERICAN FOOTBALL & US SPORTS ---
  {
    id: '247-nfl-network',
    streamId: '247-nfl-network',
    name: 'NFL Network',
    category: 'American Football',
    network: 'NFL',
    color: '#1d4ed8',
    badge: 'https://ondemand.st/img/c/247-nfl-network.png',
    bg: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=800&q=80',
    currentShow: '24/7 NFL GameDay & Live Coverage',
    viewers: '132K',
    hd: true,
    embed: 'https://damitv.st/embed/?id=247-nfl-network',
  },
  {
    id: '1ac9bf5091',
    streamId: '1ac9bf5091',
    name: 'NFL RedZone',
    category: 'American Football',
    network: 'NFL',
    color: '#dc2626',
    badge: 'https://ondemand.st/img/c/1ac9bf5091.png',
    bg: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Every Touchdown From Every Game',
    viewers: '175K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F1ac9bf5091.m3u8&name=NFL%20RedZone',
  },
  {
    id: '5f3ab15fe7',
    streamId: '5f3ab15fe7',
    name: 'Fox Sports 1 USA',
    category: 'American Football',
    network: 'Fox Sports',
    color: '#0284c7',
    badge: 'https://ondemand.st/img/c/5f3ab15fe7.png',
    bg: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=800&q=80',
    currentShow: 'FS1 Live Sports, NCAAF & MLS',
    viewers: '81K',
    hd: true,
    embed: 'https://ondemand.to/player/hls/?v=542&url=%2Fc%2F5f3ab15fe7.m3u8&name=Fox%20Sports%201%20USA',
  },
  {
    id: '9312c6fb66',
    streamId: '9312c6fb66',
    name: 'Fox Sports 2 USA',
    category: 'American Football',
    network: 'Fox Sports',
    color: '#0369a1',
    badge: 'https://ondemand.st/img/c/9312c6fb66.png',
    bg: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=800&q=80',
    currentShow: 'FS2 Live Sports & Racing',
    viewers: '47K',
    hd: true,
    embed: 'https://ondemand.to/player/hls/?v=542&url=%2Fc%2F9312c6fb66.m3u8&name=Fox%20Sports%202%20USA',
  },
  {
    id: 'baeebc67f1',
    streamId: 'baeebc67f1',
    name: 'CBS Sports Network',
    category: 'American Football',
    network: 'CBS Sports',
    color: '#1d4ed8',
    badge: 'https://ondemand.st/img/c/baeebc67f1.png',
    bg: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=800&q=80',
    currentShow: 'NCAA College Football & UWCL Live',
    viewers: '64K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2Fbaeebc67f1.m3u8&name=CBS%20Sports%20Network',
  },
  {
    id: '3c5686770c',
    streamId: '3c5686770c',
    name: 'SEC Network USA',
    category: 'American Football',
    network: 'ESPN',
    color: '#1e3a8a',
    badge: 'https://ondemand.st/img/c/3c5686770c.png',
    bg: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=800&q=80',
    currentShow: 'SEC College Football Live',
    viewers: '58K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F3c5686770c.m3u8&name=SEC%20Network%20USA',
  },
  {
    id: '575d140b55',
    streamId: '575d140b55',
    name: 'Space City Home Network',
    category: 'American Football',
    network: 'SCHN',
    color: '#0369a1',
    badge: 'https://ondemand.st/img/c/575d140b55.png',
    bg: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Houston Texans Live Coverage',
    viewers: '47K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F575d140b55.m3u8&name=Space%20City%20Home%20Network',
  },
  {
    id: '5a8b963cec',
    streamId: '5a8b963cec',
    name: 'CBS USA',
    category: 'American Football',
    network: 'CBS',
    color: '#1d4ed8',
    badge: 'https://ondemand.st/img/c/5a8b963cec.png',
    bg: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=800&q=80',
    currentShow: 'CBS Sports Live Broadcast',
    viewers: '92K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F5a8b963cec.m3u8&name=CBS%20USA',
  },

  // --- COMBAT & WRESTLING ---
  {
    id: '77d86e7f9a',
    streamId: '77d86e7f9a',
    name: 'WWE Network',
    category: 'Wrestling',
    network: 'WWE',
    color: '#dc2626',
    badge: 'https://ondemand.st/img/c/77d86e7f9a.png',
    bg: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80',
    currentShow: 'WWE Monday Night Raw & SmackDown',
    viewers: '105K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=540&url=%2Fc%2F77d86e7f9a.m3u8&name=WWE%20Network',
  },
  {
    id: '514caab7d2',
    streamId: '514caab7d2',
    name: 'AMC USA',
    category: 'Wrestling',
    network: 'AMC',
    color: '#18181b',
    badge: 'https://ondemand.st/img/c/514caab7d2.png',
    bg: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80',
    currentShow: 'TNA Impact Wrestling Live',
    viewers: '34K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F514caab7d2.m3u8&name=AMC%20USA',
  },
  {
    id: 'c9c6bd3019',
    streamId: 'c9c6bd3019',
    name: 'Sportsnet 360 Canada',
    category: 'Wrestling',
    network: 'Sportsnet',
    color: '#dc2626',
    badge: 'https://ondemand.st/img/c/c9c6bd3019.png',
    bg: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Pro Wrestling & Sports Highlights',
    viewers: '41K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2Fc9c6bd3019.m3u8&name=Sportsnet%20360%20Canada',
  },

  // --- TENNIS, GOLF, RUGBY & AUSSIE RULES ---
  {
    id: '229d7c7755',
    streamId: '229d7c7755',
    name: 'Tennis Channel',
    category: 'Tennis',
    network: 'Sinclair',
    color: '#16a34a',
    badge: 'https://ondemand.st/img/c/229d7c7755.png',
    bg: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
    currentShow: 'ATP & WTA Tour Live Coverage',
    viewers: '46K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F229d7c7755.m3u8&name=Tennis%20Channel',
  },
  {
    id: '9f5dca47df',
    streamId: '9f5dca47df',
    name: 'Sky Sports Golf',
    category: 'Golf',
    network: 'Sky Sports',
    color: '#15803d',
    badge: 'https://ondemand.st/img/c/9f5dca47df.png',
    bg: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80',
    currentShow: 'PGA & DP World Tour Live',
    viewers: '39K',
    hd: true,
    embed: 'https://damitv.st/player/hls/?v=542&url=%2Fc%2F9f5dca47df.m3u8&name=Sky%20Sports%20Golf',
  },
  {
    id: '247-247-fox-footy',
    streamId: '247-247-fox-footy',
    name: 'Fox Footy',
    category: 'Australian Football',
    network: 'Fox Sports',
    color: '#ea580c',
    badge: 'https://ondemand.st/img/c/247-247-fox-footy.png',
    bg: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    currentShow: '24/7 AFL Premiership Coverage',
    viewers: '31K',
    hd: true,
    embed: 'https://damitv.st/embed/?id=247-247-fox-footy',
  },
  {
    id: '247-247-fox-league',
    streamId: '247-247-fox-league',
    name: 'Fox League',
    category: 'Rugby League',
    network: 'Fox Sports',
    color: '#0284c7',
    badge: 'https://ondemand.st/img/c/247-247-fox-league.png',
    bg: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    currentShow: '24/7 NRL Telstra Premiership',
    viewers: '33K',
    hd: true,
    embed: 'https://damitv.st/embed/?id=247-247-fox-league',
  },

  // --- 24/7 ENTERTAINMENT & CARTOONS ---
  {
    id: '247-247-south-park',
    streamId: '247-247-south-park',
    name: 'South Park 24/7',
    category: 'Cartoons',
    network: 'Comedy Central',
    color: '#eab308',
    badge: 'https://ondemand.st/img/c/247-247-south-park.png',
    bg: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Non-Stop South Park Marathon',
    viewers: '44K',
    hd: true,
    embed: 'https://damitv.st/embed/?id=247-247-south-park',
  },
  {
    id: '247-247-family-guy',
    streamId: '247-247-family-guy',
    name: 'Family Guy 24/7',
    category: 'Cartoons',
    network: 'FOX',
    color: '#0284c7',
    badge: 'https://ondemand.st/img/c/247-247-family-guy.png',
    bg: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Non-Stop Family Guy Episodes',
    viewers: '51K',
    hd: true,
    embed: 'https://damitv.st/embed/?id=247-247-family-guy',
  },
  {
    id: '247-247-the-simpsons',
    streamId: '247-247-the-simpsons',
    name: 'The Simpsons 24/7',
    category: 'Cartoons',
    network: 'FOX',
    color: '#facc15',
    badge: 'https://ondemand.st/img/c/247-247-the-simpsons.png',
    bg: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    currentShow: 'Classic Simpsons All Day',
    viewers: '48K',
    hd: true,
    embed: 'https://damitv.st/embed/?id=247-247-the-simpsons',
  },
];

// Alias for backwards compatibility
export const LIVE_TV_CHANNELS = LIVE_CHANNELS;

/**
 * Fallback live streams conforming to the ondemand.st /papi/api/streams schema
 */
export const FALLBACK_LIVE_STREAMS = [
  {
    category: "american-football",
    id: 1,
    streams: [
      {
        id: "espn-401858304",
        name: "Florida State Seminoles vs NC State Wolfpack",
        poster: "https://ondemand.st/img/cards/college-football/401858304.jpg?v=nf2nf",
        starts_at: 1795293000,
        ends_at: 1795303800,
        category_name: "american-football",
        status: "live",
        league: "NCAAF",
        teams: {
          home: {
            name: "Florida State Seminoles",
            badge: "https://a.espncdn.com/i/teamlogos/ncaa/500/52.png",
            color: ""
          },
          away: {
            name: "NC State Wolfpack",
            badge: "https://a.espncdn.com/i/teamlogos/ncaa/500/152.png",
            color: ""
          }
        },
        viewers: 17,
        always_live: 0,
        sources: [
          {
            source: "hls",
            id: "s1",
            name: "Server 1",
            embed: "https://damitv.st/embed/?id=m401858304"
          },
          {
            source: "hls",
            id: "s2",
            name: "Server 1 SD",
            sd: 1,
            hd: 0,
            embed: "https://damitv.st/embed/?id=cfb%2F2026-11-21%2Fsdsu-bois_540p"
          }
        ],
        embed: "https://damitv.st/embed/?id=m401858304"
      },
      {
        id: "espn-401860920",
        name: "Texas State Bobcats vs Washington State Cougars",
        poster: "https://ondemand.st/img/cards/college-football/401860920.jpg?v=nf2nf",
        starts_at: 1795302000,
        ends_at: 1795312800,
        category_name: "american-football",
        status: "live",
        league: "NCAAF",
        teams: {
          home: {
            name: "Texas State Bobcats",
            badge: "https://a.espncdn.com/i/teamlogos/ncaa/500/326.png",
            color: ""
          },
          away: {
            name: "Washington State Cougars",
            badge: "https://a.espncdn.com/i/teamlogos/ncaa/500/265.png",
            color: ""
          }
        },
        viewers: 14,
        always_live: 0,
        sources: [
          {
            source: "hls",
            id: "s1",
            name: "Server 1",
            embed: "https://damitv.st/embed/?id=m401860920"
          },
          {
            source: "hls",
            id: "s2",
            name: "Server 1 SD",
            sd: 1,
            hd: 0,
            embed: "https://damitv.st/embed/?id=cfb%2F2026-11-21%2Fsdsu-bois_540p"
          }
        ],
        embed: "https://damitv.st/embed/?id=m401860920"
      }
    ]
  },
  {
    category: "football",
    id: 2,
    streams: [
      {
        id: "soccer-arsenal-mancity",
        name: "Arsenal vs Manchester City",
        poster: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
        starts_at: Math.floor(Date.now() / 1000) - 1800,
        ends_at: Math.floor(Date.now() / 1000) + 5400,
        category_name: "football",
        status: "live",
        league: "Premier League",
        teams: {
          home: {
            name: "Arsenal",
            badge: "https://media.api-sports.io/football/teams/42.png",
            color: "#EF0107"
          },
          away: {
            name: "Manchester City",
            badge: "https://media.api-sports.io/football/teams/50.png",
            color: "#6CABDD"
          }
        },
        viewers: 1420,
        always_live: 0,
        sources: [
          {
            source: "hls",
            id: "s1",
            name: "Server 1 (HD)",
            embed: "https://damitv.st/embed/?id=247-247-sky-main-event"
          },
          {
            source: "hls",
            id: "s2",
            name: "Server 2 (TNT)",
            embed: "https://damitv.st/embed/?id=247-247-tnt-sports-1"
          }
        ],
        embed: "https://damitv.st/embed/?id=247-247-sky-main-event"
      },
      {
        id: "soccer-real-barca",
        name: "Real Madrid vs FC Barcelona",
        poster: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
        starts_at: Math.floor(Date.now() / 1000) - 3600,
        ends_at: Math.floor(Date.now() / 1000) + 3600,
        category_name: "football",
        status: "live",
        league: "La Liga - El Clásico",
        teams: {
          home: {
            name: "Real Madrid",
            badge: "https://media.api-sports.io/football/teams/541.png",
            color: "#FFFFFF"
          },
          away: {
            name: "FC Barcelona",
            badge: "https://media.api-sports.io/football/teams/529.png",
            color: "#A50044"
          }
        },
        viewers: 2830,
        always_live: 0,
        sources: [
          {
            source: "hls",
            id: "s1",
            name: "Server 1 (HD)",
            embed: "https://damitv.st/embed/?id=247-247-tnt-sports-1"
          }
        ],
        embed: "https://damitv.st/embed/?id=247-247-tnt-sports-1"
      }
    ]
  },
  {
    category: "cricket",
    id: 3,
    streams: [
      {
        id: "cricket-ind-aus",
        name: "India vs Australia - Border Gavaskar Trophy",
        poster: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80",
        starts_at: Math.floor(Date.now() / 1000) - 7200,
        ends_at: Math.floor(Date.now() / 1000) + 14400,
        category_name: "cricket",
        status: "live",
        league: "ICC Test Series",
        teams: {
          home: {
            name: "India",
            badge: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=100&q=80",
            color: "#0078FF"
          },
          away: {
            name: "Australia",
            badge: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=100&q=80",
            color: "#FFD700"
          }
        },
        viewers: 8500,
        always_live: 0,
        sources: [
          {
            source: "hls",
            id: "s1",
            name: "Willow Cricket (HD)",
            embed: "https://damitv.st/embed/?id=247-247-willow"
          },
          {
            source: "hls",
            id: "s2",
            name: "Willow 2",
            embed: "https://damitv.st/embed/?id=247-247-willow"
          }
        ],
        embed: "https://damitv.st/embed/?id=247-247-willow"
      }
    ]
  },
  {
    category: "basketball",
    id: 4,
    streams: [
      {
        id: "nba-lakers-warriors",
        name: "Los Angeles Lakers vs Golden State Warriors",
        poster: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
        starts_at: Math.floor(Date.now() / 1000) - 2400,
        ends_at: Math.floor(Date.now() / 1000) + 4800,
        category_name: "basketball",
        status: "live",
        league: "NBA",
        teams: {
          home: {
            name: "LA Lakers",
            badge: "https://a.espncdn.com/i/teamlogos/nba/500/lal.png",
            color: "#552583"
          },
          away: {
            name: "GS Warriors",
            badge: "https://a.espncdn.com/i/teamlogos/nba/500/gsw.png",
            color: "#1D428A"
          }
        },
        viewers: 950,
        always_live: 0,
        sources: [
          {
            source: "hls",
            id: "s1",
            name: "Server 1 (Fox Sports)",
            embed: "https://damitv.st/embed/?id=247-247-fox-sports-1"
          }
        ],
        embed: "https://damitv.st/embed/?id=247-247-fox-sports-1"
      }
    ]
  }
];

let memoryLiveMatchesCache = [];

/**
 * Finds a channel by streamId or id
 */
export function getLiveChannelById(idOrStreamId) {
  if (!idOrStreamId) return null;
  const str = String(idOrStreamId).trim();
  return (
    LIVE_CHANNELS.find(
      (ch) => String(ch.id) === str || String(ch.streamId) === str
    ) || null
  );
}

/**
 * Flattens nested category streams into a single list of match objects
 */
export function flattenLiveMatches(streamsData) {
  if (!streamsData) return [];
  const list = Array.isArray(streamsData)
    ? streamsData
    : Array.isArray(streamsData.streams)
      ? streamsData.streams
      : [];

  const matches = [];

  list.forEach((catGroup) => {
    const categoryName = catGroup.category || catGroup.name || 'sports';
    const subStreams = Array.isArray(catGroup.streams) ? catGroup.streams : [];
    subStreams.forEach((m) => {
      if (!m || !m.id) return;
      matches.push({
        ...m,
        category_name: m.category_name || categoryName,
        embed: m.embed || m.sources?.[0]?.embed || '',
        status: m.status || (m.always_live ? 'live' : 'live'),
      });
    });
  });

  return matches;
}

/**
 * Returns cached live matches from memory, localStorage or fallback data
 */
export function getCachedLiveMatches() {
  if (memoryLiveMatchesCache.length > 0) return memoryLiveMatchesCache;
  try {
    const raw = localStorage.getItem('cineflix_live_matches_cache');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryLiveMatchesCache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading live matches cache:', err);
  }
  const fallback = flattenLiveMatches(FALLBACK_LIVE_STREAMS);
  memoryLiveMatchesCache = fallback;
  return fallback;
}

/**
 * Finds either a live match (from ondemand.st API) or a live 24/7 channel by id
 */
export function getLiveStreamOrMatchById(idOrStreamId) {
  if (!idOrStreamId) return null;
  const str = String(idOrStreamId).trim();

  // 1. Search in cached live matches
  const matches = getCachedLiveMatches();
  const match = matches.find((m) => String(m.id) === str || String(m.streamId) === str);
  if (match) return match;

  // 2. Search in LIVE_CHANNELS
  const channel = getLiveChannelById(str);
  if (channel) return channel;

  return null;
}

/**
 * Fetch live match streams from https://ondemand.st/papi/api/streams
 * Uses local proxy /papi/api/streams, direct fallback, and CORS proxies with fallback to cache
 */
export async function fetchLiveStreamsData() {
  const endpoints = [
    '/papi/api/streams', // Proxied through Vite server or Cloudflare Worker
    'https://ondemand.st/papi/api/streams', // Direct
    'https://corsproxy.io/?https%3A%2F%2Fondemand.st%2Fpapi%2Fapi%2Fstreams', // CORS proxy 1
    'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://ondemand.st/papi/api/streams'), // CORS proxy 2
  ];

  let rawData = null;

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.streams) && json.streams.length > 0) {
          rawData = json;
          break;
        }
      }
    } catch {
      // Try next endpoint
    }
  }

  if (rawData && Array.isArray(rawData.streams) && rawData.streams.length > 0) {
    const flat = flattenLiveMatches(rawData);
    memoryLiveMatchesCache = flat;
    try {
      localStorage.setItem('cineflix_live_matches_cache', JSON.stringify(flat));
    } catch { }
    return {
      success: true,
      streams: rawData.streams,
      matches: flat,
      channels: LIVE_CHANNELS,
      isLiveApi: true,
      timestamp: rawData.timestamp || Math.floor(Date.now() / 1000),
    };
  }

  // Fallback to cache or built-in schema-matching data
  const fallbackMatches = getCachedLiveMatches();
  return {
    success: true,
    streams: FALLBACK_LIVE_STREAMS,
    matches: fallbackMatches,
    channels: LIVE_CHANNELS,
    isLiveApi: false,
    timestamp: Math.floor(Date.now() / 1000),
  };
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
  return String(num || 'Live');
}
