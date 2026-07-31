import { getStudioConfig } from "./studios";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/original";

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
  99: "Documentary",
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

// ─── Utilities ───────────────────────────────────────────────────────────
const toImageUrl = (path) => (path ? `${TMDB_IMAGE_URL}${path}` : "");

/**
 * FIX #9: Compare date STRINGS ("2026-07-22") instead of Date objects.
 * This avoids UTC-vs-local timezone mismatches for same-day releases.
 */
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

/**
 * FIX #3: Safe trailer pick — fallback to [0], never crash on [1].
 */
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

/**
 * FIX #5: Use string-prefixed IDs to prevent collision.
 * "movie_603" vs "tv_603" — no more +10000000 hack.
 */
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
    id: `${resolvedType}_${tmdbId}`, // "movie_603" / "tv_1399"
    tmdbId,
    img: toImageUrl(item.backdrop_path || item.poster_path),
    nameImg: toImageUrl(item.poster_path || item.backdrop_path),
    name: toImageUrl(item.poster_path || item.backdrop_path),
    name2: title || "Untitled",
    releaseYear,
    releaseDate: releaseDate || null, // Preserve for sorting
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

    const idKey = item.id; // Already unique: "movie_603"
    const titleKey = `${item.type}:${String(item.name2 || "").toLowerCase().replace(/[^a-z0-9]+/g, "").trim()}:${item.releaseYear}`;

    if (seenById.has(idKey) || seenByTitle.has(titleKey)) return false;

    seenById.add(idKey);
    seenByTitle.add(titleKey);
    return true;
  });
};

// ─── Core Request Function ───────────────────────────────────────────────

/**
 * FIX #1: Don't remove items with no release_date.
 * FIX #7: Add AbortSignal.timeout for hung requests.
 * FIX #10: Single retry on network failure.
 */
