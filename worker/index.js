const TMDB_ORIGIN = "https://api.themoviedb.org/3";
const API_PREFIX = "/api/tmdb";
const PAPI_ORIGIN = "https://ondemand.st";

export default {
    async fetch(request, env) {
        const requestUrl = new URL(request.url);

        // Proxy live sports streams from ondemand.st
        if (requestUrl.pathname.startsWith("/papi")) {
            try {
                const targetUrl = new URL(`${PAPI_ORIGIN}${requestUrl.pathname}${requestUrl.search}`);
                const upstream = await fetch(targetUrl, {
                    headers: {
                        Accept: "application/json",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    },
                });

                const headers = new Headers(upstream.headers);
                headers.set("Access-Control-Allow-Origin", "*");
                headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
                headers.set("Cache-Control", "public, max-age=60");

                return new Response(upstream.body, {
                    status: upstream.status,
                    statusText: upstream.statusText,
                    headers,
                });
            } catch (err) {
                return new Response(JSON.stringify({ error: "Failed to proxy stream API", message: err.message }), {
                    status: 502,
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                });
            }
        }

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