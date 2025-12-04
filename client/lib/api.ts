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
  UserWithRoles,
} from '@/types/models';

// Determine API base URL based on environment
const getApiBaseUrl = (): string => {
  // Debug: Log all relevant environment variables
  console.log('=== API Configuration Debug ===');
  console.log('NEXT_PUBLIC_ENVIRONMENT:', process.env.NEXT_PUBLIC_ENVIRONMENT);
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('All NEXT_PUBLIC_ env vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));
  
  // Use NEXT_PUBLIC_API_URL if set, otherwise fallback to localhost
  // If the URL doesn't end with /api, append it
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5223/api';
  
  // Remove trailing slashes to prevent double slashes
  apiUrl = apiUrl.replace(/\/+$/, '');
  
  // If the URL doesn't already contain /api, append it
  if (!apiUrl.endsWith('/api')) {
    apiUrl = `${apiUrl}/api`;
  }
  
  console.log('Final API_BASE_URL:', apiUrl);
  return apiUrl;
};

const API_BASE_URL = getApiBaseUrl();
console.log('Final API_BASE_URL:', API_BASE_URL);

// Token refresh state management
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

// Refresh access token using refresh token cookie
async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/account/refresh-token`, {
      method: 'POST',
      credentials: 'include', // Important: sends cookies
    });

    if (response.ok) {
      const data = await response.json();
      // Cookies are set automatically by browser
      // Update context with new token expiry
      if ((window as any).__authContext) {
        (window as any).__authContext.updateTokenExpiry(data.tokenExpiry);
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

// Helper function for fetch requests
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  // Remove manual Authorization header - cookies handle authentication now

  try {
    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Always include cookies
    });

    // Handle 401 - attempt token refresh (but not for auth endpoints)
    const isAuthEndpoint = endpoint.includes('/account/login') ||
                          endpoint.includes('/account/register') ||
                          endpoint.includes('/refresh-token');

    if (response.status === 401 && !isAuthEndpoint) {
      if (!isRefreshing) {
        isRefreshing = true;
        const refreshSuccess = await refreshAccessToken();
        isRefreshing = false;

        if (refreshSuccess) {
          onRefreshed('refreshed');
          // Retry original request
          response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
            credentials: 'include',
          });
        } else {
          // Refresh failed - logout user
          if ((window as any).__authContext) {
            (window as any).__authContext.logout();
          }
          throw new Error('Session expired. Please login again.');
        }
      } else {
        // Wait for ongoing refresh to complete
        await new Promise<void>((resolve) => {
          addRefreshSubscriber(() => resolve());
        });
        // Retry original request
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: 'include',
        });
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Request failed'
      }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    throw error;
  }
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

  refreshToken: () =>
    fetchApi<User>('/account/refresh-token', {
      method: 'POST',
    }),

  logout: () =>
    fetchApi<void>('/account/logout', {
      method: 'POST',
    }),
};

// ========== ADMIN API ==========
// All admin endpoints require Admin role - enforced server-side

export const adminApi = {
  // Get all users with their roles
  getUsersWithRoles: () =>
    fetchApi<UserWithRoles[]>('/admin/users-with-roles', {
      method: 'GET',
    }),

  // Edit user roles
  editUserRoles: (userId: string, roles: string[]) =>
    fetchApi<string[]>(`/admin/edit-roles/${userId}?roles=${roles.join(',')}`, {
      method: 'POST',
    }),

  // Delete a user (admin only)
  deleteUser: (userId: string) =>
    fetchApi<void>(`/admin/users/${userId}`, {
      method: 'DELETE',
    }),
};
