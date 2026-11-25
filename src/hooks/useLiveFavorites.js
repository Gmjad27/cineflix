import { useState, useCallback } from 'react';

const STORAGE_KEY = 'cineflix_live_favorites';

export function useLiveFavorites() {
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = useCallback((itemOrId, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const id =
      typeof itemOrId === 'object'
        ? String(itemOrId.streamId || itemOrId.id)
        : String(itemOrId);
    if (!id) return;

    setFavoriteIds((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // quota exceeded or private mode
      }
      return updated;
    });
  }, []);

  const isFavorite = useCallback(
    (itemOrId) => {
      if (!itemOrId) return false;
      const id =
        typeof itemOrId === 'object'
          ? String(itemOrId.streamId || itemOrId.id)
          : String(itemOrId);
      return favoriteIds.includes(id);
    },
    [favoriteIds]
  );

  return { favoriteIds, toggleFavorite, isFavorite };
}

export default useLiveFavorites;
