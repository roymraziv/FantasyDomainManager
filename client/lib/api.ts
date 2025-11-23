import {
  Domain,
  Hero,
  Enterprise,
  Troop,
  CreateDomainDto,
  CreateHeroDto,
  CreateEnterpriseDto,
  CreateTroopDto,
  User,
  LoginDto,
  RegisterDto,
} from '@/types/models';

const API_BASE_URL = 'http://localhost:5223/api';

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

// Helper function for fetch requests
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ========== DOMAIN API ==========

export const domainApi = {
  getAll: () => fetchApi<Domain[]>('/Read/domains'),

  getById: (id: string) => fetchApi<Domain>(`/Read/domains/${id}`),

  create: (domain: CreateDomainDto) =>
    fetchApi<Domain>('/Write/domains', {
      method: 'POST',
      body: JSON.stringify(domain),
    }),

  update: (id: string, domain: Partial<Domain>) =>
    fetchApi<Domain>(`/Write/domains/${id}`, {
      method: 'PUT',
      body: JSON.stringify(domain),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/Write/domains/${id}`, {
      method: 'DELETE',
    }),

  calculateFinancials: (id: string, months: number) =>
    fetchApi<any>(`/Read/domains/${id}/calculate-financials`, {
      method: 'POST',
      body: JSON.stringify({ months }),
    }),
};

// ========== HERO API ==========

export const heroApi = {
  getAll: () => fetchApi<Hero[]>('/Read/heroes'),

  getById: (id: string) => fetchApi<Hero>(`/Read/heroes/${id}`),

  getByDomainId: (domainId: string) => fetchApi<Hero[]>(`/Read/domains/${domainId}/heroes`),

  create: (hero: CreateHeroDto) =>
    fetchApi<Hero>('/Write/heroes', {
      method: 'POST',
      body: JSON.stringify(hero),
    }),

  update: (id: string, hero: Partial<Hero>) =>
    fetchApi<Hero>(`/Write/heroes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(hero),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/Write/heroes/${id}`, {
      method: 'DELETE',
    }),
};

// ========== ENTERPRISE API ==========

export const enterpriseApi = {
  getAll: () => fetchApi<Enterprise[]>('/Read/enterprises'),

  getById: (id: string) => fetchApi<Enterprise>(`/Read/enterprises/${id}`),

  getByDomainId: (domainId: string) =>
    fetchApi<Enterprise[]>(`/Read/domains/${domainId}/enterprises`),

  create: (enterprise: CreateEnterpriseDto) =>
    fetchApi<Enterprise>('/Write/enterprises', {
      method: 'POST',
      body: JSON.stringify(enterprise),
    }),

  update: (id: string, enterprise: Partial<Enterprise>) =>
    fetchApi<Enterprise>(`/Write/enterprises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(enterprise),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/Write/enterprises/${id}`, {
      method: 'DELETE',
    }),
};

// ========== TROOP API ==========

export const troopApi = {
  getAll: () => fetchApi<Troop[]>('/Read/troops'),

  getById: (id: string) => fetchApi<Troop>(`/Read/troops/${id}`),

  getByDomainId: (domainId: string) =>
    fetchApi<Troop[]>(`/Read/domains/${domainId}/troops`),

  create: (troop: CreateTroopDto) =>
    fetchApi<Troop>('/Write/troops', {
      method: 'POST',
      body: JSON.stringify(troop),
    }),

  update: (id: string, troop: Partial<Troop>) =>
    fetchApi<Troop>(`/Write/troops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(troop),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/Write/troops/${id}`, {
      method: 'DELETE',
    }),
};

// ========== AUTHENTICATION API ==========

export const authApi = {
  login: (data: LoginDto) =>
    fetchApi<User>('/account/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: RegisterDto) =>
    fetchApi<User>('/account/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Helper to store token in localStorage
  storeToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },

  // Helper to remove token from localStorage
  clearToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },

  // Helper to check if user is authenticated
  isAuthenticated: () => {
    return getAuthToken() !== null;
  },
};
