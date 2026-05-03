'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/backend/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1) Resolve current session up front. Don't rely on onAuthStateChange to
  //    flip `loading` — its INITIAL_SESSION event can be delayed by token
  //    refresh / cross-tab Web Locks and wedge the UI on reload.
  useEffect(() => {
    if (!supabase) {
      setUser(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    // Hard escape hatch — if the SDK wedges, unblock the UI anyway.
    const safety = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 4000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      setUser(session?.user ?? null);
      setLoading(false);
      clearTimeout(safety);
    }).catch(() => {
      if (cancelled) return;
      setUser(null);
      setLoading(false);
      clearTimeout(safety);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Listener only handles future changes — never gates `loading`.
      setUser(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      clearTimeout(safety);
      subscription.unsubscribe();
    };
  }, []);

  // 2) Profile fetch runs independently and never blocks the auth gate.
  useEffect(() => {
    if (!supabase || !user) {
      setProfile(null);
      return;
    }

    let cancelled = false;

    (async () => {
      const { data: existing } = await supabase
        .from('profiles').select('*').eq('id', user.id).maybeSingle();

      if (cancelled) return;

      const pendingRole = typeof window !== 'undefined'
        ? sessionStorage.getItem('pendingGoogleRole')
        : null;
      if (typeof window !== 'undefined') sessionStorage.removeItem('pendingGoogleRole');

      if (existing) {
        if (pendingRole && existing.role !== pendingRole) {
          await supabase.from('profiles').update({ role: pendingRole }).eq('id', user.id);
          if (!cancelled) setProfile({ ...existing, role: pendingRole });
        } else {
          setProfile(existing);
        }
      } else {
        setProfile(null);
      }
    })();

    return () => { cancelled = true; };
  }, [user?.id]);

  return (
    <AuthContext.Provider value={{ user, profile, setProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
