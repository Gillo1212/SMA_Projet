/**
 * Client HTTP de base
 * ────────────────────
 * Gère automatiquement :
 *  - L'injection du token JWT (Authorization: Bearer ...)
 *  - La sérialisation JSON
 *  - Les erreurs HTTP (401 → redirect login, etc.)
 */

import {
  API_URL,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  CLIENT_TOKEN_KEY,
  CLIENT_USER_KEY,
} from '../config/api';

// ── Types internes ─────────────────────────────────────────────────────────

export class ApiError extends Error {
  // Champs déclarés explicitement : les paramètres-propriétés du constructeur
  // ne sont pas autorisés sous `erasableSyntaxOnly`.
  status: number;
  errors?: Record<string, string[]>;

  constructor(
    status: number,
    message: string,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

// ── Utilitaires ────────────────────────────────────────────────────────────

/**
 * Zone de l'application : décide quel jeton accompagne les requêtes.
 * Le portail admin et l'espace client ont chacun leur session ; le reste du
 * site (checkout compris) agit pour le compte du client.
 */
function currentArea(): 'admin' | 'client' {
  const path = window.location.pathname;
  return path.startsWith('/admin') || path === '/connexion' ? 'admin' : 'client';
}

function sessionKeys() {
  return currentArea() === 'admin'
    ? { token: AUTH_TOKEN_KEY, user: AUTH_USER_KEY, login: '/connexion', protectedPrefix: '/admin' }
    : { token: CLIENT_TOKEN_KEY, user: CLIENT_USER_KEY, login: '/espace-client/connexion', protectedPrefix: '/espace-client' };
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem(sessionKeys().token);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildUrl(endpoint: string, params?: Record<string, unknown>): string {
  const base = `${API_URL}${endpoint}`;
  if (!params) return base;

  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');

  return query ? `${base}?${query}` : base;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('Content-Type') ?? '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await response.json() : await response.text();

  // 401 avec une session ouverte : elle a expiré, on la ferme. Sans session
  // (identifiants refusés à la connexion), on laisse remonter le message.
  if (response.status === 401) {
    const keys = sessionKeys();
    if (localStorage.getItem(keys.token)) {
      localStorage.removeItem(keys.token);
      localStorage.removeItem(keys.user);
      const path = window.location.pathname;
      if (path.startsWith(keys.protectedPrefix) && path !== keys.login) {
        window.location.href = keys.login;
      }
      throw new ApiError(401, 'Session expirée');
    }
    throw new ApiError(401, isJson ? (body?.message ?? 'Non autorisé') : 'Non autorisé');
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      isJson ? (body?.message ?? 'Erreur serveur') : 'Erreur serveur',
      isJson ? body?.errors : undefined,
    );
  }

  // Unwrap envelope { success, data } si présente
  if (isJson && typeof body === 'object' && 'data' in body) {
    return body.data as T;
  }
  return body as T;
}

// ── Méthodes HTTP ──────────────────────────────────────────────────────────

async function get<T>(
  endpoint: string,
  params?: Record<string, unknown>,
  options?: RequestOptions,
): Promise<T> {
  const response = await fetch(buildUrl(endpoint, params), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options?.headers,
    },
    signal: options?.signal,
  });
  return handleResponse<T>(response);
}

async function post<T>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options?.headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: options?.signal,
  });
  return handleResponse<T>(response);
}

async function put<T>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options?.headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: options?.signal,
  });
  return handleResponse<T>(response);
}

async function patch<T>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options?.headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: options?.signal,
  });
  return handleResponse<T>(response);
}

async function del<T = void>(
  endpoint: string,
  options?: RequestOptions,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options?.headers,
    },
    signal: options?.signal,
  });
  return handleResponse<T>(response);
}

// ── Export ─────────────────────────────────────────────────────────────────

export const apiClient = { get, post, put, patch, delete: del };
