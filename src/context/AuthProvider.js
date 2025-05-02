'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { toast } from 'react-toastify';
import { hasPermission } from '@/utils/permissions';

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
        // Check if running in the browser
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          const userStr = localStorage.getItem('user');
          
          if (token && userStr) {
            const userData = JSON.parse(userStr);
            setUser(userData);
            setIsAuthenticated(true);
            
            // Verify token is still valid by making a request to /api/profile
            try {
              const response = await api.getProfile();
              if (!response.ok) {
                // Token is invalid or expired
                handleLogout('Your session has expired. Please log in again.');
              } else {
                // Update user data with latest profile info
                const profileData = await response.json();
                const updatedUserData = {
                  ...userData,
                  name: profileData.name,
                  // Add any other fields you want to keep in sync
                };
                localStorage.setItem('user', JSON.stringify(updatedUserData));
                setUser(updatedUserData);
              }
            } catch (error) {
              console.error('Error verifying authentication:', error);
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

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.login({ email, password });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          id: data.id,
          email: data.email,
          roles: data.roles,
          name: data.name
        }));

        setUser({
          id: data.id,
          email: data.email,
          roles: data.roles,
          name: data.name
        });
        setIsAuthenticated(true);
        toast.success('Login successful!');
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

  // Logout function
  const handleLogout = (message) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    
    if (message) {
      toast.info(message);
    }
    
    router.push('/login');
  };

  // Helper function to get user roles
  const getUserRoles = () => {
    return user?.roles || [];
  };

  // Return the context provider
  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated,
      login,
      logout: handleLogout,
      refreshUser: async () => {
        try {
          const response = await api.getProfile();
          if (response.ok) {
            const profileData = await response.json();
            const updatedUserData = {
              ...user,
              name: profileData.name,
              // Add other fields you want to keep in sync
            };
            localStorage.setItem('user', JSON.stringify(updatedUserData));
            setUser(updatedUserData);
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
      },
      // Add these new properties
      roles: getUserRoles(),
      isCareGiver: getUserRoles().includes('ROLE_CAREGIVER'),
      isPacillian: getUserRoles().includes('ROLE_PACILLIAN'),
      // Add permission check
      hasPermission: (action, resourceId = null) => hasPermission(user, action, resourceId)
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}