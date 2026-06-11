import { useState, useEffect, useCallback } from 'react';
import { newsApi } from '../api/newsApi';

export function useNews(filters = {}, page = 1) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      if (filters.search) {
        data = await newsApi.searchArticles(filters.search);
      } else {
        const params = { ...filters, page, limit: 20 };
        data = await newsApi.getNews(params);
      }

      setArticles(data.articles || data);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { articles, loading, error, totalPages, refetch: fetchNews };
}