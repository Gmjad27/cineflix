const STORAGE_KEY = 'continue-watching';
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

// ADDED REMOVE FUNCTION HERE
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