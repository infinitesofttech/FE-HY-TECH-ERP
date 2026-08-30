import { AuthTokens, UserRole, LoginResponse } from '@/types';

const ACCESS_TOKEN_KEY = 'hytech_access_token';
const REFRESH_TOKEN_KEY = 'hytech_refresh_token';
const USER_ROLE_KEY = 'hytech_user_role';
const USER_PROFILE_KEY = 'hytech_user_profile';

// In-memory token cache for security
let inMemoryAccessToken: string | null = null;

export const authStorage = {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return inMemoryAccessToken || localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken(token: string) {
    inMemoryAccessToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  },

  getUserRole(): UserRole | null {
    if (typeof window === 'undefined') return null;
    return (localStorage.getItem(USER_ROLE_KEY) as UserRole) || null;
  },

  setUserRole(role: UserRole) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_ROLE_KEY, role);
    }
  },

  getUserProfile<T>(): T | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setUserProfile<T>(profile: T) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    }
  },

  setSession(data: LoginResponse) {
    this.setAccessToken(data.tokens.access);
    this.setRefreshToken(data.tokens.refresh);
    this.setUserRole(data.user_type);

    const profile = data.user || data.employee || data.customer;
    if (profile) {
      this.setUserProfile(profile);
    }
  },

  clearSession() {
    inMemoryAccessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_ROLE_KEY);
      localStorage.removeItem(USER_PROFILE_KEY);
    }
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};
