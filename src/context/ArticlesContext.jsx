import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const ArticlesContext = createContext();

const STORAGE_KEY = 'newsreader_saved_articles';

function loadStoredArticles() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function ArticlesProvider({ children }) {
  const { user } = useAuth();

  // Saved articles organized by username: { [username]: Article[] }
  const [savedArticles, setSavedArticles] = useState(loadStoredArticles);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedArticles));
    } catch {
      // Storage unavailable - articles kept in memory only
    }
  }, [savedArticles]);

  const getUserSavedArticles = () => {
    if (!user) return [];
    return savedArticles[user.username] || [];
  };

  const saveArticle = (article) => {
    if (!user) return;
    setSavedArticles(prev => {
      const userArticles = prev[user.username] || [];
      if (userArticles.some(a => a.url === article.url)) {
        return prev;
      }
      return { ...prev, [user.username]: [...userArticles, article] };
    });
  };

  const removeArticle = (url) => {
    if (!user) return;
    setSavedArticles(prev => ({
      ...prev,
      [user.username]: (prev[user.username] || []).filter(a => a.url !== url),
    }));
  };

  const isArticleSaved = (url) => {
    return getUserSavedArticles().some(a => a.url === url);
  };

  // Admin only: the full savedArticlesByUser object
  const getAllUserArticles = () => savedArticles;

  return (
    <ArticlesContext.Provider
      value={{
        saveArticle,
        removeArticle,
        isArticleSaved,
        getUserSavedArticles,
        getAllUserArticles,
      }}
    >
      {children}
    </ArticlesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useArticles = () => {
  const context = useContext(ArticlesContext);
  if (!context) {
    throw new Error('useArticles must be used within ArticlesProvider');
  }
  return context;
};
