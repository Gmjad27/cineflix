import { getStudioConfig } from "./studios";
const TMDB_API_KEY =
  import.meta.env.VITE_TMDB_API_KEY;
const YOUTUBE_API_KEY =
  import.meta.env.VITE_YOUTUBE_API_KEY;

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/original";

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

const langMap = {
  ar: "Arabic",
  bn: "Bengali",
  de: "German",
  en: "English",
  es: "Spanish",
  fr: "French",
  hi: "Hindi",
  it: "Italian",
  ja: "Japanese",
  kn: "Kannada",
  ko: "Korean",
  ml: "Malayalam",
  mr: "Marathi",
  pa: "Punjabi",
  ru: "Russian",
  ta: "Tamil",
  te: "Telugu",
  tr: "Turkish",
  zh: "Chinese",
};

const toImageUrl = (path) => (path ? `${TMDB_IMAGE_URL}${path}` : "");

const normalizeAgeRating = (value) => {
  const rating = String(value || "").trim().toUpperCase();
  if (!rating) return "";
  if (rating === "PG13") return "UA 13+";
  if (rating === "TV-14") return "UA 13+";
  if (rating === "TV-PG") return "UA 7+";
  if (rating === "TV-G" || rating === "G" || rating === "U") return "U";
  if (rating === "TV-Y7") return "U 7+";
  if (rating === "TV-Y") return "U";
  if (rating === "TV-MA" || rating === "R" || rating === "NC-17" || rating === "A") return "A";
  if (rating === "PG") return "UA";
  return rating.replace("-", " ");
};

const pickMovieAgeRating = (releaseDates) => {
  const results = Array.isArray(releaseDates?.results) ? releaseDates.results : [];
  const preferred = ["IN", "US", "GB"];

  for (const country of preferred) {
    const match = results.find((item) => item?.iso_3166_1 === country);
    const certification = match?.release_dates?.find((item) => item?.certification)?.certification;
    if (certification) return normalizeAgeRating(certification);
  }

  const fallback = results
    .flatMap((item) => item?.release_dates || [])
    .find((item) => item?.certification)?.certification;

  return normalizeAgeRating(fallback) || "UA 13+";
};

const pickTVAgeRating = (contentRatings) => {
  const results = Array.isArray(contentRatings?.results) ? contentRatings.results : [];
  const preferred = ["IN", "US", "GB"];

  for (const country of preferred) {
    const match = results.find((item) => item?.iso_3166_1 === country);
    if (match?.rating) return normalizeAgeRating(match.rating);
  }

  const fallback = results.find((item) => item?.rating)?.rating;
  return normalizeAgeRating(fallback) || "UA 13+";
};

const pickYoutubeTrailerFromSearch = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) return "";

  const scored = items
    .map((item) => {
      const title = String(item?.snippet?.title || "").toLowerCase();
      const videoId = item?.id?.videoId;
      if (!videoId) return null;

      let score = 0;
      if (title.includes("official")) score += 3;
      if (title.includes("trailer")) score += 3;
      if (title.includes("teaser")) score += 1;
      if (title.includes("fan made")) score -= 4;
      return { videoId, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.videoId || "";
};

const fetchYouTubeTrailer = async ({ title, year, mediaType }) => {
  if (!YOUTUBE_API_KEY) return "";
  if (!title) return "";

  const query = `${title} ${year || ""} ${mediaType === "tv" ? "series" : "movie"} official trailer`.trim();
  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    key: YOUTUBE_API_KEY,
    type: "video",
    maxResults: "6",
    videoEmbeddable: "true",
    safeSearch: "strict",
  });

  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
  if (!response.ok) {
    console.error(`YouTube trailer search failed (${response.status})`);
    return "";
  }

  const payload = await response.json();
  return pickYoutubeTrailerFromSearch(payload?.items);
};

