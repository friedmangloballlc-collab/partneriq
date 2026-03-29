import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const isLoadingPublicSettings = false;
  const [authError, setAuthError] = useState(null);

  const loadUserProfile = async (supabaseUser) => {
    if (!supabaseUser) {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
      return;
    }
    try {
      // Try to load profile — retry once after a short delay if RLS blocks the first attempt
      let profile = null;
      let profileError = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        const result = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();
        profile = result.data;
        profileError = result.error;
        if (profile) break;
        if (attempt === 0) await new Promise(r => setTimeout(r, 500)); // Wait 500ms before retry
      }

      if (profileError || !profile) {
        // Profile query failed — could be RLS timing or genuinely missing row.
        // Auto-create a profile if one doesn't exist (common for first-time OAuth users).
        // Only INSERT if truly missing — never upsert, to avoid overwriting admin/role
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            id: supabaseUser.id,
            email: supabaseUser.email,
            full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || '',
            role: 'brand',
            plan: 'free',
            onboarding_completed: false,
          })
          .select()
          .single()
          .then(res => res)
          .catch(() => ({ data: null })); // Row already exists — that's fine

        if (newProfile) {
          setAuthError(null);
          setUser({ id: supabaseUser.id, email: supabaseUser.email, ...newProfile });
          setIsAuthenticated(true);
          return;
        }

        // If even the upsert failed, let them through anyway — don't block existing users
        setAuthError(null);
        setUser({ id: supabaseUser.id, email: supabaseUser.email, role: 'brand', plan: 'free' });
        setIsAuthenticated(true);
        return;
      }

      setAuthError(null);
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email,
        ...profile,
      });
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Failed to load profile:', err);
      // Don't block the user — let them through with defaults
      setAuthError(null);
      setUser({ id: supabaseUser.id, email: supabaseUser.email, role: 'brand', plan: 'free' });
      setIsAuthenticated(true);
    }
  };

  useEffect(() => {
    let subscription;

    const init = async () => {
      try {
        // Race getSession against a timeout so the app doesn't hang
        // when Supabase is unreachable
        // Clear any stale auth tokens that might cause header errors
        try {
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith("sb-") && key.includes("-auth-token")) {
              const stored = localStorage.getItem(key);
              if (stored) {
                try { JSON.parse(stored); } catch { localStorage.removeItem(key); }
              }
            }
          });
        } catch {}

        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Supabase connection timeout')), 5000)
          ),
        ]);

        await loadUserProfile(sessionResult?.data?.session?.user ?? null);
      } catch (err) {
        // Silently handle auth errors — don't surface to UI
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
