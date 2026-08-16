/**
 * Service d'authentification
 * ───────────────────────────
 * MOCK  → vérifie des identifiants hardcodés, retourne un faux token
 * API   → POST /auth/admin/login  |  POST /auth/client/login  |  GET /auth/me
 *
 * Pour brancher le vrai backend :
 *   .env → VITE_API_URL=http://localhost:5000/api
 */

import { apiClient } from './apiClient';
import {
  USE_MOCK,
  MOCK_DELAY,
  ENDPOINTS,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  CLIENT_TOKEN_KEY,
  CLIENT_USER_KEY,
} from '../config/api';
import type { AuthUser, LoginCredentials, LoginResponse } from '../types/models';

// ── Mock data ──────────────────────────────────────────────────────────────

const MOCK_ADMIN: AuthUser = {
  id: 'usr-001',
  name: 'Amadou Diop',
  email: 'admin@smalim.com',
  role: 'admin',
};

const MOCK_PASSWORD = 'smalim2024';
const MOCK_TOKEN    = 'mock_jwt_token_smalim_admin';

// ── Helper ─────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Service ────────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Connexion Admin
   * @endpoint POST /auth/admin/login
   * @body { email, password }
   * @returns { user, tokens }
   *
   * Backend retourne : { success, token, refreshToken, user: { first_name, last_name, ... } }
   * On normalise vers LoginResponse : { tokens: { accessToken }, user: { name, ... } }
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      if (
        credentials.email    === MOCK_ADMIN.email &&
        credentials.password === MOCK_PASSWORD
      ) {
        return { user: MOCK_ADMIN, tokens: { accessToken: MOCK_TOKEN } };
      }
      throw new Error('Email ou mot de passe incorrect.');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.post<Record<string, any>>(ENDPOINTS.AUTH.ADMIN_LOGIN, credentials);

    // Normalisation : backend → frontend
    const u = res.user ?? res;
    const normalizedUser: AuthUser = {
      id: String(u.id),
      name: (u.name ?? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim()) || u.email,
      email: u.email,
      role: (u.role ?? 'admin') as AuthUser['role'],
      avatar: u.avatar,
    };

    return {
      user: normalizedUser,
      tokens: {
        accessToken: res.token ?? res.accessToken,
        refreshToken: res.refreshToken,
      },
    };
  },

  /**
   * Connexion Client
   * @endpoint POST /auth/client/login
   */
  async clientLogin(credentials: LoginCredentials): Promise<LoginResponse> {
    if (USE_MOCK) {
      throw new Error('[MOCK] Utilise le ClientAuthContext pour la connexion client.');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.post<Record<string, any>>(ENDPOINTS.AUTH.CLIENT_LOGIN, credentials);

    const u = res.user ?? res;
    const normalizedUser: AuthUser = {
      id: String(u.id),
      name: (u.name ?? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim()) || u.email,
      email: u.email,
      role: 'admin',
    };

    return {
      user: normalizedUser,
      tokens: {
        accessToken: res.token ?? res.accessToken,
        refreshToken: res.refreshToken,
      },
    };
  },

  /**
   * Déconnexion (nettoyage localStorage uniquement)
   */
  async logout(): Promise<void> {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },

  /**
   * Récupère l'utilisateur courant depuis le token stocké
   * @endpoint GET /auth/me
   * Backend retourne : { success, user: { ...fields, type } }
   */
  async getMe(): Promise<AuthUser | null> {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return null;

    if (USE_MOCK) {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<Record<string, any>>(ENDPOINTS.AUTH.ME);

    // Backend retourne { success: true, user: {...} } - on extrait user
    const u = res.user ?? res;
    return {
      id: String(u.id),
      name: (u.name ?? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim()) || u.email,
      email: u.email,
      role: (u.role ?? 'admin') as AuthUser['role'],
      avatar: u.avatar,
    };
  },

  /**
   * Demande un lien de réinitialisation de mot de passe.
   * @endpoint POST /auth/forgot-password
   * Le backend répond toujours positivement, que le compte existe ou non.
   */
  async forgotPassword(email: string, type: 'admin' | 'client' = 'client'): Promise<string> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return 'Si un compte existe pour cet email, un lien de réinitialisation vient d\'être envoyé.';
    }
    const res = await apiClient.post<{ message: string }>(
      ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email, type }
    );
    return res.message;
  },

  /**
   * Applique un nouveau mot de passe à partir du token reçu par email.
   * @endpoint POST /auth/reset-password
   */
  async resetPassword(token: string, password: string): Promise<string> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return 'Mot de passe réinitialisé avec succès';
    }
    const res = await apiClient.post<{ message: string }>(
      ENDPOINTS.AUTH.RESET_PASSWORD,
      { token, password }
    );
    return res.message;
  },

  /**
   * Confirme une adresse email à partir du token reçu par email.
   * @endpoint POST /auth/verify-email
   */
  async verifyEmail(token: string): Promise<string> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return 'Adresse email confirmée';
    }
    const res = await apiClient.post<{ message: string }>(
      ENDPOINTS.AUTH.VERIFY_EMAIL,
      { token }
    );
    return res.message;
  },

  /**
   * Renvoie un lien de confirmation d'email.
   * @endpoint POST /auth/resend-verification
   */
  async resendVerification(email: string): Promise<string> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return 'Si un compte non confirmé existe pour cet email, un nouveau lien vient d\'être envoyé.';
    }
    const res = await apiClient.post<{ message: string }>(
      ENDPOINTS.AUTH.RESEND_VERIFICATION,
      { email }
    );
    return res.message;
  },

  /** Persiste token + user admin en localStorage */
  persistSession(response: LoginResponse): void {
    localStorage.setItem(AUTH_TOKEN_KEY, response.tokens.accessToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
  },

  /** Vérifie si une session admin est présente */
  hasSession(): boolean {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },
};