// FIX: centralizes the movie/tv resolution so we never repeat the
// `item.media_type || mediaType === "movie"` operator-precedence bug,
// which previously evaluated as `item.media_type || (mediaType === "movie")`
// and mis-typed almost every TV item.
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
  // FIX: was `item.media_typ` (typo) instead of `item.media_type`
  const releaseDate = isMovie ? item.release_date : item.first_air_date;
  const releaseYear = Number(String(releaseDate || "").slice(0, 4)) || 0;
  const tmdbId = Number(item.id) || 0;

  if (!tmdbId) return null;

  return {
    id: isMovie ? tmdbId : tmdbId + 10000000,
    tmdbId,
    img: toImageUrl(item.backdrop_path || item.poster_path),
    nameImg: toImageUrl(item.poster_path || item.backdrop_path),
    name: toImageUrl(item.poster_path || item.backdrop_path),
    name2: title || "Untitled",
    releaseYear,
    ua: "UA 13+",
    season: isMovie ? "Movie" : "1+ Seasons",
    language: [langMap[item.original_language] || "English"],
    desc: item.overview || "No description available.",
    category: item.genre_ids?.map((genreId) => genreMap[genreId]).filter(Boolean) || [],
    type: resolvedType,
    studio: isMovie ? "TMDB Movies" : "TMDB TV",
    episodes: isMovie ? undefined : { s1: 10 },
    rating: item.vote_average,
  };
};

