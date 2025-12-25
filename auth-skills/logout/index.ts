/**
 * Better Auth Logout Skill
 *
 * A Claude-compatible skill for handling user logout with Better Auth.
 * This skill wraps Better Auth's session termination functionality.
 */

import type { Auth } from "better-auth";

/**
 * Input interface for user logout
 */
export interface UserLogoutInput {
  /**
   * Session token to logout (optional if using request headers)
   */
  token?: string;

  /**
   * Optional callback URL for post-logout redirect
   */
  callbackURL?: string;

  /**
   * Whether to revoke all sessions for the user
   * @default false
   */
  revokeAllSessions?: boolean;

  /**
   * Whether to revoke other sessions (all except current)
   * @default false
   */
  revokeOtherSessions?: boolean;
}

/**
 * Output interface for user logout result
 */
export interface UserLogoutOutput {
  /**
   * Logout success status
   */
  success: boolean;

  /**
   * Message indicating the result of the logout operation
   */
  message: string;

  /**
   * Error message if logout failed
   */
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Configuration options for the logout skill
 */
export interface LogoutSkillConfig {
  /**
   * Better Auth instance
   */
  auth: Auth;
}

/**
 * User Logout Skill
 *
 * Logs out a user and terminates their session(s) with Better Auth.
 *
 * @param input - Logout input data
 * @param config - Skill configuration
 * @returns Logout result with success status or error
 */
export async function logoutUser(
  input: UserLogoutInput,
  config: LogoutSkillConfig
): Promise<UserLogoutOutput> {
  try {
    // If revoking all sessions for the user
    if (input.revokeAllSessions) {
      // We need to get the current session first to know which user to revoke sessions for
      let currentSession: any = null;

      if (input.token) {
        // If a token is provided, validate it to get the user
        const headers = new Headers();
        headers.append("cookie", `better-auth.session_token=${input.token}`);

        const sessionResult = await config.auth.api.getSession({
          headers,
          asResponse: false
        });

        if (!sessionResult || !sessionResult.session) {
          return {
            success: false,
            message: "Invalid session token",
            error: {
              message: "Unable to identify user for logout",
              code: "INVALID_SESSION"
            }
          };
        }

        currentSession = sessionResult.session;
      } else {
        return {
          success: false,
          message: "Token required to revoke all sessions",
          error: {
            message: "A valid session token is required to revoke all sessions",
            code: "TOKEN_REQUIRED"
          }
        };
      }

      // Revoke all sessions for the user
      await config.auth.api.revokeSessions({
        body: {
          userId: currentSession.userId
        },
        asResponse: false
      });

      return {
        success: true,
        message: "All sessions for the user have been revoked"
      };
    }

    // If revoking other sessions (all except current)
    if (input.revokeOtherSessions) {
      // We need to get the current session first
      let currentSession: any = null;

      if (input.token) {
        const headers = new Headers();
        headers.append("cookie", `better-auth.session_token=${input.token}`);

        const sessionResult = await config.auth.api.getSession({
          headers,
          asResponse: false
        });

        if (!sessionResult || !sessionResult.session) {
          return {
            success: false,
            message: "Invalid session token",
            error: {
              message: "Unable to identify current session for logout",
              code: "INVALID_SESSION"
            }
          };
        }

        currentSession = sessionResult.session;
      } else {
        return {
          success: false,
          message: "Token required to revoke other sessions",
          error: {
            message: "A valid session token is required to revoke other sessions",
            code: "TOKEN_REQUIRED"
          }
        };
      }

      // Revoke other sessions for the user
      await config.auth.api.revokeOtherSessions({
        headers: new Headers(),
        asResponse: false
      });

      return {
        success: true,
        message: "Other sessions for the user have been revoked"
      };
    }

    // Standard logout - just terminate the current session
    if (input.token) {
      // Use the token to create appropriate headers
      const headers = new Headers();
      headers.append("cookie", `better-auth.session_token=${input.token}`);

      // Call Better Auth sign-out API
      await config.auth.api.signOut({
        headers,
        asResponse: false
      });

      return {
        success: true,
        message: "User successfully logged out"
      };
    } else {
      // If no token is provided, we'll need to rely on the request context
      // which is usually handled by the framework's cookie management
      return {
        success: false,
        message: "Session token is required for logout",
        error: {
          message: "A valid session token is required to perform logout",
          code: "TOKEN_REQUIRED"
        }
      };
    }
  } catch (error: any) {
    // Handle specific Better Auth errors
    if (error.message?.includes("invalid") || error.message?.includes("expired")) {
      return {
        success: false,
        message: "Session already expired or invalid",
        error: {
          message: "The session token is invalid or has expired",
          code: "INVALID_SESSION"
        }
      };
    }

    return {
      success: false,
      message: "Logout failed",
      error: {
        message: error.message || "Logout failed due to an unexpected error",
        code: error.code || "LOGOUT_ERROR"
      }
    };
  }
}

/**
 * Skill interface for Claude compatibility
 */
export interface LogoutSkill {
  /**
   * Logout a user
   */
  logout: (input: UserLogoutInput) => Promise<UserLogoutOutput>;
}

/**
 * Create a logout skill instance
 *
 * @param config - Logout skill configuration
 * @returns Logout skill interface
 */
export function createLogoutSkill(config: LogoutSkillConfig): LogoutSkill {
  return {
    logout: (input: UserLogoutInput) => logoutUser(input, config)
  };
}

// Export as default for easy import
export default createLogoutSkill;