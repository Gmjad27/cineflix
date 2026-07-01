export const STUDIO_COLLECTIONS = [
  {
    key: "PRIME VIDEO",
    label: "PRIME VIDEO",
    img: "https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg",
    bg: "https://www.cnet.com/a/img/resize/b3d77540535b980192421ac4d1aa5687dc1d1eaa/hub/2022/10/03/10a0d96d-1b0b-4f8f-ba3b-b893d21edb65/prime-video.jpg?auto=webp&fit=crop&height=675&width=1200",
    color: "#00A8E1",
    companyIds: [21, 20580],
    networkIds: [1024]
  },
  {
    key: "APPLE TV PLUS",
    label: "APPLE TV PLUS",
    img: "https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg",
    bg: "https://cdn.mos.cms.futurecdn.net/8d8GYMeugMGTHYYNzKPdP-2560-80.jpg",
    color: "#A2A2A2",
    companyIds: [127928],
    networkIds: [2552]
  },
  {
    key: "NETFLIX",
    label: "NETFLIX",
    img: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    bg: "https://akm-img-a-in.tosshub.com/indiatoday/images/story/202012/Netflix-New-Feature-Audio-Only_1200x768.jpeg?size=1200:675",
    color: "#E50914",
    companyIds: [178464],
    networkIds: [213]
  },
  {
    key: "HBO",
    label: "HBO",
    img: "https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg",
    bg: "https://wallpapers.com/images/hd/hbo-max-bubbles-f30tuj7m9kdocwaa.jpg",
    color: "#8A2BE2",
    companyIds: [3268, 125306, 7429],
    networkIds: [3186, 49]
  },
  {
    key: "PEACOCK",
    label: "PEACOCK",
    img: "https://upload.wikimedia.org/wikipedia/commons/d/d3/NBCUniversal_Peacock_Logo.svg",
    bg: "https://static0.howtogeekimages.com/wordpress/wp-content/uploads/2023/02/Peacock-logo.jpg?w=1600&h=900&fit=crop",
    color: "#F5A623",
    companyIds: [33],
    networkIds: [3353]
  },
  {
    key: "PARAMOUNT",
    label: "PARAMOUNT",
    img: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Paramount%2B_logo.svg",
    bg: "https://static0.cbrimages.com/wordpress/wp-content/uploads/2022/09/Paramount-logo.jpg?w=1200&h=675&fit=crop",
    color: "#0064FF",
    companyIds: [4],
    networkIds: [4330]
  },
  {
    key: "DISNEY",
    label: "DISNEY",
    img: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg",
    bg: "https://slidechef.net/wp-content/uploads/2024/03/disney-cartoons-background.jpg",
    color: "#113CCF",
    companyIds: [2],
    networkIds: [2739]
  },
  {
    key: "MARVEL",
    label: "MARVEL",
    img: "https://images.seeklogo.com/logo-png/8/2/marvel-comics-logo-png_seeklogo-88891.png",
    bg: "https://wallpapers.com/images/hd/marvel-avengers-desktop-bsa65ym0ihghczm4.jpg",
    color: "#ED1D24",
    companyIds: [420],
    networkIds: []
  },
  {
    key: "DC",
    label: "DC",
    img: "https://i.redd.it/cfvhmn3tv4af1.png",
    bg: "https://images.thedirect.com/media/article_full/dcsetback.jpg",
    color: "#0074E8",
    companyIds: [429, 9993],
    networkIds: []
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