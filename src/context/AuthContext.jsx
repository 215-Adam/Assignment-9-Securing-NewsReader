import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

const STORAGE_KEY = 'newsreader_user';
const VALID_ROLES = ['regular', 'admin'];

// Restore the session from localStorage so a page refresh doesn't log the user out
function loadStoredUser() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);

  // Mock login - accepts any username/password.
  // In a real app, credentials would be verified by a backend and the
  // role would come from the server, never from the client.
  const login = (username, password, role = 'regular') => {
    if (!username?.trim() || !password?.trim()) {
      throw new Error('Username and password are required');
    }

    const newUser = {
      username: username.trim(),
      role: VALID_ROLES.includes(role) ? role : 'regular',
    };

    setUser(newUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // Storage unavailable - session will only last until refresh
    }
    return newUser;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const isAuthenticated = () => user !== null;

  const isAdmin = () => user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
