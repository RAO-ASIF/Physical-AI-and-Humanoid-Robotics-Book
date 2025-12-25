/**
 * Better Auth Middleware/Guard Skill
 *
 * A Claude-compatible skill for implementing authentication guards and middleware
 * with Better Auth. This skill provides functions to protect routes and validate
 * authentication in various contexts.
 */

import type { Auth } from "better-auth";
import type { APIContext } from "better-auth/api";

/**
 * Input interface for authentication guard
 */
export interface AuthGuardInput {
  /**
   * Request headers to check for authentication
   */
  headers: Headers;

  /**
   * Whether the session needs to be fresh (created within freshAge)
   * @default false
   */
  requireFreshSession?: boolean;

  /**
   * Optional roles or permissions required for access
   */
  requiredRoles?: string[];

  /**
   * Optional permissions required for access
   */
  requiredPermissions?: string[];

  /**
   * Optional redirect URL if authentication fails
   */
  redirectUrl?: string;
}

/**
 * Output interface for authentication guard result
 */
export interface AuthGuardOutput {
  /**
   * Whether the request is authenticated
   */
  authenticated: boolean;

  /**
   * Whether the session is fresh (if required)
   */
  fresh?: boolean;

  /**
   * Session data if authenticated
   */
  session?: {
    token: string;
    userId: string;
    expiresAt: string;
    createdAt: string;
    ipAddress?: string;
    userAgent?: string;
  };

  /**
   * User data if authenticated
   */
  user?: {
    id: string;
    email: string;
    name: string;
    image?: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };

  /**
   * Access permissions if authenticated
   */
  permissions?: string[];

  /**
   * Access roles if authenticated
   */
  roles?: string[];

  /**
   * Message indicating the result
   */
  message: string;

  /**
   * Error message if authentication failed
   */
  error?: {
    message: string;
    code?: string;
  };

  /**
   * Whether to redirect
   */
  redirect?: boolean;

  /**
   * URL to redirect to if needed
   */
  redirectUrl?: string;
}

/**
 * Configuration options for the auth middleware skill
 */
export interface AuthMiddlewareSkillConfig {
  /**
   * Better Auth instance
   */
  auth: Auth;

  /**
   * Default redirect URL for unauthenticated requests
   */
  defaultRedirectUrl?: string;

  /**
   * Function to determine user roles (optional)
   */
  getUserRoles?: (userId: string) => Promise<string[]>;

  /**
   * Function to determine user permissions (optional)
   */
  getUserPermissions?: (userId: string) => Promise<string[]>;
}

/**
 * Authentication Guard Skill
 *
 * Validates authentication for a request and optionally checks roles/permissions.
 *
 * @param input - Auth guard input data
 * @param config - Skill configuration
 * @returns Authentication result with session/user data or error
 */
export async function authGuard(
  input: AuthGuardInput,
  config: AuthMiddlewareSkillConfig
): Promise<AuthGuardOutput> {
  try {
    // Validate input
    if (!input.headers) {
      return {
        authenticated: false,
        message: "Request headers are required for authentication",
        error: {
          message: "Request headers are required",
          code: "MISSING_HEADERS"
        },
        redirect: !!input.redirectUrl,
        redirectUrl: input.redirectUrl
      };
    }

    // Call Better Auth session validation API
    const result = await config.auth.api.getSession({
      headers: input.headers,
      asResponse: false
    });

    // Check if session is valid
    if (!result || !result.session || !result.user) {
      return {
        authenticated: false,
        message: "Authentication required",
        error: {
          message: "User is not authenticated",
          code: "UNAUTHENTICATED"
        },
        redirect: !!input.redirectUrl,
        redirectUrl: input.redirectUrl
      };
    }

    // Check if session needs to be fresh
    if (input.requireFreshSession) {
      const freshAge = config.auth.options.session?.freshAge || 86400; // Default 1 day in seconds
      const sessionAge = (Date.now() - result.session.createdAt.getTime()) / 1000; // in seconds

      if (freshAge > 0 && sessionAge > freshAge) {
        return {
          authenticated: false,
          message: "Session is not fresh, re-authentication required",
          error: {
            message: "Session is not fresh enough",
            code: "SESSION_NOT_FRESH"
          },
          redirect: !!input.redirectUrl,
          redirectUrl: input.redirectUrl
        };
      }
    }

    // Get user roles and permissions if functions are provided
    let roles: string[] = [];
    let permissions: string[] = [];

    if (config.getUserRoles) {
      roles = await config.getUserRoles(result.user.id);
    }

    if (config.getUserPermissions) {
      permissions = await config.getUserPermissions(result.user.id);
    }

    // Check required roles if specified
    if (input.requiredRoles && input.requiredRoles.length > 0) {
      const hasRequiredRoles = input.requiredRoles.some(role => roles.includes(role));
      if (!hasRequiredRoles) {
        return {
          authenticated: true, // User is authenticated but lacks required roles
          session: {
            token: result.session.token,
            userId: result.session.userId,
            expiresAt: result.session.expiresAt.toISOString(),
            createdAt: result.session.createdAt.toISOString(),
            ipAddress: result.session.ipAddress,
            userAgent: result.session.userAgent
          },
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name || "",
            image: result.user.image || undefined,
            emailVerified: result.user.emailVerified || false,
            createdAt: result.user.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: result.user.updatedAt?.toISOString() || new Date().toISOString()
          },
          roles,
          permissions,
          message: "User authenticated but lacks required roles",
          error: {
            message: "Insufficient role-based access",
            code: "INSUFFICIENT_ROLES"
          }
        };
      }
    }

    // Check required permissions if specified
    if (input.requiredPermissions && input.requiredPermissions.length > 0) {
      const hasRequiredPermissions = input.requiredPermissions.some(perm => permissions.includes(perm));
      if (!hasRequiredPermissions) {
        return {
          authenticated: true, // User is authenticated but lacks required permissions
          session: {
            token: result.session.token,
            userId: result.session.userId,
            expiresAt: result.session.expiresAt.toISOString(),
            createdAt: result.session.createdAt.toISOString(),
            ipAddress: result.session.ipAddress,
            userAgent: result.session.userAgent
          },
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name || "",
            image: result.user.image || undefined,
            emailVerified: result.user.emailVerified || false,
            createdAt: result.user.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: result.user.updatedAt?.toISOString() || new Date().toISOString()
          },
          roles,
          permissions,
          message: "User authenticated but lacks required permissions",
          error: {
            message: "Insufficient permission-based access",
            code: "INSUFFICIENT_PERMISSIONS"
          }
        };
      }
    }

    // Return successful authentication result
    return {
      authenticated: true,
      fresh: input.requireFreshSession ? true : undefined,
      session: {
        token: result.session.token,
        userId: result.session.userId,
        expiresAt: result.session.expiresAt.toISOString(),
        createdAt: result.session.createdAt.toISOString(),
        ipAddress: result.session.ipAddress,
        userAgent: result.session.userAgent
      },
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name || "",
        image: result.user.image || undefined,
        emailVerified: result.user.emailVerified || false,
        createdAt: result.user.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: result.user.updatedAt?.toISOString() || new Date().toISOString()
      },
      roles,
      permissions,
      message: "Authentication successful"
    };
  } catch (error: any) {
    return {
      authenticated: false,
      message: "Authentication check failed",
      error: {
        message: error.message || "Authentication check failed due to an unexpected error",
        code: error.code || "AUTH_CHECK_ERROR"
      },
      redirect: !!input.redirectUrl,
      redirectUrl: input.redirectUrl
    };
  }
}

