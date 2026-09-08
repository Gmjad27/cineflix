import { getStudioConfig } from "./studios";

const TMDB_API_BASE_URL = "/api/tmdb";
// Updated base URL without the hardcoded 'original' size
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/";

// ─── Genre Map ───────────────────────────────────────────────────────────
const genreMap = {
  12: "Adventure",
  14: "Fantasy",
  16: "Animation",
  18: "Drama",
  27: "Horror",
  28: "Action",
  35: "Comedy",
  36: "History",
  53: "Thriller",
  80: "Crime",
  878: "Sci-Fi",
  9648: "Mystery",
  10402: "Music",
  10749: "Romance",
  10751: "Family",
  10752: "War",
  10759: "Action",
  10762: "Kids",
  10765: "Sci-Fi",
  10768: "War",
};

// ─── Language Map ────────────────────────────────────────────────────────
const langMap = {
  ar: "Arabic", bn: "Bengali", de: "German", en: "English",
  es: "Spanish", fr: "French", hi: "Hindi", it: "Italian",
  ja: "Japanese", kn: "Kannada", ko: "Korean", ml: "Malayalam",
  mr: "Marathi", pa: "Punjabi", ru: "Russian", ta: "Tamil",
  te: "Telugu", tr: "Turkish", zh: "Chinese",
};

// ─── Adult Platform Blacklist (Softcore Filter) ──────────────────────────
const ADULT_PLATFORMS_BLACKLIST = [
  // ─── Existing Indian Platforms & Series ─────────────────────
  "ullu", "alt balaji", "primeshots", "prime shots", "kooku", "rabbit",
  "voovi", "besharams", "hunters", "neon x", "xprime", "hotshots",
  "nuefliks", "feneo", "charmsukh", "palang tod", "namkeen", "rits",
  "fliz", "gupchup", "netprime", "cinemadosti", "feneomovies", "unrated",

  // ─── Global / Western Adult Platforms & Tubes ───────────────
  "pornhub", "xvideos", "xnxx", "redtube", "youporn", "tube8",
  "eporner", "spankbang", "xhamster", "chaturbate", "cam4", "bongacams",

  // ─── Subscription / Creator Platforms ───────────────────────
  "onlyfans", "fansly", "centerfold", "manyvids", "justforfans",

  // ─── Major Global Adult Studios & Networks ──────────────────
  "brazzers", "bangbros", "realitykings", "mofos", "naughty america",
  "evil angel", "vivid", "wicked", "digital playground", "playboy",
  "hustler", "penthouse", "twistys", "girlsway", "babes", "blacked",
  "tushy", "vixen", "deeper", "jules jordan", "kink",

  // ─── Asian Adult Networks & Genres (JAV / Hentai) ───────────
  "dmm", "fanza", "soft on demand", "sod", "tokyo hot", "caribbeancom",
  "1pondo", "muramura", "fakku", "nutaku", "hentai", "eroge", "jav",

  // ─── Generic Adult Keywords / Catch-alls ────────────────────
  "xxx", "18+", "nsfw", "r18", "adult", "porn", "erotic", "softcore"
];

const isAdultPlatform = (item) => {
  if (!item) return false;
  const titleStr = `${item.title || ""} ${item.original_title || ""} ${item.name || ""} ${item.original_name || ""}`.toLowerCase();

  // Check TV Networks (if present in detailed responses)
  if (Array.isArray(item.networks)) {
    if (item.networks.some(n => ADULT_PLATFORMS_BLACKLIST.some(p => (n.name || "").toLowerCase().includes(p)))) return true;
  }
  // Check Production Companies
  if (Array.isArray(item.production_companies)) {
    if (item.production_companies.some(c => ADULT_PLATFORMS_BLACKLIST.some(p => (c.name || "").toLowerCase().includes(p)))) return true;
  }
  // Check Titles/Original Names (Catches 95% of list-endpoint results)
  if (ADULT_PLATFORMS_BLACKLIST.some(p => titleStr.includes(p))) return true;

  return false;
};

