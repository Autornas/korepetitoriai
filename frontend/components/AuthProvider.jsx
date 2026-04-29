'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/backend/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = still initializing
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setUser(null);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);

      if (u) {
        const { data: existing } = await supabase
          .from('profiles').select('*').eq('id', u.id).single();

        const pendingRole = typeof window !== 'undefined'
          ? sessionStorage.getItem('pendingGoogleRole')
          : null;
        if (typeof window !== 'undefined') sessionStorage.removeItem('pendingGoogleRole');

        if (existing) {
          // If user signed in via Google with a specific role selected, apply it
          if (pendingRole && existing.role !== pendingRole) {
            await supabase.from('profiles').update({ role: pendingRole }).eq('id', u.id);
            setProfile({ ...existing, role: pendingRole });
          } else {
            setProfile(existing);
          }
        } else {
          // Trigger hasn't fired yet — profile will appear on next auth event
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, setProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
