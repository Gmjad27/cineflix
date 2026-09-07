const TMDB_ORIGIN = "https://api.themoviedb.org/3";
const API_PREFIX = "/api/tmdb";

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);

    if (!requestUrl.pathname.startsWith(API_PREFIX)) {
      return env.ASSETS.fetch(request);
    }

    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405 });
    }

    if (!env.TMDB_API_KEY) {
      return new Response("TMDB proxy is not configured", { status: 500 });
    }

    const tmdbPath = requestUrl.pathname.slice(API_PREFIX.length) || "/configuration";
    const tmdbUrl = new URL(`${TMDB_ORIGIN}${tmdbPath}`);
    requestUrl.searchParams.forEach((value, key) => tmdbUrl.searchParams.set(key, value));
    tmdbUrl.searchParams.set("api_key", env.TMDB_API_KEY);

    const upstream = await fetch(tmdbUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Cineflix TMDB proxy",
      },
    });

    const headers = new Headers(upstream.headers);
    headers.set("Cache-Control", "public, max-age=300, s-maxage=900");
    headers.delete("set-cookie");

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  },
};