// ─── Utilities ───────────────────────────────────────────────────────────

// Updated toImageUrl to default to w185, dropping image sizes from ~3MB to ~50KB
const toImageUrl = (path, size = "w185") => (path ? `${TMDB_IMAGE_BASE}${size}${path}` : "");

const isFutureDate = (dateString) => {
  if (!dateString) return false; // No date = NOT future (keep it)
  const todayStr = new Date().toISOString().slice(0, 10); // "2026-07-22"
  return dateString > todayStr; // Lexicographic works for ISO dates
};

const normalizeAgeRating = (value) => {
  const rating = String(value || "").trim().toUpperCase();
  if (!rating) return "";
  const map = {
    PG13: "UA 13+", "TV-14": "UA 13+", "TV-PG": "UA 7+",
    "TV-G": "U", G: "U", U: "U", "TV-Y7": "U 7+", "TV-Y": "U",
    "TV-MA": "A", R: "A", "NC-17": "A", A: "A", PG: "UA",
  };
  return map[rating] || rating.replace("-", " ");
};

const pickMovieAgeRating = (releaseDates) => {
  const results = Array.isArray(releaseDates?.results) ? releaseDates.results : [];
  const preferred = ["IN", "US", "GB"];

  for (const country of preferred) {
    const match = results.find((r) => r?.iso_3166_1 === country);
    const cert = match?.release_dates?.find((d) => d?.certification)?.certification;
    if (cert) return normalizeAgeRating(cert);
  }

  const fallback = results
    .flatMap((r) => r?.release_dates || [])
    .find((d) => d?.certification)?.certification;

  return normalizeAgeRating(fallback) || "UA 13+";
};

const pickTVAgeRating = (contentRatings) => {
  const results = Array.isArray(contentRatings?.results) ? contentRatings.results : [];
  const preferred = ["IN", "US", "GB"];

  for (const country of preferred) {
    const match = results.find((r) => r?.iso_3166_1 === country);
    if (match?.rating) return normalizeAgeRating(match.rating);
  }

  const fallback = results.find((r) => r?.rating)?.rating;
  return normalizeAgeRating(fallback) || "UA 13+";
};

const pickTMDBTrailer = (videos) => {
  if (!videos || !Array.isArray(videos.results)) return "";

  // Get only YouTube trailers
  const youtubeTrailers = videos.results.filter(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  );

  if (youtubeTrailers.length === 0) return "";

  // Remove Red Band / Restricted trailers if possible
  const safeTrailers = youtubeTrailers.filter((v) => {
    const name = v.name.toLowerCase();
    return (
      !name.includes("red band") &&
      !name.includes("restricted")
    );
  });

  const trailers = safeTrailers.length
    ? safeTrailers
    : youtubeTrailers;

  // Helper to find best trailer in a language
  const findBestTrailer = (lang) => {
    const list = trailers.filter((v) => v.iso_639_1 === lang);

    if (!list.length) return null;

    return (
      list.find((v) =>
        v.name.toLowerCase().includes("green band")
      ) ||
      list.find((v) =>
        v.name.toLowerCase().includes("official")
      ) ||
      list[0]
    );
  };

  // 1. Hindi
  const hindi = findBestTrailer("hi");
  if (hindi) return hindi.key;

  // 2. English
  const english = findBestTrailer("en");
  if (english) return english.key;

  // 3. Original/any language
  return (
    trailers.find((v) =>
      v.name.toLowerCase().includes("green band")
    ) ||
    trailers.find((v) =>
      v.name.toLowerCase().includes("official")
    ) ||
    trailers[0]
  ).key;
};

// ─── Normalization ───────────────────────────────────────────────────────
const resolveMediaType = (item, mediaType) => {
  const resolved = item?.media_type || mediaType;
  return resolved === "movie" || resolved === "tv" ? resolved : null;
};

