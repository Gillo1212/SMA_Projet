/**
 * ClientAuthContext
 * ──────────────────
 * Auth dédiée à l'espace client (séparé de l'admin)
 * Branché sur POST /auth/client/login  |  GET /auth/me
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { apiClient, ApiError } from '../services/apiClient';
import { mockClient } from '../mocks/clientPortal';
import type { ClientProfile } from '../types/models';
import { formatDate } from '../services/normalize';
import {
  USE_MOCK,
  ENDPOINTS,
  CLIENT_TOKEN_KEY,
  CLIENT_USER_KEY,
} from '../config/api';

/**
 * Le backend renvoie la ligne `clients` telle quelle (first_name, company_name…).
 * Sans cette conversion, les pages liraient des champs `prenom` / `entreprise`
 * inexistants et afficheraient du vide.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeClient(raw: Record<string, any>): ClientProfile {
  return {
    id: String(raw.id ?? ''),
    nom: raw.nom ?? raw.last_name ?? '',
    prenom: raw.prenom ?? raw.first_name ?? '',
    email: raw.email ?? '',
    telephone: raw.telephone ?? raw.phone ?? '',
    entreprise: raw.entreprise ?? raw.company_name ?? '',
    poste: raw.poste ?? raw.job_title ?? '',
    ville: raw.ville ?? raw.city ?? '',
    adresse: raw.adresse ?? raw.address ?? '',
    dateInscription: raw.dateInscription ?? formatDate(raw.created_at),
    avatar: raw.avatar ?? undefined,
  };
}

const MOCK_CLIENT_EMAIL    = 'amadou@sonatel.sn';
const MOCK_CLIENT_PASSWORD = 'client2024';

interface ClientAuthValue {
  client: ClientProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const ClientAuthContext = createContext<ClientAuthValue | null>(null);

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [client, setClient]       = useState<ClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Restaurer la session au démarrage
  useEffect(() => {
    const token = localStorage.getItem(CLIENT_TOKEN_KEY);
    if (token) {
      if (USE_MOCK) {
        const stored = localStorage.getItem(CLIENT_USER_KEY);
        if (stored) setClient(JSON.parse(stored) as ClientProfile);
        setIsLoading(false);
      } else {
        // Vérifier le token côté API
        // Backend retourne { success, user: {...} } - on extrait user
        apiClient
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          // Jeton client explicite : apiClient choisit sinon le jeton selon la page
          .get<Record<string, any>>(ENDPOINTS.AUTH.ME, undefined, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(res => {
            const userData = res.user ?? res;
            setClient(normalizeClient(userData));
          })
          .catch(err => {
            // Seul un 401 signe la fin de la session. Sur une erreur passagère
            // (429, 500, réseau), on garde le jeton et le dernier profil connu.
            if (err instanceof ApiError && err.status === 401) {
              localStorage.removeItem(CLIENT_TOKEN_KEY);
              localStorage.removeItem(CLIENT_USER_KEY);
              return;
            }
            const stored = localStorage.getItem(CLIENT_USER_KEY);
            if (stored) setClient(JSON.parse(stored) as ClientProfile);
          })
          .finally(() => setIsLoading(false));
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setLoginError(null);

      if (USE_MOCK) {
        await new Promise(r => setTimeout(r, 600));
        if (email === MOCK_CLIENT_EMAIL && password === MOCK_CLIENT_PASSWORD) {
          localStorage.setItem(CLIENT_TOKEN_KEY, 'mock_client_token');
          localStorage.setItem(CLIENT_USER_KEY, JSON.stringify(mockClient));
          setClient(mockClient);
          return true;
        }
        setLoginError('Email ou mot de passe incorrect.');
        return false;
      }

      // ── API réelle : POST /auth/client/login ──
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await apiClient.post<Record<string, any>>(
          ENDPOINTS.AUTH.CLIENT_LOGIN,
          { email, password },
        );

        // Backend retourne { success, token, refreshToken, user }
        const token = res.token ?? res.accessToken ?? res.tokens?.accessToken;
        const userData = res.user ?? res;

        const profile = normalizeClient(userData);
        localStorage.setItem(CLIENT_TOKEN_KEY, token);
        // On persiste la forme normalisée : c'est elle que relit la restauration
        localStorage.setItem(CLIENT_USER_KEY, JSON.stringify(profile));
        setClient(profile);
        return true;
      } catch (err) {
        setLoginError(
          err instanceof Error ? err.message : 'Email ou mot de passe incorrect.',
        );
        return false;
      }
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(CLIENT_TOKEN_KEY);
    localStorage.removeItem(CLIENT_USER_KEY);
    setClient(null);
  }, []);

  const clearError = useCallback(() => setLoginError(null), []);

  return (
    <ClientAuthContext.Provider
      value={{ client, isLoading, isAuthenticated: !!client, loginError, login, logout, clearError }}
    >
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth(): ClientAuthValue {
  const ctx = useContext(ClientAuthContext);
  if (!ctx) throw new Error('useClientAuth doit être dans <ClientAuthProvider>');
  return ctx;
}
