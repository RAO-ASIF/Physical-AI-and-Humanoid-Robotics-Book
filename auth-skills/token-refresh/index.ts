/**
 * Better Auth Token/Session Refresh Skill
 *
 * A Claude-compatible skill for handling session refresh with Better Auth.
 * This skill wraps Better Auth's session refresh functionality.
 * Note: Better Auth handles session refresh automatically when using cookie caching,
 * but this skill provides explicit refresh capabilities when needed.
 */

import type { Auth } from "better-auth";

/**
 * Input interface for session refresh
 */
export interface SessionRefreshInput {
  /**
   * Session token to refresh
   */
  token: string;

  /**
   * Optional flag to force refresh even if session is still valid
   * @default false
   */
  forceRefresh?: boolean;
}

/**
 * Output interface for session refresh result
 */
export interface SessionRefreshOutput {
  /**
   * Refresh success status
   */
  success: boolean;

  /**
   * Updated session data if refresh was successful
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
   * User data if refresh was successful
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
   * Message indicating the result of the refresh operation
   */
  message: string;

  /**
   * Error message if refresh failed
   */
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Configuration options for the session refresh skill
 */
export interface SessionRefreshSkillConfig {
  /**
   * Better Auth instance
   */
  auth: Auth;
}

/**
 * Session Refresh Skill
 *
 * Refreshes an existing user session with Better Auth.
 * In Better Auth, session refresh happens automatically when:
 * 1. Using cookie caching and the updateAge is reached
 * 2. The session is accessed and needs to be refreshed
 *
 * This skill provides explicit control over the refresh process.
 *
 * @param input - Session refresh input data
 * @param config - Skill configuration
 * @returns Refresh result with updated session/user data or error
 */
export async function refreshSession(
  input: SessionRefreshInput,
  config: SessionRefreshSkillConfig
): Promise<SessionRefreshOutput> {
  try {
    // Validate input
    if (!input.token) {
      return {
        success: false,
        message: "Session token is required for refresh",
        error: {
          message: "Session token is required",
          code: "MISSING_TOKEN"
        }
      };
    }

    // Prepare headers for session validation
    const headers = new Headers();
    headers.append("cookie", `better-auth.session_token=${input.token}`);

    // Call Better Auth session validation API to get current session
    const currentSession = await config.auth.api.getSession({
      headers,
      asResponse: false
    });

    // Check if session is valid
    if (!currentSession || !currentSession.session || !currentSession.user) {
      return {
        success: false,
        message: "Invalid or expired session token",
        error: {
          message: "The session token is invalid or has expired",
          code: "INVALID_SESSION"
        }
      };
    }

    // If forceRefresh is false and session is still fresh enough,
    // we don't need to do anything since Better Auth handles refresh automatically
    if (!input.forceRefresh) {
      // Check if the session needs refresh based on updateAge
      const sessionAge = Date.now() - currentSession.session.createdAt.getTime();
      const updateAge = config.auth.options.session?.updateAge || 86400; // Default 1 day

      if (sessionAge < updateAge * 1000) {
        // Session is still within update age, no need to refresh
        return {
          success: true,
          session: {
            token: currentSession.session.token,
            userId: currentSession.session.userId,
            expiresAt: currentSession.session.expiresAt.toISOString(),
            createdAt: currentSession.session.createdAt.toISOString(),
            ipAddress: currentSession.session.ipAddress,
            userAgent: currentSession.session.userAgent
          },
          user: {
            id: currentSession.user.id,
            email: currentSession.user.email,
            name: currentSession.user.name || "",
            image: currentSession.user.image || undefined,
            emailVerified: currentSession.user.emailVerified || false,
            createdAt: currentSession.user.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: currentSession.user.updatedAt?.toISOString() || new Date().toISOString()
          },
          message: "Session is still fresh, no refresh needed"
        };
      }
    }

    // To refresh the session, we need to get a new session
    // In Better Auth, session refresh happens automatically when accessed
    // We can force refresh by accessing the session again with disableCookieCache
    const refreshedSession = await config.auth.api.getSession({
      headers,
      query: {
        disableCookieCache: true // This forces a database check and refresh
      },
      asResponse: false
    });

    if (!refreshedSession || !refreshedSession.session || !refreshedSession.user) {
      return {
        success: false,
        message: "Failed to refresh session",
        error: {
          message: "Could not refresh the session",
          code: "REFRESH_FAILED"
        }
      };
    }

    // Return refreshed session result
    return {
      success: true,
      session: {
        token: refreshedSession.session.token,
        userId: refreshedSession.session.userId,
        expiresAt: refreshedSession.session.expiresAt.toISOString(),
        createdAt: refreshedSession.session.createdAt.toISOString(),
        ipAddress: refreshedSession.session.ipAddress,
        userAgent: refreshedSession.session.userAgent
      },
      user: {
        id: refreshedSession.user.id,
        email: refreshedSession.user.email,
        name: refreshedSession.user.name || "",
        image: refreshedSession.user.image || undefined,
        emailVerified: refreshedSession.user.emailVerified || false,
        createdAt: refreshedSession.user.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: refreshedSession.user.updatedAt?.toISOString() || new Date().toISOString()
      },
      message: "Session refreshed successfully"
    };
  } catch (error: any) {
    // Handle specific Better Auth errors
    if (error.message?.includes("invalid") || error.message?.includes("expired")) {
      return {
        success: false,
        message: "Invalid or expired session token",
        error: {
          message: "The session token is invalid or has expired",
          code: "INVALID_SESSION"
        }
      };
    }

    return {
      success: false,
      message: "Session refresh failed",
      error: {
        message: error.message || "Session refresh failed due to an unexpected error",
        code: error.code || "REFRESH_ERROR"
      }
    };
  }
}

/**
 * Skill interface for Claude compatibility
 */
export interface SessionRefreshSkill {
  /**
   * Refresh a session
   */
  refresh: (input: SessionRefreshInput) => Promise<SessionRefreshOutput>;
}

/**
 * Create a session refresh skill instance
 *
 * @param config - Session refresh skill configuration
 * @returns Session refresh skill interface
 */
export function createSessionRefreshSkill(config: SessionRefreshSkillConfig): SessionRefreshSkill {
  return {
    refresh: (input: SessionRefreshInput) => refreshSession(input, config)
  };
}

// Export as default for easy import
export default createSessionRefreshSkill;