const normalizeItem = (item, mediaType) => {
  if (!item || typeof item !== "object") return null;

  const resolvedType = resolveMediaType(item, mediaType);
  if (!resolvedType) return null;

  const isMovie = resolvedType === "movie";
  const title = isMovie ? item.title : item.name;
  const releaseDate = isMovie ? item.release_date : item.first_air_date;
  const releaseYear = Number(String(releaseDate || "").slice(0, 4)) || 0;
  const tmdbId = Number(item.id) || 0;

  if (!tmdbId) return null;

  return {
    id: `${resolvedType}_${tmdbId}`,
    tmdbId,
    // Uses the new w500 default size
    img: toImageUrl(item.backdrop_path, "w1280") || toImageUrl(item.poster_path, "w1280"),
    nameImg: toImageUrl(item.poster_path || item.backdrop_path),
    name: toImageUrl(item.poster_path || item.backdrop_path),
    name2: title || "Untitled",
    releaseYear,
    releaseDate: releaseDate || null,
    ua: "UA 13+",
    season: isMovie ? "Movie" : "1+ Seasons",
    language: [langMap[item.original_language] || "English"],
    desc: item.overview || "No description available.",
    category: item.genre_ids?.map((gid) => genreMap[gid]).filter(Boolean) || [],
    type: resolvedType,
    studio: isMovie ? "TMDB Movies" : "TMDB TV",
    episodes: isMovie ? undefined : { s1: 10 },
    rating: item.vote_average,
  };
};

const dedupeMedia = (items) => {
  const seenById = new Set();
  const seenByTitle = new Set();

  return items.filter((item) => {
    if (!item) return false;

    const idKey = item.id;
    const titleKey = `${item.type}:${String(item.name2 || "").toLowerCase().replace(/[^a-z0-9]+/g, "").trim()}:${item.releaseYear}`;

    if (seenById.has(idKey) || seenByTitle.has(titleKey)) return false;

    seenById.add(idKey);
    seenByTitle.add(titleKey);
    return true;
  });
};

