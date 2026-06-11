import { useState, useEffect, useCallback } from 'react';
import { newsApi } from '../api/newsApi';

export function useFavorites(userId) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const data = await newsApi.getFavorites(userId);
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const toggleFavorite = useCallback(async (ticker) => {
    try {
      const isFavorite = favorites.some(f => f.symbol === ticker);
      
      if (isFavorite) {
        await newsApi.removeFavorite(userId, ticker);
        setFavorites(prev => prev.filter(f => f.symbol !== ticker));
      } else {
        await newsApi.addFavorite(userId, ticker);
        await fetchFavorites(); // Refresh list to get full data
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [userId, favorites, fetchFavorites]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return { favorites, loading, toggleFavorite, refresh: fetchFavorites };
}