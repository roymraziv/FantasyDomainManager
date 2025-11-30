// JWT Token Decoder - for extracting roles from access token
// NOTE: This runs client-side for role-based UI rendering only
// Security is enforced server-side via [Authorize] attributes

interface JwtPayload {
  [key: string]: any;
  role?: string | string[];
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string | string[];
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (middle part)
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

export function extractRolesFromToken(token: string): string[] {
  const payload = decodeJwt(token);
  if (!payload) {
    console.log('[JWT] Failed to decode token payload');
    return [];
  }

  console.log('[JWT] Token payload:', payload);

  // Check for role claim in both formats:
  // 1. Short form "role" (standard JWT claim name used by JwtSecurityTokenHandler)
  // 2. Full URI form (for backwards compatibility)
  let roleClaim = payload['role'];
  let claimType = 'role';

  if (!roleClaim) {
    roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    claimType = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
  }

  console.log(`[JWT] Role claim found in '${claimType}':`, roleClaim);

  if (!roleClaim) {
    console.log('[JWT] No role claim found in token (checked both "role" and full URI form)');
    return [];
  }

  // Role can be a single string or array of strings
  if (Array.isArray(roleClaim)) {
    return roleClaim;
  }

  return [roleClaim];
}

export function hasRole(token: string, role: string): boolean {
  const roles = extractRolesFromToken(token);
  return roles.includes(role);
}

export function isAdmin(token: string): boolean {
  return hasRole(token, 'Admin');
}
