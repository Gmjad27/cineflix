const STORAGE_KEY = 'continue-watching';
const WATCHED_EPISODES_KEY = 'watched-episodes';
const MAX_ITEMS = 24;

const readItems = () => {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

export const getContinueWatching = () =>
  readItems().sort((a, b) => (b.lastWatched || 0) - (a.lastWatched || 0));

export const saveContinueWatching = (item) => {
  if (!item?.tmdbId || !item?.type) return;

  const entry = {
    ...item,
    id: `${item.type}:${item.tmdbId}`,
    lastWatched: Date.now(),
  };
  const remaining = readItems().filter((saved) => saved.id !== entry.id);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...remaining].slice(0, MAX_ITEMS)));
  } catch (error) {
    console.warn('Unable to save continue watching item.', error);
  }
};

export const removeContinueWatching = (identifier) => {
  if (!identifier) return;

  const remaining = readItems().filter(
    (saved) => saved.id !== identifier && saved.streamId !== identifier
  );

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  } catch (error) {
    console.warn('Unable to remove continue watching item.', error);
  }
};

// ==========================================
// ADDED: Per-episode "watched" tracking
// Stored as { [tmdbId]: ["season-episode", ...] } so Watch.jsx
// can highlight which episodes of a show have already been played.
// ==========================================
const readWatchedEpisodes = () => {
  try {
    const value = JSON.parse(localStorage.getItem(WATCHED_EPISODES_KEY) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
};

const writeWatchedEpisodes = (all) => {
  try {
    localStorage.setItem(WATCHED_EPISODES_KEY, JSON.stringify(all));
  } catch (error) {
    console.warn('Unable to update watched episodes.', error);
  }
};

export const getWatchedEpisodes = (tmdbId) => {
  if (!tmdbId) return [];
  const all = readWatchedEpisodes();
  return Array.isArray(all[String(tmdbId)]) ? all[String(tmdbId)] : [];
};

export const isEpisodeWatched = (tmdbId, season, episode) =>
  getWatchedEpisodes(tmdbId).includes(`${season}-${episode}`);

export const markEpisodeWatched = (tmdbId, season, episode) => {
  if (!tmdbId || !season || !episode) return;
  const all = readWatchedEpisodes();
  const key = String(tmdbId);
  const episodeKey = `${season}-${episode}`;
  const existing = Array.isArray(all[key]) ? all[key] : [];
  if (!existing.includes(episodeKey)) {
    all[key] = [...existing, episodeKey];
    writeWatchedEpisodes(all);
  }
};

export const unmarkEpisodeWatched = (tmdbId, season, episode) => {
  if (!tmdbId || !season || !episode) return;
  const all = readWatchedEpisodes();
  const key = String(tmdbId);
  const episodeKey = `${season}-${episode}`;
  if (Array.isArray(all[key]) && all[key].includes(episodeKey)) {
    all[key] = all[key].filter((k) => k !== episodeKey);
    writeWatchedEpisodes(all);
  }
};