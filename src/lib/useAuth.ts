import { useEffect, useState } from 'react';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'client';
  subscription?: {
    plan: 'standard' | 'premium' | 'none';
    expiresAt: string;
  };
}

export interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

type AuthListener = (user: MockUser | null, profile: UserProfile | null) => void;
const listeners = new Set<AuthListener>();

let currentUser: MockUser | null = (() => {
  try {
    const stored = localStorage.getItem('mock_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
})();

let currentProfile: UserProfile | null = (() => {
  try {
    const stored = localStorage.getItem('mock_profile');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
})();

export function mockLogin(user: MockUser, profile: UserProfile) {
  currentUser = user;
  currentProfile = profile;
  try {
    localStorage.setItem('mock_user', JSON.stringify(user));
    localStorage.setItem('mock_profile', JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save mock user in localStorage", e);
  }
  listeners.forEach(l => l(currentUser, currentProfile));
}

export function mockLogout() {
  currentUser = null;
  currentProfile = null;
  try {
    localStorage.removeItem('mock_user');
    localStorage.removeItem('mock_profile');
  } catch (e) {
    console.error("Failed to remove mock user from localStorage", e);
  }
  listeners.forEach(l => l(currentUser, currentProfile));
}

export function useAuth() {
  const [user, setUser] = useState<MockUser | null>(currentUser);
  const [profile, setProfile] = useState<UserProfile | null>(currentProfile);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const listener: AuthListener = (u, p) => {
      setUser(u);
      setProfile(p);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const login = () => {
    const defaultUser: MockUser = {
      uid: 'mock-user-123',
      email: 'diego.delacalleb@gmail.com',
      displayName: 'Diego de la Calle Berzal',
      photoURL: 'https://lh3.googleusercontent.com/a/ACg8ocL9KJZ_Hr5_flCzqN1Vd9FGHRaap1qv8tHjajBqQ-59QnHDKA=s96-c',
      emailVerified: true
    };
    const defaultProfile: UserProfile = {
      uid: 'mock-user-123',
      email: 'diego.delacalleb@gmail.com',
      displayName: 'Diego de la Calle Berzal',
      photoURL: 'https://lh3.googleusercontent.com/a/ACg8ocL9KJZ_Hr5_flCzqN1Vd9FGHRaap1qv8tHjajBqQ-59QnHDKA=s96-c',
      role: 'client'
    };
    mockLogin(defaultUser, defaultProfile);
  };

  const logout = () => {
    mockLogout();
  };

  return { user, profile, loading, login, logout };
}

