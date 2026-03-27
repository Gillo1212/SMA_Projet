/**
 * Client HTTP de base
 * ────────────────────
 * Gère automatiquement :
 *  - L'injection du token JWT (Authorization: Bearer ...)
 *  - La sérialisation JSON
 *  - Les erreurs HTTP (401 → redirect login, etc.)
 */

import { API_URL, AUTH_TOKEN_KEY } from '../config/api';

// ── Types internes ─────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

// ── Utilitaires ────────────────────────────────────────────────────────────

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
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
  // 401 → déconnexion automatique
  if (response.status === 401) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    window.location.href = '/connexion';
    throw new ApiError(401, 'Session expirée');
  }

  const contentType = response.headers.get('Content-Type') ?? '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await response.json() : await response.text();

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
