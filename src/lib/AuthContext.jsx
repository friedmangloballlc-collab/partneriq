import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import posthog from 'posthog-js';
import formbricks from '@formbricks/js';

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
      // Use SECURITY DEFINER RPC — bypasses RLS, no race condition with auth.uid()
      const { data: profile, error: rpcError } = await supabase
        .rpc('get_my_profile')
        .single();

      if (rpcError || !profile) {
        // Profile doesn't exist yet — first-time OAuth user. Create one.
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
          .catch(() => ({ data: null }));

        if (newProfile) {
          setAuthError(null);
          setUser({ id: supabaseUser.id, email: supabaseUser.email, ...newProfile });
          setIsAuthenticated(true);
          return;
        }

        // Insert failed (shouldn't happen) — let them through with defaults
        setAuthError(null);
        setUser({ id: supabaseUser.id, email: supabaseUser.email, role: 'brand', plan: 'free' });
        setIsAuthenticated(true);
        return;
      }

      // Block banned or suspended users
      if (profile.is_banned) {
        setAuthError({ type: 'user_banned', message: profile.ban_reason || 'Your account has been banned.' });
        await supabase.auth.signOut();
        setUser(null);
        setIsAuthenticated(false);
        return;
      }
      if (profile.is_suspended) {
        setAuthError({ type: 'user_suspended', message: profile.suspension_reason || 'Your account has been temporarily suspended.' });
        await supabase.auth.signOut();
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      setAuthError(null);
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email,
        ...profile,
      });
      setIsAuthenticated(true);
      // Identify user in PostHog for analytics
      posthog.identify(supabaseUser.id, {
        email: supabaseUser.email,
        role: profile.role,
        plan: profile.plan,
        name: profile.full_name,
      });
      // Identify user in Crisp live chat
      if (window.$crisp) {
        window.$crisp.push(['set', 'user:email', [supabaseUser.email]]);
        if (profile.full_name) window.$crisp.push(['set', 'user:nickname', [profile.full_name]]);
        window.$crisp.push(['set', 'session:data', [[
          ['role', profile.role],
          ['plan', profile.plan || 'free'],
          ['user_id', supabaseUser.id],
        ]]]);
      }
      // Initialize Formbricks for in-app surveys
      formbricks.init({
        environmentId: 'cmnlf1odsna3qog01283b0au7',
        apiHost: 'https://app.formbricks.com',
        userId: supabaseUser.id,
        attributes: {
          email: supabaseUser.email,
          role: profile.role,
          plan: profile.plan || 'free',
        },
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
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
    posthog.reset();
    formbricks.logout();
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
