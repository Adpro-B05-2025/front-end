'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { toast } from 'react-toastify';

// Create context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          const userStr = localStorage.getItem('user');

          if (token && userStr) {
            const userData = JSON.parse(userStr);
            setUser(userData);
            setIsAuthenticated(true);

            // OPTIONAL: validate real token by fetching profile
            try {
              const response = await api.getProfile();
              if (!response.ok) {
                handleLogout('Your session has expired. Please log in again.');
              } else {
                const profileData = await response.json();
                const updatedUserData = {
                  ...userData,
                  name: profileData.name,
                };
                localStorage.setItem('user', JSON.stringify(updatedUserData));
                setUser(updatedUserData);
              }
            } catch (error) {
              console.warn('Skipping auth check (probably dummy user):', error);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Real login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.login({ email, password });
      const data = await response.json();

      if (response.ok) {
        const newUser = {
          id: data.id,
          email: data.email,
          roles: data.roles,
          name: data.name,
        };

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(newUser));

        setUser(newUser);
        setIsAuthenticated(true);
        toast.success('Login successful!');
        router.push('/chat');
        return true;
      } else {
        toast.error(data.message || 'Invalid email or password');
        return false;
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Dummy login (for development/testing)
  const loginAsDummy = (id, name) => {
    const dummyUser = {
      id,
      name,
      email: `${name.toLowerCase()}@dummy.com`,
      roles: ['user'],
    };
    localStorage.setItem('token', 'dummy-token');
    localStorage.setItem('user', JSON.stringify(dummyUser));
    setUser(dummyUser);
    setIsAuthenticated(true);
    toast.success(`Logged in as ${name}`);
    router.push('/chat');
  };

  // Logout
  const handleLogout = (message) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    if (message) toast.info(message);
    router.push('/login');
  };

  // Manual user refresh (optional)
  const refreshUser = async () => {
    try {
      const response = await api.getProfile();
      if (response.ok) {
        const profileData = await response.json();
        const updatedUser = {
          ...user,
          name: profileData.name,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  return (
      <AuthContext.Provider value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout: handleLogout,
        refreshUser,
        loginAsDummy,
        setUser, // optional, for full control
      }}>
        {children}
      </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
