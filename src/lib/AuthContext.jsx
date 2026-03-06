import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings] = useState(null);

  const loadUserProfile = async (supabaseUser) => {
    if (!supabaseUser) {
      setUser(null);
      setIsAuthenticated(false);
      return;
    }
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email,
        ...(profile || {}),
      });
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setUser({ id: supabaseUser.id, email: supabaseUser.email });
      setIsAuthenticated(true);
    }
  };

  useEffect(() => {
    let subscription;

    const init = async () => {
      try {
        // Race getSession against a timeout so the app doesn't hang
        // when Supabase is unreachable
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Supabase connection timeout')), 5000)
          ),
        ]);

        await loadUserProfile(sessionResult?.data?.session?.user ?? null);
      } catch (err) {
        console.warn('Auth init failed (Supabase may be unreachable):', err.message);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoadingAuth(false);
      }

      try {
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          loadUserProfile(session?.user ?? null);
        });
        subscription = data?.subscription;
      } catch {
        // Ignore if onAuthStateChange fails
      }
    };

    init();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const logout = async (shouldRedirect = true) => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) window.location.href = '/';
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
