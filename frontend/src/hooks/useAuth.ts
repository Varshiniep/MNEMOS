import { useState, useEffect } from 'react';

const SESSION_KEY = 'mnemos_auth';

export interface AuthUser {
  email: string;
  name: string;
  isDemo: boolean;
}

// ── Simple in-memory session store ───────────────────────────────────────────
let _user: AuthUser | null = (() => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
})();

const _listeners = new Set<(u: AuthUser | null) => void>();

function setUser(u: AuthUser | null) {
  _user = u;
  if (u) sessionStorage.setItem(SESSION_KEY, JSON.stringify(u));
  else    sessionStorage.removeItem(SESSION_KEY);
  _listeners.forEach(fn => fn(u));
}

// ── Demo credentials ──────────────────────────────────────────────────────────
const DEMO_EMAIL    = 'demo@mnemos.ai';
const DEMO_PASSWORD = 'mnemos123';

export type LoginResult = { ok: true } | { ok: false; error: string };

export function loginWithCredentials(email: string, password: string): LoginResult {
  if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
    setUser({ email: DEMO_EMAIL, name: 'Demo User', isDemo: true });
    return { ok: true };
  }
  return { ok: false, error: 'Invalid credentials. Use demo@mnemos.ai / mnemos123' };
}

export function loginAsDemo(): void {
  setUser({ email: DEMO_EMAIL, name: 'Demo User', isDemo: true });
}

export function logout(): void {
  setUser(null);
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth(): { user: AuthUser | null; isAuthenticated: boolean } {
  const [user, setLocalUser] = useState<AuthUser | null>(_user);

  useEffect(() => {
    _listeners.add(setLocalUser);
    return () => { _listeners.delete(setLocalUser); };
  }, []);

  return { user, isAuthenticated: user !== null };
}
