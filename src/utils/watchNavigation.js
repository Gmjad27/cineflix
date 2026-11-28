/**
 * Resolves the canonical /watch route path for a media item or watch ID.
 * Supports:
 *  - Object items ({ type: 'movie'|'tv', tmdbId, id })
 *  - Composite IDs ('movie_550', 'tv_1399', 'movie:550')
 *  - Numeric/string ID with fallbackType
 */
export function getWatchPath(itemOrId, fallbackType = '') {
  if (!itemOrId) return '/';

  if (typeof itemOrId === 'object') {
    const type = String(itemOrId.type || fallbackType || '').toLowerCase();
    const rawId = itemOrId.tmdbId || itemOrId.id;
    if ((type === 'movie' || type === 'tv') && rawId) {
      const cleanNumeric = String(rawId).includes('_')
        ? String(rawId).split('_').pop()
        : String(rawId);
      return `/watch/${type}/${cleanNumeric}`;
    }
    if (rawId) {
      return getWatchPath(rawId, fallbackType);
    }
    return '/';
  }

  const raw = String(itemOrId).trim();
  const normalized = raw.replace(':', '_');
  if (normalized.includes('_')) {
    const [mediaType, idPart] = normalized.split('_');
    if ((mediaType === 'movie' || mediaType === 'tv') && idPart) {
      return `/watch/${mediaType}/${idPart}`;
    }
  }

  const typeNorm = String(fallbackType || '').toLowerCase();
  if (typeNorm === 'movie' || typeNorm === 'tv') {
    return `/watch/${typeNorm}/${raw}`;
  }

  return `/watch/${encodeURIComponent(raw)}`;
}

/**
 * Navigates to Watch as a desktop popup modal (via backgroundLocation) on >=768px,
 * or as a full page on mobile (<768px).
 */
export function navigateToWatch(navigate, { itemOrId, fallbackType = '', item = null, currentLocation = null } = {}) {
  const path = getWatchPath(item || itemOrId, fallbackType);
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;

  // Never nest a watch page inside backgroundLocation
  const safeBackground =
    isDesktop && currentLocation && !currentLocation.pathname.startsWith('/watch')
      ? {
          pathname: currentLocation.pathname,
          search: currentLocation.search,
          hash: currentLocation.hash,
        }
      : currentLocation?.state?.backgroundLocation || undefined;

  navigate(path, {
    state: {
      ...(item ? { item } : {}),
      ...(isDesktop && safeBackground ? { backgroundLocation: safeBackground } : {}),
    },
  });
}