const dedupeMedia = (items) => {
  const seenById = new Set();
  const seenByTitle = new Set();

  const makeTitleKey = (item) => {
    const title = String(item?.name2 || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
    const year = Number(item?.releaseYear) || 0;
    return `${item?.type}:${title}:${year}`;
  };

  return items.filter((item) => {
    if (!item) return false;

    const idKey = `${item.type}:${item.tmdbId}`;
    const titleKey = makeTitleKey(item);

    if (seenById.has(idKey) || seenByTitle.has(titleKey)) return false;

    seenById.add(idKey);
    seenByTitle.add(titleKey);
    return true;
  });
};

export const requestTMDB = async (path, params = {}, options = {}) => {
  const query = new URLSearchParams({
    api_key: TMDB_API_KEY, // Assuming this is defined in your environment
    language: "en-US",
    ...params,
  }).toString();

  const url = `${TMDB_BASE_URL}${path}?${query}`;

  // 1. Pass the signal to fetch so the AbortController can cancel it
  const response = await fetch(url, {
    signal: options.signal
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status}) for ${path}`);
  }

  const data = await response.json();
  const today = new Date();

  // 2. Centralized validation helper (Fixes the logic bug and cleans up the code)
  const isValidMedia = (movie) => {
    if (movie.adult) return false; // Remove adult content

    const dateString = movie.release_date || movie.first_air_date;
    if (!dateString) return false; // Remove if there is no date at all

    return new Date(dateString) <= today; // Remove upcoming/future releases
  };

  // 3. Apply the clean filter to whichever array TMDB returns
  if (Array.isArray(data.results)) {
    return data.results.filter(isValidMedia);
  }

  if (Array.isArray(data.parts)) {
    return data.parts
      .filter(isValidMedia)
      .sort((a, b) => new Date(a.release_date || a.first_air_date) - new Date(b.release_date || b.first_air_date));
  }

  if (Array.isArray(data.items)) {
    return data.items.filter(isValidMedia);
  }

  return [];
};

const requestTMDBObject = async (path, params = {}) => {
  const query = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: "en-US",
    ...params,
  }).toString();
  const url = `${TMDB_BASE_URL}${path}?${query}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status}) for ${path}`);
  }

  return response.json();
};

const normalizeList = (list, mediaType) => list.map((item) => normalizeItem(item, mediaType)).filter(Boolean);

const normalizeMixedMediaList = (list) =>
  list
    .filter((item) => item?.media_type === "movie" || item?.media_type === "tv")
    .map((item) => normalizeItem(item, item.media_type))
    .filter(Boolean);

export const fetchTMDBCatalog = async ({ moviePages = 3, tvPages = 3 } = {}) => {
  const movieRequests = Array.from({ length: moviePages }, (_, index) =>
    requestTMDB("/movie/popular", { page: String(index + 1) })
  );
  const tvRequests = Array.from({ length: tvPages }, (_, index) =>
    requestTMDB("/tv/popular", { page: String(index + 1) })
  );

  const [moviesByPage, tvByPage] = await Promise.all([
    Promise.all(movieRequests),
    Promise.all(tvRequests),
  ]);

  const movies = normalizeList(moviesByPage.flat(), "movie");
  const tv = normalizeList(tvByPage.flat(), "tv");
  return dedupeMedia([...movies, ...tv]);
};

export const fetchTMDBTrending = async ({ window = "week", limit = 12 } = {}) => {
  const [movieResults, tvResults] = await Promise.all([
    requestTMDB(`/trending/movie/${window}`),
    requestTMDB(`/trending/tv/${window}`),
  ]);

  const merged = dedupeMedia([
    ...normalizeList(movieResults, "movie"),
    ...normalizeList(tvResults, "tv"),
  ]);

  return merged.slice(0, limit);
};

// Netflix/Prime-style home layout:
// Hero -> Top 10 Today (ranked) -> Trending -> New Releases -> Popular ->
// Top Rated -> Genre rows -> curated saga collections
export const fetchTMDBHomeSections = async () => {
  const [
    heroRaw,
    trendingTodayRaw,
    trendingWeekMoviesRaw,
    trendingWeekTvRaw,
    nowPlayingMoviesRaw,
    onTheAirTvRaw,
    popularMoviesRaw,
    popularTvRaw,
    topRatedMoviesRaw,
    topRatedTvRaw,
    actionMoviesRaw,
    comedyMoviesRaw,
    horrorMoviesRaw,
    scifiMoviesRaw,
    WizardingRaw,
    WizardingRaw2,
    lordoftheringsRaw,
    lordoftheringsRaw2,
    lordoftheringsRaw3,
  ] = await Promise.all([
    requestTMDB("/trending/all/week"),
    requestTMDB("/trending/all/day"),
    requestTMDB("/trending/movie/week"),
    requestTMDB("/trending/tv/week"),
    requestTMDB("/movie/now_playing"),
    requestTMDB("/tv/on_the_air"),
    requestTMDB("/movie/popular"),
    requestTMDB("/tv/popular"),
    requestTMDB("/movie/top_rated"),
    requestTMDB("/tv/top_rated"),
    requestTMDB("/discover/movie", { with_genres: "28" }),
    requestTMDB("/discover/movie", { with_genres: "35" }),
    requestTMDB("/discover/movie", { with_genres: "27" }),
    requestTMDB("/discover/movie", { with_genres: "878" }),
    requestTMDB("/collection/1241"),
    requestTMDB("/collection/435259"),
    requestTMDB("/collection/119"),
    requestTMDB("/collection/121938"),
    requestTMDB("/search/tv", { query: "The Lord of the Rings: The Rings of Power" }),
  ]);

  const heroBanner = dedupeMedia(normalizeMixedMediaList(heroRaw)).slice(0, 12);

  // "Top 10 Today" — ranked, mixed movies + tv, like Netflix's numbered row
  const top10Today = dedupeMedia(normalizeMixedMediaList(trendingTodayRaw)).slice(0, 10);

  const trendingNow = dedupeMedia([
    ...normalizeList(trendingWeekMoviesRaw, "movie"),
    ...normalizeList(trendingWeekTvRaw, "tv"),
  ]).slice(0, 20);

  const newReleases = dedupeMedia([
    ...normalizeList(nowPlayingMoviesRaw, "movie"),
    ...normalizeList(onTheAirTvRaw, "tv"),
  ]).slice(0, 20);

  const popularMovies = dedupeMedia(normalizeList(popularMoviesRaw, "movie")).slice(0, 20);
  const popularShows = dedupeMedia(normalizeList(popularTvRaw, "tv")).slice(0, 20);

  const topRated = dedupeMedia([
    ...normalizeList(topRatedMoviesRaw, "movie"),
    ...normalizeList(topRatedTvRaw, "tv"),
  ]).slice(0, 20);

  const actionMovies = dedupeMedia(normalizeList(actionMoviesRaw, "movie")).slice(0, 20);
  const comedyMovies = dedupeMedia(normalizeList(comedyMoviesRaw, "movie")).slice(0, 20);
  const horrorMovies = dedupeMedia(normalizeList(horrorMoviesRaw, "movie")).slice(0, 20);
  const scifiMovies = dedupeMedia(normalizeList(scifiMoviesRaw, "movie")).slice(0, 20);

  const wizardingWorld = dedupeMedia([
    ...normalizeList(WizardingRaw, "movie"),
    ...normalizeList(WizardingRaw2, "movie"),
  ]).slice(0, 20);

  const middleEarth = dedupeMedia([
    ...normalizeList(lordoftheringsRaw, "movie"),
    ...normalizeList(lordoftheringsRaw2, "movie"),
    ...normalizeList(lordoftheringsRaw3, "tv"),
  ]).slice(0, 20);

  return {
    heroBanner,
    rails: [
      { title: "Top 10 Today", items: top10Today, ranked: true },
      { title: "Trending Now", items: trendingNow },
      { title: "New Releases", items: newReleases },
      { title: "Popular Movies", items: popularMovies },
      { title: "Popular TV Shows", items: popularShows },
      { title: "Top Rated", items: topRated },
      { title: "Action Movies", items: actionMovies },
      { title: "Comedy Movies", items: comedyMovies },
      { title: "Horror Movies", items: horrorMovies },
      { title: "Sci-Fi Movies", items: scifiMovies },
      { title: "Wizarding World Collection", items: wizardingWorld },
      { title: "Middle-earth Saga", items: middleEarth },
    ],
  };
};

export const fetchTMDBMovieSections = async () => {
  const [
    heroRaw,
    trendingMoviesRaw,
    nowPlayingRaw,
    popularMoviesRaw,
    topRatedRaw,
    actionMoviesRaw,
    comedyMoviesRaw,
    horrorMoviesRaw,
    romanceMoviesRaw,
  ] = await Promise.all([
    requestTMDB("/trending/all/week"),
    requestTMDB("/trending/movie/week"),
    requestTMDB("/movie/now_playing"),
    requestTMDB("/movie/popular"),
    requestTMDB("/movie/top_rated"),
    requestTMDB("/discover/movie", { with_genres: "28" }),
    requestTMDB("/discover/movie", { with_genres: "35" }),
    requestTMDB("/discover/movie", { with_genres: "27" }),
    requestTMDB("/discover/movie", { with_genres: "10749" }),
  ]);

  const heroBanner = dedupeMedia(normalizeMixedMediaList(heroRaw))
    .filter((item) => item.type === "movie")
    .slice(0, 12);

  return {
    heroBanner,
    rails: [
      { title: "Trending Now", items: dedupeMedia(normalizeList(trendingMoviesRaw, "movie")).slice(0, 20) },
      { title: "New Releases", items: dedupeMedia(normalizeList(nowPlayingRaw, "movie")).slice(0, 20) },
      { title: "Popular Movies", items: dedupeMedia(normalizeList(popularMoviesRaw, "movie")).slice(0, 20) },
      { title: "Top Rated", items: dedupeMedia(normalizeList(topRatedRaw, "movie")).slice(0, 20) },
      { title: "Action Movies", items: dedupeMedia(normalizeList(actionMoviesRaw, "movie")).slice(0, 20) },
      { title: "Comedy Movies", items: dedupeMedia(normalizeList(comedyMoviesRaw, "movie")).slice(0, 20) },
      { title: "Horror Movies", items: dedupeMedia(normalizeList(horrorMoviesRaw, "movie")).slice(0, 20) },
      { title: "Romance Movies", items: dedupeMedia(normalizeList(romanceMoviesRaw, "movie")).slice(0, 20) },
    ],
  };
};

export const fetchTMDBTVSections = async () => {
  const [
    heroRaw,
    trendingShowsRaw,
    onTheAirRaw,
    popularShowsRaw,
    topRatedRaw,
    dramaShowsRaw,
    comedyShowsRaw,
  ] = await Promise.all([
    requestTMDB("/trending/all/week"),
    requestTMDB("/trending/tv/week"),
    requestTMDB("/tv/on_the_air"),
    requestTMDB("/tv/popular"),
    requestTMDB("/tv/top_rated"),
    requestTMDB("/discover/tv", { with_genres: "18" }),
    requestTMDB("/discover/tv", { with_genres: "35" }),
  ]);

  const heroBanner = dedupeMedia(normalizeMixedMediaList(heroRaw))
    .filter((item) => item.type === "tv")
    .slice(0, 12);

  return {
    heroBanner,
    rails: [
      { title: "Trending Now", items: dedupeMedia(normalizeList(trendingShowsRaw, "tv")).slice(0, 20) },
      { title: "New Episodes", items: dedupeMedia(normalizeList(onTheAirRaw, "tv")).slice(0, 20) },
      { title: "Popular Shows", items: dedupeMedia(normalizeList(popularShowsRaw, "tv")).slice(0, 20) },
      { title: "Top Rated", items: dedupeMedia(normalizeList(topRatedRaw, "tv")).slice(0, 20) },
      { title: "Drama Shows", items: dedupeMedia(normalizeList(dramaShowsRaw, "tv")).slice(0, 20) },
      { title: "Comedy Shows", items: dedupeMedia(normalizeList(comedyShowsRaw, "tv")).slice(0, 20) },
    ],
  };
};

export const fetchMoreLikeThis = async (type, id, { page = 1 } = {}) => {
  if (!type || !id) return [];

  try {
    // Dynamically injects 'movie' or 'tv' and the specific ID
    const results = await requestTMDB(`/${type}/${id}/recommendations`, {
      page: String(page)
    });

    // We can use the same normalizeItem function from your search utility
    return results.map((item) => normalizeItem(item, type)).filter(Boolean);

  } catch (error) {
    console.error(`Failed to fetch recommendations for ${type} ${id}:`, error);
    return [];
  }
};

export const searchTMDBTitles = async (query, { page = 1, signal } = {}) => {
  const q = String(query || "").trim();
  if (q.length < 2) return [];

  // Note: We pass the 'signal' down to requestTMDB
  const results = await requestTMDB("/search/multi", {
    query: q,
    page: String(page),
    include_adult: "false",
  }, { signal }); // <-- Passing the signal here

  return results
    .filter((item) => item?.media_type === "movie" || item?.media_type === "tv")
    .map((item) => normalizeItem(item, item.media_type))
    .filter(Boolean);
};

export const fetchTMDBDetails = async (mediaType, id) => {
  if (mediaType !== "movie" && mediaType !== "tv") return null;
  const tmdbId = Number(id);
  if (!tmdbId) return null;

  const detail = await requestTMDBObject(`/${mediaType}/${tmdbId}`, {
    append_to_response: mediaType === "movie" ? "release_dates" : "content_ratings",
  });
  const credits = await requestTMDBObject(`/${mediaType}/${tmdbId}/credits`, {
    append_to_response: "credits",
  });
  const tmdbData = await requestTMDBObject(`/${mediaType}/${tmdbId}`, {
    append_to_response: mediaType === "movie"
      ? "images,release_dates"
      : "images,content_ratings",
  });
  if (!detail || typeof detail !== "object") return null;

  const resolvedTrailer = await fetchYouTubeTrailer({
    title: mediaType === "movie" ? detail.title : detail.name,
    year: Number(String((mediaType === "movie" ? detail.release_date : detail.first_air_date) || "").slice(0, 4)) || "",
    mediaType,
  });

  if (mediaType === "movie") {
    return {
      mbg: toImageUrl(detail.backdrop_path),
      cast: Array.isArray(credits?.cast) ? credits.cast.slice(0, 10) : [],
      nameImg2: toImageUrl(tmdbData.images.logos?.[0]?.file_path),
      year: Number(detail.release_date.slice(0, 4)),
      runtime: Number(detail.runtime) || 0,
      seasonLabel: Number(detail.runtime) > 0 ? `${detail.runtime}m` : "Movie",
      episodes: undefined,
      categories: Array.isArray(detail.genres)
        ? detail.genres.map((g) => g?.name).filter(Boolean)
        : [],
      languages: Array.isArray(detail.spoken_languages)
        ? detail.spoken_languages.map((l) => l?.english_name || l?.name).filter(Boolean)
        : [],
      desc: detail.overview || "",
      ageRating: pickMovieAgeRating(detail.release_dates),
      trailerUrl: resolvedTrailer,
    };
  }

  const seasons = Array.isArray(detail.seasons) ? detail.seasons : [];
  const episodes = seasons
    .filter((s) => Number(s?.season_number) > 0)
    .reduce((acc, s) => {
      acc[`s${s.season_number}`] = Number(s.episode_count) || 10;
      return acc;
    }, {});

  return {
    mbg: toImageUrl(tmdbData.images.backdrops?.[0]?.file_path || detail.backdrop_path),
    cast: Array.isArray(credits?.cast) ? credits.cast.slice(0, 10) : [],
    nameImg2: toImageUrl(tmdbData.images.logos?.[0]?.file_path),
    runtime: 0,
    seasonLabel:
      Number(detail.number_of_seasons) > 0
        ? `${detail.number_of_seasons} Season${detail.number_of_seasons > 1 ? "s" : ""}`
        : "1 Season",
    episodes: Object.keys(episodes).length > 0 ? episodes : { s1: 10 },
    categories: Array.isArray(detail.genres)
      ? detail.genres.map((g) => g?.name).filter(Boolean)
      : [],
    languages: Array.isArray(detail.spoken_languages)
      ? detail.spoken_languages.map((l) => l?.english_name || l?.name).filter(Boolean)
      : [],
    desc: detail.overview || "",
    ageRating: pickTVAgeRating(detail.content_ratings),
    trailerUrl: resolvedTrailer,
  };
};

export const fetchTMDBSeasonDetails = async (tvId, seasonNumber) => {
  const normalizedId = Number(tvId);
  const normalizedSeason = Number(seasonNumber);

  if (!normalizedId || !normalizedSeason) return null;

  const detail = await requestTMDBObject(`/tv/${normalizedId}/season/${normalizedSeason}`);
  if (!detail || typeof detail !== "object") return null;

  return {
    name: detail.name || `Season ${normalizedSeason}`,
    overview: detail.overview || "",
    poster: toImageUrl(detail.poster_path),
    episodes: Array.isArray(detail.episodes)
      ? detail.episodes.map((episode) => ({
        id: episode?.id || `${normalizedSeason}-${episode?.episode_number || 0}`,
        number: Number(episode?.episode_number) || 0,
        name: episode?.name || `Episode ${episode?.episode_number || ""}`.trim(),
        overview: episode?.overview || "",
        image: toImageUrl(episode?.still_path || detail.poster_path),
        runtime: Number(episode?.runtime) || 0,
        airDate: episode?.air_date || "",
      }))
      : [],
  };
};

export const fetchTMDBStudioTitles = async (studioKey, { moviePages = 2, tvPages = 2 } = {}) => {
  const studio = getStudioConfig(studioKey);
  if (!studio) return [];

  const companyParam = studio.companyIds?.join("|") || "";
  const networkParam = studio.networkIds?.join("|") || "";

  const keywordMap = {
    MARVEL: "180547",
    DC: "312528|229266|329136",
  };

  const keyword = keywordMap[studioKey] || "";

  const movieRequests = Array.from({ length: moviePages }, (_, index) =>
    requestTMDB("/discover/movie", {
      ...(keyword ? { with_keywords: keyword } : { with_companies: companyParam }),
      sort_by: "vote_average.desc",
      "vote_count.gte": "200",
      page: String(index + 1),
    })
  );

  const tvRequests = Array.from({ length: tvPages }, (_, index) =>
    requestTMDB("/discover/tv", {
      ...(keyword ? { with_keywords: keyword } : { with_networks: networkParam }),
      sort_by: "vote_average.desc",
      "vote_count.gte": "200",
      page: String(index + 1),
    })
  );

  const [moviePagesData, tvPagesData] = await Promise.all([
    Promise.all(movieRequests),
    Promise.all(tvRequests),
  ]);

  const movies = normalizeList(moviePagesData.flat(), "movie");
  const tv = normalizeList(tvPagesData.flat(), "tv");

  const combined = dedupeMedia([...movies, ...tv]);

  return combined.sort((a, b) => {
    const dateA = new Date(a.releaseDate || a.firstAirDate || 0);
    const dateB = new Date(b.releaseDate || b.firstAirDate || 0);
    return dateB - dateA;
  });
};

export const fetchTMDBDataSet = fetchTMDBCatalog;