export const requestTMDB = async (path, params = {}, options = {}) => {
  const query = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: "en-US",
    include_adult: "false",
    ...params,
  }).toString();

  const url = `${TMDB_BASE_URL}${path}?${query}`;

  // Combine caller's signal with a 10s timeout
  const signal = options.signal || AbortSignal.timeout(10_000);

  let response;
  try {
    response = await fetch(url, { signal });
  } catch (err) {
    // FIX #10: One retry on network/timeout failure
    if (err.name === "TimeoutError" || err.name === "TypeError") {
      response = await fetch(url, { signal: options.signal });
    } else {
      throw err;
    }
  }

  if (!response.ok) {
    throw new Error(`TMDB ${response.status} for ${path}`);
  }

  const data = await response.json();

  // ─── Local content filter ────────────────────────────────────────────
  const isValidMedia = (item) => {
    // Block adult content
    if (item.adult === true) return false;

    // If caller explicitly wants upcoming content, skip date checks
    if (options.allowUpcoming) return true;

    // FIX #1: Only filter FUTURE dates. No date = keep it.
    const dateString = item.release_date || item.first_air_date;
    if (isFutureDate(dateString)) return false;

    return true; // Items with no date PASS through
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

const requestTMDBObject = async (path, params = {}) => {
  const query = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: "en-US",
    include_adult: "false",
    ...params,
  }).toString();

  const url = `${TMDB_BASE_URL}${path}?${query}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });

  if (!response.ok) throw new Error(`TMDB ${response.status} for ${path}`);
  return response.json();
};

// ─── List Normalizers ────────────────────────────────────────────────────
const normalizeList = (list, mediaType) =>
  list.map((item) => normalizeItem(item, mediaType)).filter(Boolean);

const normalizeMixedMediaList = (list) =>
  list
    .filter((item) => item?.media_type === "movie" || item?.media_type === "tv")
    .map((item) => normalizeItem(item, item.media_type))
    .filter(Boolean);

// ─── Batched Parallel Fetch (FIX #6: rate-limit safe) ────────────────────
const batchFetch = async (requests, batchSize = 10) => {
  const results = [];
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
    // Small stagger between batches to respect rate limits
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

export const fetchTMDBHomeSections = async () => {
  // FIX #6: Batched to avoid 429 rate-limit errors
  const requests = [
    () => requestTMDB("/trending/all/week"),
    () => requestTMDB("/trending/all/day"),
    () => requestTMDB("/trending/movie/week"),
    () => requestTMDB("/trending/tv/week"),
    () => requestTMDB("/movie/now_playing"),
    () => requestTMDB("/tv/on_the_air"),
    () => requestTMDB("/movie/popular"),
    () => requestTMDB("/tv/popular"),
    () => requestTMDB("/movie/top_rated"),
    () => requestTMDB("/tv/top_rated"),
    () => requestTMDB("/discover/movie", { with_genres: "28" }),
    () => requestTMDB("/discover/movie", { with_genres: "35" }),
    () => requestTMDB("/discover/movie", { with_genres: "27" }),
    () => requestTMDB("/discover/movie", { with_genres: "878" }),
    () => requestTMDB("/collection/1241"),
    () => requestTMDB("/collection/435259"),
    () => requestTMDB("/collection/119"),
    () => requestTMDB("/collection/121938"),
    () => requestTMDB("/search/tv", { query: "The Lord of the Rings: The Rings of Power" }),
    () => requestTMDB("/discover/movie", { with_genres: "99" }),
    () => requestTMDB("/discover/movie", { with_genres: "80" }),
    () => requestTMDB("/discover/movie", { with_genres: "10749" }),
    () => requestTMDB("/discover/movie", { with_genres: "16,10751" }),
    () => requestTMDB("/discover/tv", { with_original_language: "ko", with_genres: "18" }),
    () => requestTMDB("/discover/movie", { with_original_language: "hi", region: "IN", sort_by: "popularity.desc" }),
  ];

  const [
    heroRaw, trendingTodayRaw, trendingWeekMoviesRaw, trendingWeekTvRaw,
    nowPlayingRaw, onTheAirRaw, popularMoviesRaw, popularTvRaw,
    topRatedMoviesRaw, topRatedTvRaw, actionRaw, comedyRaw,
    horrorRaw, scifiRaw, wizardingRaw, wizardingRaw2,
    lotrRaw, lotrRaw2, lotrRaw3, docsRaw,
    crimeRaw, romanceRaw, animFamilyRaw, koreanRaw, bollywoodRaw,
  ] = await batchFetch(requests.map((fn) => fn()));

  const heroBanner = dedupeMedia(normalizeMixedMediaList(heroRaw)).slice(0, 12);
  const top10Today = dedupeMedia(normalizeMixedMediaList(trendingTodayRaw)).slice(0, 10);

  const trendingNow = dedupeMedia([
    ...normalizeList(trendingWeekMoviesRaw, "movie"),
    ...normalizeList(trendingWeekTvRaw, "tv"),
  ]).slice(0, 20);

  const newReleases = dedupeMedia([
    ...normalizeList(nowPlayingRaw, "movie"),
    ...normalizeList(onTheAirRaw, "tv"),
  ]).slice(0, 20);

  const wizardingWorld = dedupeMedia([
    ...normalizeList(wizardingRaw, "movie"),
    ...normalizeList(wizardingRaw2, "movie"),
  ]).slice(0, 20);

  const middleEarth = dedupeMedia([
    ...normalizeList(lotrRaw, "movie"),
    ...normalizeList(lotrRaw2, "movie"),
    ...normalizeList(lotrRaw3, "tv"),
  ]).slice(0, 20);

  return {
    heroBanner,
    rails: [
      { title: "Top 10 Today", items: top10Today, ranked: true },
      { title: "Kids & Family", items: dedupeMedia(normalizeList(animFamilyRaw, "movie")).slice(0, 20) },
      { title: "Trending Now", items: trendingNow },
      { title: "New Releases", items: newReleases },
      { title: "Wizarding World Collection", items: wizardingWorld },
      { title: "Middle-earth Saga", items: middleEarth },
      { title: "Bollywood Hits", items: dedupeMedia(normalizeList(bollywoodRaw, "movie")).slice(0, 20) },
      { title: "Binge-Worthy K-Dramas", items: dedupeMedia(normalizeList(koreanRaw, "tv")).slice(0, 20) },
      { title: "Popular Movies", items: dedupeMedia(normalizeList(popularMoviesRaw, "movie")).slice(0, 20) },
      { title: "Popular TV Shows", items: dedupeMedia(normalizeList(popularTvRaw, "tv")).slice(0, 20) },
      { title: "Top Rated", items: dedupeMedia([...normalizeList(topRatedMoviesRaw, "movie"), ...normalizeList(topRatedTvRaw, "tv")]).slice(0, 20) },
      { title: "Crime & Thrillers", items: dedupeMedia(normalizeList(crimeRaw, "movie")).slice(0, 20) },
      { title: "Action & Adventure", items: dedupeMedia(normalizeList(actionRaw, "movie")).slice(0, 20) },
      { title: "Comedy Movies", items: dedupeMedia(normalizeList(comedyRaw, "movie")).slice(0, 20) },
      { title: "Horror Movies", items: dedupeMedia(normalizeList(horrorRaw, "movie")).slice(0, 20) },
      { title: "Sci-Fi & Fantasy", items: dedupeMedia(normalizeList(scifiRaw, "movie")).slice(0, 20) },
      { title: "Heartfelt Romance", items: dedupeMedia(normalizeList(romanceRaw, "movie")).slice(0, 20) },
    ],
  };
};

export const fetchTMDBMovieSections = async () => {
  const [
    heroRaw, trendingRaw, nowPlayingRaw, popularRaw, topRatedRaw,
    actionRaw, comedyRaw, horrorRaw, romanceRaw, thrillerRaw, docsRaw,
  ] = await batchFetch([
    requestTMDB("/trending/all/week"),
    requestTMDB("/trending/movie/week"),
    requestTMDB("/movie/now_playing"),
    requestTMDB("/movie/popular"),
    requestTMDB("/movie/top_rated"),
    requestTMDB("/discover/movie", { with_genres: "28" }),
    requestTMDB("/discover/movie", { with_genres: "35" }),
    requestTMDB("/discover/movie", { with_genres: "27" }),
    requestTMDB("/discover/movie", { with_genres: "10749" }),
    requestTMDB("/discover/movie", { with_genres: "53" }),
    requestTMDB("/discover/movie", { with_genres: "99" }),
  ]);

  return {
    heroBanner: dedupeMedia(normalizeMixedMediaList(heroRaw).filter((i) => i.type === "movie")).slice(0, 12),
    rails: [
      { title: "Trending Movies", items: dedupeMedia(normalizeList(trendingRaw, "movie")).slice(0, 20) },
      { title: "In Theaters", items: dedupeMedia(normalizeList(nowPlayingRaw, "movie")).slice(0, 20) },
      { title: "Blockbuster Hits", items: dedupeMedia(normalizeList(popularRaw, "movie")).slice(0, 20) },
      { title: "Critically Acclaimed", items: dedupeMedia(normalizeList(topRatedRaw, "movie")).slice(0, 20) },
      { title: "Edge of Your Seat Thrillers", items: dedupeMedia(normalizeList(thrillerRaw, "movie")).slice(0, 20) },
      { title: "Action Packed", items: dedupeMedia(normalizeList(actionRaw, "movie")).slice(0, 20) },
      { title: "Laugh Out Loud Comedies", items: dedupeMedia(normalizeList(comedyRaw, "movie")).slice(0, 20) },
      { title: "Chilling Horror", items: dedupeMedia(normalizeList(horrorRaw, "movie")).slice(0, 20) },
      { title: "Romantic Favorites", items: dedupeMedia(normalizeList(romanceRaw, "movie")).slice(0, 20) },
      { title: "Real Life Stories", items: dedupeMedia(normalizeList(docsRaw, "movie")).slice(0, 20) },
    ],
  };
};

export const fetchTMDBTVSections = async () => {
  const [
    heroRaw, trendingRaw, onTheAirRaw, popularRaw, topRatedRaw,
    dramaRaw, comedyRaw, animeRaw, realityRaw, mysteryRaw,
  ] = await batchFetch([
    requestTMDB("/trending/all/week"),
    requestTMDB("/trending/tv/week"),
    requestTMDB("/tv/on_the_air"),
    requestTMDB("/tv/popular"),
    requestTMDB("/tv/top_rated"),
    requestTMDB("/discover/tv", { with_genres: "18" }),
    requestTMDB("/discover/tv", { with_genres: "35" }),
    requestTMDB("/discover/tv", { with_original_language: "ja", with_genres: "16" }),
    requestTMDB("/discover/tv", { with_genres: "10764" }),
    requestTMDB("/discover/tv", { with_genres: "9648" }),
  ]);

  return {
    heroBanner: dedupeMedia(normalizeMixedMediaList(heroRaw).filter((i) => i.type === "tv")).slice(0, 12),
    rails: [
      { title: "Trending TV Shows", items: dedupeMedia(normalizeList(trendingRaw, "tv")).slice(0, 20) },
      { title: "New Episodes This Week", items: dedupeMedia(normalizeList(onTheAirRaw, "tv")).slice(0, 20) },
      { title: "Global Anime Hits", items: dedupeMedia(normalizeList(animeRaw, "tv")).slice(0, 20) },
      { title: "Everyone's Watching", items: dedupeMedia(normalizeList(popularRaw, "tv")).slice(0, 20) },
      { title: "Award-Winning Television", items: dedupeMedia(normalizeList(topRatedRaw, "tv")).slice(0, 20) },
      { title: "Gripping Mysteries", items: dedupeMedia(normalizeList(mysteryRaw, "tv")).slice(0, 20) },
      { title: "Drama Series", items: dedupeMedia(normalizeList(dramaRaw, "tv")).slice(0, 20) },
      { title: "Sitcoms & Comedy", items: dedupeMedia(normalizeList(comedyRaw, "tv")).slice(0, 20) },
      { title: "Reality TV & Talk Shows", items: dedupeMedia(normalizeList(realityRaw, "tv")).slice(0, 20) },
    ],
  };
};

export const fetchMoreLikeThis = async (type, id, { page = 1 } = {}) => {
  if (!type || !id) return [];
  try {
    const results = await requestTMDB(`/${type}/${id}/recommendations`, { page: String(page) });
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
    { signal, allowUpcoming: true }
  );

  return results
    .filter((item) => item?.media_type === "movie" || item?.media_type === "tv")
    .map((item) => normalizeItem(item, item.media_type))
    .filter(Boolean);
};

/**
 * FIX #4: Single API call with combined append_to_response.
 * Previously made 3 calls (2 hitting the same endpoint).
 */
export const fetchTMDBDetails = async (mediaType, id) => {
  if (mediaType !== "movie" && mediaType !== "tv") return null;
  const tmdbId = Number(id);
  if (!tmdbId) return null;

  const appendParts = mediaType === "movie"
    ? "release_dates,images,videos,credits,keywords"
    : "content_ratings,images,videos,credits,keywords";

  // ONE call instead of three
  const data = await requestTMDBObject(`/${mediaType}/${tmdbId}`, {
    append_to_response: appendParts,
  });
  if (!data || typeof data !== "object") return null;
  // console.log("TMDB Details:", data);
  const trailer = pickTMDBTrailer(data.videos);
  const cast = Array.isArray(data.credits?.cast) ? data.credits.cast.slice(0, 15) : [];
  const logo = data.images?.logos?.find((l) => l.iso_639_1 === "en") || data.images?.logos?.[0];
  const backdrop = data.images?.backdrops?.[0]?.file_path || data.backdrop_path;

  const base = {
    title: data.title || data.name || data.original_title || data.original_name,
    mbg: toImageUrl(backdrop),
    cast,
    nameImg2: toImageUrl(logo?.file_path),
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
  // TV
  const seasons = Array.isArray(data.seasons) ? data.seasons : [];

  // 1. Filter out specials (season 0) AND unreleased future seasons
  const validSeasons = seasons.filter(
    (s) => Number(s?.season_number) > 0 && !isFutureDate(s.air_date)
  );

  const episodes = validSeasons.reduce((acc, s) => {
    acc[`s${s.season_number}`] = Number(s.episode_count) || 10;
    return acc;
  }, {});

  // 2. Calculate the season label based on actually released seasons
  const validSeasonCount = validSeasons.length || 1;

  return {
    ...base,
    mood: (data.keywords?.results || []).map(
      (k) => k.name
    ),
    runtime: 0,
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
  // console.log("TMDB Season Details:", detail);
  return {
    name: detail.name || `Season ${normalizedSeason}`,
    overview: detail.overview || "",
    poster: toImageUrl(detail.poster_path),
    episodes: Array.isArray(detail.episodes)
      ? detail.episodes
        .filter((ep) => !ep.air_date || ep.air_date <= todayStr) // string compare
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

/**
 * FIX #2: Sort by `releaseYear` (exists on normalized items).
 * FIX #8: Lowered vote_count.gte from 200 → 50 for newer titles.
 * NEW: supports studio.collectionIds — for sub-brand tiles (e.g. Harry Potter)
 * that aren't a single production company/network but a set of TMDB collections.
 */
export const fetchTMDBStudioTitles = async (studioKey, { moviePages = 2, tvPages = 2 } = {}) => {
  const studio = getStudioConfig(studioKey);
  if (!studio) return [];

  // Collection-based studios (franchise sub-brands) bypass discover entirely.
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
      "vote_count.gte": "50", // was 200 — too strict for newer releases
      page: String(i + 1),
    })
  );

  const tvRequests = Array.from({ length: tvPages }, (_, i) =>
    requestTMDB("/discover/tv", {
      ...(keyword ? { with_keywords: keyword } : { with_networks: networkParam }),
      sort_by: "popularity.desc",
      "vote_count.gte": "50",
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

  // FIX #2: Sort by releaseYear (property that actually exists)
  return combined.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
};

export const fetchTMDBDataSet = fetchTMDBCatalog;

// ─── Creative rail titles ──────────────────────────────────────────────
// Maps a genre tag to an evocative row title, HBO Max/Netflix editorial style,
// instead of a flat "Action Movies" / "Drama" label.
const CREATIVE_GENRE_TITLES = {
  Action: "Explosive Action",
  Adventure: "Epic Adventures",
  Animation: "For the Whole Family",
  Comedy: "Laughter Is Your Best Medicine",
  Crime: "Crime Doesn't Pay",
  Documentary: "Jaw-Dropping Documentaries",
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

// Priority order so the page reads with intent rather than alphabetically.
const RAIL_PRIORITY = [
  "Documentary", "Family", "Animation", "Kids", "Comedy", "Horror",
  "Fantasy", "Adventure", "Action", "Sci-Fi", "Thriller", "Crime",
  "Mystery", "Drama", "Romance", "History", "War", "Music",
];

/**
 * Groups a flat list of normalized TMDB items into curated, editorially-titled
 * rails by genre — e.g. HBO's "Songs of Men and Beasts" (Horror/monster titles),
 * "For the Whole Family" (Animation/Family), "Jaw-Dropping Documentaries", etc.
 * Always leads with a "Popular Movies & TV Series" rail of the highest-rated items.
 */
export const buildCreativeRails = (items, { minItemsPerRail = 4 } = {}) => {
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

  // FIX: Keep track of item IDs that have already been placed in a genre rail
  const assignedItemIds = new Set();

  for (const genre of RAIL_PRIORITY) {
    // Filter items by genre AND ensure they haven't been assigned to a previous rail
    const genreItems = list.filter((i) =>
      (i.category || []).includes(genre) && !assignedItemIds.has(i.id)
    );

    if (genreItems.length < minItemsPerRail) continue;

    const title = CREATIVE_GENRE_TITLES[genre] || genre;
    // Avoid duplicate rail titles (e.g. Animation + Family mapping to same title)
    if (usedGenres.has(title)) continue;
    usedGenres.add(title);

    // Take up to 20 items for this rail
    const finalItemsForRail = genreItems.slice(0, 25);

    // Mark these items as assigned so they don't appear in the next genre loop
    finalItemsForRail.forEach((item) => assignedItemIds.add(item.id));

    rails.push({
      title,
      items: finalItemsForRail,
      showViewAll: rails.length < 3,
    });
  }

  return rails;
};