// ─── Core Request Function ───────────────────────────────────────────────
export class TMDBRequestError extends Error {
  constructor(category, message, { status, retryAfter } = {}) {
    super(message);
    this.name = "TMDBRequestError";
    this.category = category;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

const createRequestSignal = (callerSignal, timeoutMs = 12_000) => {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const abortFromCaller = () => controller.abort();
  if (callerSignal) {
    if (callerSignal.aborted) controller.abort();
    else callerSignal.addEventListener("abort", abortFromCaller, { once: true });
  }
  return { signal: controller.signal, cleanup: () => {
    clearTimeout(timeout);
    callerSignal?.removeEventListener("abort", abortFromCaller);
  }, timedOut: () => timedOut };
};

const errorCategoryForStatus = (status) => {
  if (status === 401) return "authentication";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "server";
  return "request_failed";
};

const fetchTMDBJson = async (path, params = {}, options = {}) => {
  const query = new URLSearchParams({
    "vote_count.gte": 50,
    include_adult: "false",
    ...params,
  });
  const url = `${TMDB_API_BASE_URL}${path}?${query.toString()}`;
  const request = createRequestSignal(options.signal);
  try {
    const response = await fetch(url, { signal: request.signal });
    if (!response.ok) {
      let body;
      try { body = await response.json(); } catch { body = null; }
      throw new TMDBRequestError(
        body?.error?.category || errorCategoryForStatus(response.status),
        response.status === 429 ? "TMDB is busy. Please try again shortly." : "Unable to load movie data right now.",
        { status: response.status, retryAfter: response.headers.get("retry-after") },
      );
    }
    return response.json();
  } catch (err) {
    if (err?.name === "AbortError") {
      if (options.signal?.aborted) throw err;
      throw new TMDBRequestError(request.timedOut() ? "timeout" : "aborted", request.timedOut() ? "The content request timed out." : "The content request was cancelled.");
    }
    if (err instanceof TMDBRequestError) throw err;
    throw new TMDBRequestError("connectivity", "Unable to reach the content service.");
  } finally {
    request.cleanup();
  }
};

export const requestTMDB = async (path, params = {}, options = {}) => {
  const data = await fetchTMDBJson(path, params, options);

  // ─── Local content filter ────────────────────────────────────────────
  const isValidMedia = (item) => {
    if (item.adult === true) return false;
    if (isAdultPlatform(item)) return false;
    if (options.allowUpcoming) return true;
    const dateString = item.release_date || item.first_air_date;
    if (isFutureDate(dateString)) return false;
    return true;
  };

  if (Array.isArray(data.results)) return data.results.filter(isValidMedia);
  if (Array.isArray(data.parts)) {
    return data.parts
      .filter(isValidMedia)
      .sort((a, b) =>
        (a.release_date || a.first_air_date || "9999")
          .localeCompare(b.release_date || b.first_air_date || "9999")
      );
  }
  if (Array.isArray(data.items)) return data.items.filter(isValidMedia);

  return [];
};

const requestTMDBObject = async (path, params = {}, options = {}) =>
  fetchTMDBJson(path, { include_adult: "false", ...params }, options);

// ─── List Normalizers ────────────────────────────────────────────────────
const normalizeList = (list, mediaType) =>
  list.map((item) => normalizeItem(item, mediaType)).filter(Boolean);

const normalizeMixedMediaList = (list) =>
  list
    .filter((item) => item?.media_type === "movie" || item?.media_type === "tv")
    .map((item) => normalizeItem(item, item.media_type))
    .filter(Boolean);

// ─── Batched Parallel Fetch ────────────────────
const batchFetch = async (requests, batchSize = 10) => {
  const results = [];
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
    if (i + batchSize < requests.length) {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  return results;
};

// ─── Public API ──────────────────────────────────────────────────────────
export const fetchTMDBCatalog = async ({ moviePages = 3, tvPages = 3 } = {}) => {
  const requests = [
    ...Array.from({ length: moviePages }, (_, i) =>
      requestTMDB("/movie/popular", { page: String(i + 1) })
    ),
    ...Array.from({ length: tvPages }, (_, i) =>
      requestTMDB("/tv/popular", { page: String(i + 1) })
    ),
  ];

  const allResults = await batchFetch(requests);
  const movies = normalizeList(allResults.slice(0, moviePages).flat(), "movie");
  const tv = normalizeList(allResults.slice(moviePages).flat(), "tv");
  return dedupeMedia([...movies, ...tv]);
};

export const fetchTMDBTrending = async ({ window = "week", limit = 12 } = {}) => {
  const [movieResults, tvResults] = await Promise.all([
    requestTMDB(`/trending/movie/${window}`),
    requestTMDB(`/trending/tv/${window}`),
  ]);

  return dedupeMedia([
    ...normalizeList(movieResults, "movie"),
    ...normalizeList(tvResults, "tv"),
  ]).slice(0, limit);
};

// ─── Target Languages & Genres for Deep Discovery ───────────────────────
const TARGET_LANGS = [
  { code: "hi", name: "Hindi" },
  { code: "en", name: "English" },
  { code: "ko", name: "Korean" },
  { code: "ja", name: "Japanese" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "ml", name: "Malayalam" },
  { code: "kn", name: "Kannada" },
  { code: "gu", name: "Gujarati" }
];

const GENRE_IDS = [
  28, 35, 18, 878, 27, 10749, 53, 16, 10751, 14, 9648
];

// ─── HOME PAGE (Movies + TV Mixed) ───────────────────────────────────────
export const fetchTMDBHomeSections = async () => {
  const requests = [];
  const types = [];

  requests.push(() => requestTMDB("/trending/all/week", { watch_region: "IN" }));
  types.push("mixed");

  TARGET_LANGS.forEach(({ code }) => {
    requests.push(() => requestTMDB("/discover/movie", { with_watch_providers: "119|8|232|237|350", with_original_language: code, sort_by: "popularity.desc", watch_region: "IN" }));
    types.push("movie");
    requests.push(() => requestTMDB("/discover/tv", { with_watch_providers: "119|8|232|237|350", with_original_language: code, sort_by: "popularity.desc", watch_region: "IN" }));
    types.push("tv");
  });

  GENRE_IDS.forEach((id) => {
    requests.push(() => requestTMDB("/discover/movie", { with_genres: String(id), sort_by: "popularity.desc", watch_region: "IN" }));
    types.push("movie");
    requests.push(() => requestTMDB("/discover/tv", { with_genres: String(id), sort_by: "popularity.desc", watch_region: "IN" }));
    types.push("tv");
  });

  const rawResults = await batchFetch(requests.map(fn => fn()));

  const trendingRaw = rawResults.shift();
  types.shift();

  let allMedia = [];
  rawResults.forEach((res, idx) => {
    allMedia.push(...normalizeList(res, types[idx]));
  });

  const globalCatalog = dedupeMedia(allMedia);
  const genreRails = buildCreativeRails(globalCatalog, { minItemsPerRail: 5 });

  return {
    heroBanner: dedupeMedia(normalizeMixedMediaList(trendingRaw)).slice(0, 5),
    rails: [
      { title: "Top 10 Today", items: dedupeMedia(normalizeMixedMediaList(trendingRaw)).slice(0, 10), ranked: true },
      ...genreRails
    ],
  };
};

// ─── MOVIE PAGE (Movies Only) ────────────────────────────────────────────
export const fetchTMDBMovieSections = async () => {
  const requests = [];
  const types = [];

  requests.push(() => requestTMDB("/trending/movie/week", { watch_region: "IN" }));
  types.push("movie");

  TARGET_LANGS.forEach(({ code }) => {
    requests.push(() => requestTMDB("/discover/movie", { with_watch_providers: "119|8|232|237|350", with_original_language: code, sort_by: "popularity.desc", watch_region: "IN" }));
    types.push("movie");
  });

  GENRE_IDS.forEach((id) => {
    requests.push(() => requestTMDB("/discover/movie", { with_genres: String(id), sort_by: "popularity.desc", watch_region: "IN" }));
    types.push("movie");
  });

  const rawResults = await batchFetch(requests.map(fn => fn()));
  const trendingRaw = rawResults.shift();
  types.shift();

  let allMedia = [];
  rawResults.forEach((res, idx) => {
    allMedia.push(...normalizeList(res, types[idx]));
  });

  const globalCatalog = dedupeMedia(allMedia);
  const genreRails = buildCreativeRails(globalCatalog, { minItemsPerRail: 5 });

  return {
    heroBanner: dedupeMedia(normalizeList(trendingRaw, "movie")).slice(0, 5),
    rails: [
      { title: "Trending Movies", items: dedupeMedia(normalizeList(trendingRaw, "movie")).slice(0, 20) },
      ...genreRails
    ],
  };
};

// ─── TV PAGE (TV Shows Only) ─────────────────────────────────────────────
export const fetchTMDBTVSections = async () => {
  const requests = [];
  const types = [];

  requests.push(() => requestTMDB("/trending/tv/week", { watch_region: "IN" }));
  types.push("tv");

  TARGET_LANGS.forEach(({ code }) => {
    requests.push(() => requestTMDB("/discover/tv", { with_watch_providers: "119|8|232|237|350", with_original_language: code, sort_by: "popularity.desc", watch_region: "IN" }));
    types.push("tv");
  });

  GENRE_IDS.forEach((id) => {
    requests.push(() => requestTMDB("/discover/tv", { with_genres: String(id), sort_by: "popularity.desc", watch_region: "IN" }));
    types.push("tv");
  });

  const rawResults = await batchFetch(requests.map(fn => fn()));
  const trendingRaw = rawResults.shift();
  types.shift();

  let allMedia = [];
  rawResults.forEach((res, idx) => {
    allMedia.push(...normalizeList(res, types[idx]));
  });

  const globalCatalog = dedupeMedia(allMedia);
  const genreRails = buildCreativeRails(globalCatalog, { minItemsPerRail: 5 });

  return {
    heroBanner: dedupeMedia(normalizeList(trendingRaw, "tv")).slice(0, 5),
    rails: [
      { title: "Trending TV Shows", items: dedupeMedia(normalizeList(trendingRaw, "tv")).slice(0, 20) },
      ...genreRails
    ],
  };
};

export const fetchMoreLikeThis = async (type, id, { page = 1 } = {}) => {
  if (!type || !id) return [];
  try {
    const results = await requestTMDB(`/${type}/${id}/recommendations`, {
      page: String(page),
      watch_region: "IN",
    });
    return normalizeList(results, type);
  } catch {
    return [];
  }
};

export const searchTMDBTitles = async (query, { page = 1, signal } = {}) => {
  const q = String(query || "").trim();
  if (q.length < 2) return [];

  const results = await requestTMDB(
    "/search/multi",
    { query: q, page: String(page) },
    { signal, allowUpcoming: false }
  );

  return results
    .filter((item) => item?.media_type === "movie" || item?.media_type === "tv")
    .map((item) => normalizeItem(item, item.media_type))
    .filter(Boolean);
};

export const fetchTMDBDetails = async (mediaType, id) => {
  if (mediaType !== "movie" && mediaType !== "tv") return null;
  const tmdbId = Number(id);
  if (!tmdbId) return null;

  const appendParts = mediaType === "movie"
    ? "release_dates,images,videos,credits,keywords"
    : "content_ratings,images,videos,credits,keywords";

  const data = await requestTMDBObject(`/${mediaType}/${tmdbId}`, {
    append_to_response: appendParts,
  });
  if (!data || typeof data !== "object") return null;
  const trailer = pickTMDBTrailer(data.videos);
  const cast = Array.isArray(data.credits?.cast) ? data.credits.cast.slice(0, 15) : [];
  const logo = data.images?.logos?.find((l) => l.iso_639_1 === "en") || null;
  const backdrop = data.images?.backdrops?.find(
    img => img.iso_639_1 === 'en'
  )?.file_path || data.images?.backdrops?.[0]?.file_path;
  const base = {
    title: data.title || data.name || data.original_title || data.original_name,
    // Explicitly ask for 'original' quality for hero backgrounds
    rating: Number(data.vote_average) || 0,
    mbg: toImageUrl(backdrop, "original"),
    cast,
    nameImg2: toImageUrl(logo?.file_path, "w500"),
    categories: Array.isArray(data.genres) ? data.genres.map((g) => g?.name).filter(Boolean) : [],
    languages: Array.isArray(data.spoken_languages)
      ? data.spoken_languages.map((l) => l?.english_name || l?.name).filter(Boolean)
      : [],
    desc: data.overview || "",
    trailerUrl: trailer,
  };

  if (mediaType === "movie") {
    return {
      ...base,
      mood: (data.keywords?.keywords || []).map((k) => k.name),
      year: Number((data.release_date || "").slice(0, 4)) || 0,
      runtime: Number(data.runtime) || 0,
      seasonLabel: data.runtime ? `${data.runtime}m` : "Movie",
      episodes: undefined,
      ageRating: pickMovieAgeRating(data.release_dates),
    };
  }

  // TV
  const seasons = Array.isArray(data.seasons) ? data.seasons : [];
  const validSeasons = seasons.filter(
    (s) => Number(s?.season_number) > 0 && !isFutureDate(s.air_date)
  );

  const episodes = validSeasons.reduce((acc, s) => {
    acc[`s${s.season_number}`] = Number(s.episode_count) || 10;
    return acc;
  }, {});

  const validSeasonCount = validSeasons.length || 1;

  return {
    ...base,
    mood: (data.keywords?.results || []).map(
      (k) => k.name
    ),
    runtime: 0,
    year: Number((data.first_air_date || "").slice(0, 4)) || 0,
    nextEp: data.next_episode_to_air?.air_date || undefined,
    seasonLabel: validSeasonCount > 1
      ? `${validSeasonCount} Seasons`
      : `${validSeasonCount} Season`,
    episodes: Object.keys(episodes).length > 0 ? episodes : { s1: 10 },
    ageRating: pickTVAgeRating(data.content_ratings),
  };
};

export const fetchTMDBSeasonDetails = async (tvId, seasonNumber) => {
  const normalizedId = Number(tvId);
  const normalizedSeason = Number(seasonNumber);
  if (!normalizedId || !normalizedSeason) return null;

  const detail = await requestTMDBObject(`/tv/${normalizedId}/season/${normalizedSeason}`);
  if (!detail || typeof detail !== "object") return null;

  const todayStr = new Date().toISOString().slice(0, 10);
  return {
    name: detail.name || `Season ${normalizedSeason}`,
    overview: detail.overview || "",
    poster: toImageUrl(detail.poster_path),
    episodes: Array.isArray(detail.episodes)
      ? detail.episodes
        .filter((ep) => !ep.air_date || ep.air_date <= todayStr)
        .map((ep) => ({
          id: ep?.id || `${normalizedSeason}-${ep?.episode_number || 0}`,
          number: Number(ep?.episode_number) || 0,
          name: ep?.name || `Episode ${ep?.episode_number || ""}`.trim(),
          overview: ep?.overview || "",
          image: toImageUrl(ep?.still_path || detail.poster_path),
          runtime: Number(ep?.runtime) || 0,
          airDate: ep?.air_date || "",
        }))
      : [],
  };
};

export const fetchTMDBStudioTitles = async (studioKey, { moviePages = 2, tvPages = 2 } = {}) => {
  const studio = getStudioConfig(studioKey);
  if (!studio) return [];

  if (Array.isArray(studio.collectionIds) && studio.collectionIds.length > 0) {
    const collectionResults = await Promise.all(
      studio.collectionIds.map((id) => requestTMDB(`/collection/${id}`).catch(() => []))
    );
    const movies = normalizeList(collectionResults.flat(), "movie");
    return dedupeMedia(movies).sort((a, b) => (a.releaseYear || 0) - (b.releaseYear || 0));
  }

  const companyParam = studio.companyIds?.join("|") || "";
  const networkParam = studio.networkIds?.join("|") || "";

  const keywordMap = {
    MARVEL: "180547",
    DC: "312528|229266|329136",
  };
  const keyword = keywordMap[studioKey] || "";

  const movieRequests = Array.from({ length: moviePages }, (_, i) =>
    requestTMDB("/discover/movie", {
      ...(keyword ? { with_keywords: keyword } : { with_companies: companyParam }),
      sort_by: "popularity.desc",
      watch_region: "IN",
      page: String(i + 1),
    })
  );

  const tvRequests = Array.from({ length: tvPages }, (_, i) =>
    requestTMDB("/discover/tv", {
      ...(keyword ? { with_keywords: keyword } : { with_networks: networkParam }),
      sort_by: "popularity.desc",
      watch_region: "IN",
      page: String(i + 1),
    })
  );

  const [movieData, tvData] = await Promise.all([
    Promise.all(movieRequests),
    Promise.all(tvRequests),
  ]);

  const movies = normalizeList(movieData.flat(), "movie");
  const tv = normalizeList(tvData.flat(), "tv");
  const combined = dedupeMedia([...movies, ...tv]);

  return combined.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
};

export const fetchMultilingualContent = async ({ moviePages = 1, tvPages = 1 } = {}) => {
  const languages = [
    { code: "hi", label: "Hindi" },
    { code: "en", label: "English" },
  ];

  const requests = [];

  for (const { code } of languages) {
    for (let p = 1; p <= moviePages; p++) {
      requests.push(
        requestTMDB("/discover/movie", {
          with_original_language: code,
          sort_by: "popularity.desc",
          watch_region: "IN",
          page: String(p),
        })
      );
    }
    for (let p = 1; p <= tvPages; p++) {
      requests.push(
        requestTMDB("/discover/tv", {
          with_original_language: code,
          sort_by: "popularity.desc",
          watch_region: "IN",
          page: String(p),
        })
      );
    }
  }

  const rawResults = await batchFetch(requests, 10);

  const moviesRaw = [];
  const tvRaw = [];
  let idx = 0;

  for (let i = 0; i < languages.length; i++) {
    for (let j = 0; j < moviePages; j++) {
      moviesRaw.push(rawResults[idx++]);
    }
    for (let j = 0; j < tvPages; j++) {
      tvRaw.push(rawResults[idx++]);
    }
  }

  const movies = normalizeList(moviesRaw.flat(), "movie");
  const tvShows = normalizeList(tvRaw.flat(), "tv");
  const combined = dedupeMedia([...movies, ...tvShows]);

  return buildCreativeRails(combined);
};

export const fetchTMDBDataSet = fetchTMDBCatalog;

// ─── Creative rail titles ──────────────────────────────────────────────
const CREATIVE_GENRE_TITLES = {
  Action: "Explosive Action",
  Adventure: "Epic Adventures",
  Animation: "For the Whole Family",
  Comedy: "Laughter Is Your Best Medicine",
  Crime: "Crime Doesn't Pay",
  Drama: "Stories That Stay With You",
  Family: "For the Whole Family",
  Fantasy: "Worlds Beyond Your Own",
  History: "Echoes of the Past",
  Horror: "Songs of Men and Beasts",
  Kids: "Mischief Managed!",
  Music: "Turn It Up",
  Mystery: "Gripping Mysteries",
  Romance: "Heartfelt Romance",
  "Sci-Fi": "Beyond the Stars",
  Thriller: "Edge of Your Seat",
  War: "Battles Worth Remembering",
};

const RAIL_PRIORITY = [
  "Family", "Animation", "Kids", "Comedy", "Horror",
  "Fantasy", "Adventure", "Action", "Sci-Fi", "Thriller", "Crime",
  "Mystery", "Drama", "Romance", "History", "War", "Music",
];

export const buildCreativeRails = (items, { minItemsPerRail = 5 } = {}) => {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return [];

  const popular = [...list]
    .filter((i) => Number(i.rating) > 0)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 20);

  const rails = [];
  if (popular.length > 0) {
    rails.push({ title: "Popular Movies & TV Series", items: popular, showViewAll: true });
  }

  const usedGenres = new Set();
  const assignedItemIds = new Set();

  for (const genre of RAIL_PRIORITY) {
    const genreItems = list.filter((i) =>
      (i.category || []).includes(genre) && !assignedItemIds.has(i.id)
    );

    if (genreItems.length < minItemsPerRail) continue;

    const title = CREATIVE_GENRE_TITLES[genre] || genre;
    if (usedGenres.has(title)) continue;
    usedGenres.add(title);

    const finalItemsForRail = genreItems.slice(0, 25);
    finalItemsForRail.forEach((item) => assignedItemIds.add(item.id));

    rails.push({
      title,
      items: finalItemsForRail,
      showViewAll: rails.length < 5,
    });
  }

  return rails;
};
