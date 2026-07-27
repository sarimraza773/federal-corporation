import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    async function applySession(nextSession) {
      if (!active) return;
      setSession(nextSession);
      if (!nextSession) {
        setIsStaff(false);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.rpc('is_approved_staff');
      if (!active) return;
      setIsStaff(!error && data === true);
      setLoading(false);
    }

    supabase.auth.getSession().then(({ data }) => applySession(data.session));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setLoading(true);
      applySession(nextSession);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, isStaff, loading, configured: isSupabaseConfigured }),
    [session, isStaff, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
