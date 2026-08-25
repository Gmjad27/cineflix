export const STUDIO_COLLECTIONS = [
  {
    key: "PRIME VIDEO",
    label: "PRIME VIDEO",
    img: "https://1000logos.net/wp-content/uploads/2022/10/Amazon-Prime-Video-Emblem.png",
    bg: "https://1000logos.net/wp-content/uploads/2022/10/Amazon-Prime-Video-Emblem.png",
    color: "#00A8E1",
    companyIds: [21, 41, 60, 20580, 210099],
    networkIds: [1024, 6219, 922]
  },

  {
    key: "APPLE TV PLUS",
    label: "APPLE TV PLUS",
    img: "https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg",
    bg: "https://cdn.mos.cms.futurecdn.net/8d8GYMeugMGTHYYNzKPdP-2560-80.jpg",
    color: "#A2A2A2",
    companyIds: [127928, 198031],
    networkIds: [2552]
  },
  {
    key: "NETFLIX",
    label: "NETFLIX",
    img: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    bg: "https://wallpapercave.com/wp/wp14818830.webp",
    color: "#E50914",
    companyIds: [178464, 171251, 193619, 145174],
    networkIds: [213]
  },

  {
    key: "HBO MAX",
    label: "HBO MAX",
    img: "https://1000logos.net/wp-content/uploads/2022/02/HBO-Max-Logo.png",
    bg: "https://1000logos.net/wp-content/uploads/2022/02/HBO-Max-Logo.png",
    color: "#8A2BE2",
    companyIds: [3268, 7429, 125306, 158691, 14914, 174, 17, 1957, 2785],
    networkIds: [49, 3186, 8304]
  },
  {
    key: "PEACOCK",
    label: "PEACOCK",
    img: "https://logos-world.net/wp-content/uploads/2023/03/Peacock-Logo.png",
    bg: "https://logos-world.net/wp-content/uploads/2023/03/Peacock-Logo.png",
    color: "#F5A623",
    companyIds: [33, 26727, 34047, 12053],
    networkIds: [3353, 6]
  },
  {
    key: "PARAMOUNT",
    label: "PARAMOUNT",
    img: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Paramount%2B_logo.svg",
    bg: "https://static0.cbrimages.com/wordpress/wp-content/uploads/2022/09/Paramount-logo.jpg?w=1200&h=675&fit=crop",
    color: "#0064FF",
    companyIds: [4, 6329, 1081, 270146],
    networkIds: [4330, 6631, 2199]
  },
  {
    key: "DISNEY",
    label: "DISNEY",
    img: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg",
    bg: "https://slidechef.net/wp-content/uploads/2024/03/disney-cartoons-background.jpg",
    color: "#113CCF",
    companyIds: [2, 8036],
    networkIds: [2739, 4429, 622, 8036]
  },
  {
    key: "MARVEL",
    label: "MARVEL",
    img: "https://www.pngall.com/wp-content/uploads/13/Marvel-Logo-PNG.png",
    bg: "https://www.pngall.com/wp-content/uploads/13/Marvel-Logo-PNG.png",
    color: "#ED1D24",
    companyIds: [420, 7505, 11106, 13252],
    networkIds: []
  },
  {
    key: "DC",
    label: "DC",
    img: "https://i.redd.it/cfvhmn3tv4af1.png",
    bg: "https://images.thedirect.com/media/article_full/dcsetback.jpg",
    color: "#0074E8",
    companyIds: [184898, 9993, 429, 125306, 230018],
    networkIds: []
  },
  // ── New additions ──
  {
    key: "HULU",
    label: "HULU",
    img: "https://commons.wikimedia.org/wiki/Special:FilePath/Hulu%20logo%20(2018).svg",
    bg: "https://wallpapers.com/images/hd/hulu-streaming-service-background-9r1x0q0z1s7v9y2g.jpg",
    color: "#1CE783",
    companyIds: [25893, 11461], // Fetches Hulu Original Movies 
    networkIds: [453]           // Fetches Hulu TV Shows
  }

];

export const getStudioConfig = (studioKey) => {
  const key = String(studioKey || "").toUpperCase().trim();
  return STUDIO_COLLECTIONS.find((studio) => studio.key === key) || null;
};

// check OTT company or network
const belongsToStudio = (item, studio) => {
  const companyMatch =
    Array.isArray(item?.production_companies) &&
    item.production_companies.some((c) => studio.companyIds.includes(c.id));

  const networkMatch =
    Array.isArray(item?.networks) &&
    item.networks.some((n) => studio.networkIds.includes(n.id));

  return companyMatch || networkMatch;
};

export const filterByStudioCollection = (items, studioKey, type = "all") => {
  const studio = getStudioConfig(studioKey);
  if (!studio) return [];

  let filtered = (Array.isArray(items) ? items : []).filter((item) =>
    belongsToStudio(item, studio)
  );

  // separate movies and tv
  if (type === "movie") {
    filtered = filtered.filter((item) => item.media_type === "movie");
  }

  if (type === "tv") {
    filtered = filtered.filter((item) => item.media_type === "tv");
  }

  // latest date first
  filtered.sort((a, b) => {
    const dateA = new Date(a.release_date || a.first_air_date || 0);
    const dateB = new Date(b.release_date || b.first_air_date || 0);
    return dateB - dateA;
  });

  return filtered;
};