/**
 * Middleware function creator for use in frameworks
 */
export interface MiddlewareFunction {
  (context: {
    request: Request;
    headers?: Headers;
    url?: URL;
  }): Promise<AuthGuardOutput>;
}

/**
 * Create a middleware function for use in various frameworks
 *
 * @param config - Auth middleware skill configuration
 * @param options - Additional options for the middleware
 * @returns Middleware function
 */
export function createAuthMiddleware(
  config: AuthMiddlewareSkillConfig,
  options?: {
    requireFreshSession?: boolean;
    requiredRoles?: string[];
    requiredPermissions?: string[];
    redirectUrl?: string;
  }
): MiddlewareFunction {
  return async (context) => {
    // Extract headers from context
    let headers = context.headers || context.request.headers;

    // Use the authGuard function with the provided configuration
    return authGuard({
      headers,
      requireFreshSession: options?.requireFreshSession,
      requiredRoles: options?.requiredRoles,
      requiredPermissions: options?.requiredPermissions,
      redirectUrl: options?.redirectUrl
    }, config);
  };
}

/**
 * Role-based access guard
 */
export async function roleGuard(
  input: Omit<AuthGuardInput, 'requiredPermissions'> & { requiredRoles: string[] },
  config: AuthMiddlewareSkillConfig
): Promise<AuthGuardOutput> {
  return authGuard({
    ...input,
    requiredPermissions: undefined // Don't check permissions when using role guard
  }, config);
}

/**
 * Permission-based access guard
 */
export async function permissionGuard(
  input: Omit<AuthGuardInput, 'requiredRoles'> & { requiredPermissions: string[] },
  config: AuthMiddlewareSkillConfig
): Promise<AuthGuardOutput> {
  return authGuard({
    ...input,
    requiredRoles: undefined // Don't check roles when using permission guard
  }, config);
}

/**
 * Skill interface for Claude compatibility
 */
export interface AuthMiddlewareSkill {
  /**
   * Check authentication for a request
   */
  guard: (input: AuthGuardInput) => Promise<AuthGuardOutput>;

  /**
   * Create a middleware function
   */
  createMiddleware: (options?: {
    requireFreshSession?: boolean;
    requiredRoles?: string[];
    requiredPermissions?: string[];
    redirectUrl?: string;
  }) => MiddlewareFunction;

  /**
   * Check role-based access
   */
  roleGuard: (input: Omit<AuthGuardInput, 'requiredPermissions'> & { requiredRoles: string[] }) => Promise<AuthGuardOutput>;

  /**
   * Check permission-based access
   */
  permissionGuard: (input: Omit<AuthGuardInput, 'requiredRoles'> & { requiredPermissions: string[] }) => Promise<AuthGuardOutput>;
}

/**
 * Create an auth middleware skill instance
 *
 * @param config - Auth middleware skill configuration
 * @returns Auth middleware skill interface
 */
export function createAuthMiddlewareSkill(config: AuthMiddlewareSkillConfig): AuthMiddlewareSkill {
  return {
    guard: (input: AuthGuardInput) => authGuard(input, config),
    createMiddleware: (options?: {
      requireFreshSession?: boolean;
      requiredRoles?: string[];
      requiredPermissions?: string[];
      redirectUrl?: string;
    }) => createAuthMiddleware(config, options),
    roleGuard: (input: Omit<AuthGuardInput, 'requiredPermissions'> & { requiredRoles: string[] }) => roleGuard(input, config),
    permissionGuard: (input: Omit<AuthGuardInput, 'requiredRoles'> & { requiredPermissions: string[] }) => permissionGuard(input, config)
  };
}

// Export as default for easy import
export default createAuthMiddlewareSkill;