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

// This is deliberately stored by the parent application. A cross-origin
// player cannot share its localStorage with localhost due to browser security.
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
