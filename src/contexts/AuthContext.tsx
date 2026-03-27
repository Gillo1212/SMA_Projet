/**
 * AuthContext
 * ────────────
 * Fournit l'état d'authentification à toute l'application.
 * Utilise authService pour login/logout/vérification de session.
 *
 * Usage :
 *   const { user, isAuthenticated, login, logout } = useAuthContext();
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { authService } from '../services/auth.service';
import type { AuthUser, LoginCredentials } from '../types/models';

// ── Types ──────────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** Utilisateur connecté, null si non connecté */
  user: AuthUser | null;
  /** true pendant le chargement initial */
  isLoading: boolean;
  /** true si un token valide est présent */
  isAuthenticated: boolean;
  /** Erreur de connexion */
  loginError: string | null;
  /** Connexion → stocke le token + redirige */
  login: (credentials: LoginCredentials) => Promise<boolean>;
  /** Déconnexion → vide le token + redirige */
  logout: () => Promise<void>;
  /** Efface l'erreur de login */
  clearLoginError: () => void;
}

// ── Contexte ───────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Vérification de session au démarrage
  useEffect(() => {
    async function checkSession() {
      try {
        if (authService.hasSession()) {
          const me = await authService.getMe();
          setUser(me);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      setLoginError(null);
      try {
        const response = await authService.login(credentials);
        authService.persistSession(response);
        setUser(response.user);
        return true;
      } catch (err) {
        setLoginError(err instanceof Error ? err.message : 'Erreur de connexion.');
        return false;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const clearLoginError = useCallback(() => setLoginError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        loginError,
        login,
        logout,
        clearLoginError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext doit être utilisé dans <AuthProvider>');
  }
  return ctx;
}
