const TMDB_ORIGIN = "https://api.themoviedb.org/3";

export default async function handler(request, response) {
    if (request.method !== "GET") {
        response.setHeader("Allow", "GET");
        return response.status(405).send("Method not allowed");
    }

    const apiKey = globalThis.process?.env?.TMDB_API_KEY;
    if (!apiKey) {
        return response.status(500).json({ error: "TMDB proxy is not configured" });
    }

    const rawPath = request.query.path;
    const segments = Array.isArray(rawPath)
        ? rawPath.flatMap((segment) => String(segment).split("/"))
        : rawPath
            ? String(rawPath).split("/")
            : [];
    const tmdbUrl = new URL(`${TMDB_ORIGIN}/${segments.map(encodeURIComponent).join("/")}`);

    Object.entries(request.query).forEach(([key, value]) => {
        if (key === "path") return;
        const values = Array.isArray(value) ? value : [value];
        values.forEach((item) => tmdbUrl.searchParams.append(key, String(item)));
    });
    tmdbUrl.searchParams.set("api_key", apiKey);

    try {
        const upstream = await fetch(tmdbUrl, {
            headers: {
                Accept: "application/json",
                "User-Agent": "Cineflix TMDB proxy",
            },
        });
        const body = await upstream.text();

        response.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=3600");
        response.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
        return response.status(upstream.status).send(body);
    } catch (error) {
        console.error("TMDB proxy request failed", error);
        return response.status(502).json({ error: "TMDB is unavailable" });
    }
}