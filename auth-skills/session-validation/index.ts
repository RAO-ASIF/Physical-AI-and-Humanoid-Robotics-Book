/**
 * Better Auth Session Validation Skill
 *
 * A Claude-compatible skill for validating existing user sessions with Better Auth.
 * This skill wraps Better Auth's session validation functionality.
 */

import type { Auth } from "better-auth";

/**
 * Input interface for session validation
 */
export interface SessionValidationInput {
  /**
   * Session token to validate
   */
  token: string;

  /**
   * Optional flag to disable cookie cache during validation
   * @default false
   */
  disableCookieCache?: boolean;
}

/**
 * Output interface for session validation result
 */
export interface SessionValidationOutput {
  /**
   * Validation success status
   */
  valid: boolean;

  /**
   * Session data if validation was successful
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
   * User data if validation was successful
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
   * Error message if validation failed
   */
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Configuration options for the session validation skill
 */
export interface SessionValidationSkillConfig {
  /**
   * Better Auth instance
   */
  auth: Auth;
}

/**
 * Session Validation Skill
 *
 * Validates an existing user session with Better Auth.
 *
 * @param input - Session validation input data
 * @param config - Skill configuration
 * @returns Validation result with session/user data or error
 */
export async function validateSession(
  input: SessionValidationInput,
  config: SessionValidationSkillConfig
): Promise<SessionValidationOutput> {
  try {
    // Validate input
    if (!input.token) {
      return {
        valid: false,
        error: {
          message: "Session token is required",
          code: "MISSING_TOKEN"
        }
      };
    }

    // Prepare headers for session validation
    const headers = new Headers();
    headers.append("cookie", `better-auth.session_token=${input.token}`);

    // Prepare query parameters
    const query: Record<string, any> = {};
    if (input.disableCookieCache) {
      query.disableCookieCache = true;
    }

    // Call Better Auth session validation API
    const result = await config.auth.api.getSession({
      headers,
      query,
      asResponse: false // Return data instead of Response object
    });

    // Check if session is valid
    if (!result || !result.session || !result.user) {
      return {
        valid: false,
        error: {
          message: "Invalid or expired session token",
          code: "INVALID_SESSION"
        }
      };
    }

    // Return validation result
    return {
      valid: true,
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
      }
    };
  } catch (error: any) {
    // Handle specific Better Auth errors
    if (error.message?.includes("invalid") || error.message?.includes("expired")) {
      return {
        valid: false,
        error: {
          message: "Invalid or expired session token",
          code: "INVALID_SESSION"
        }
      };
    }

    return {
      valid: false,
      error: {
        message: error.message || "Session validation failed due to an unexpected error",
        code: error.code || "VALIDATION_ERROR"
      }
    };
  }
}

/**
 * Skill interface for Claude compatibility
 */
export interface SessionValidationSkill {
  /**
   * Validate a session
   */
  validate: (input: SessionValidationInput) => Promise<SessionValidationOutput>;
}

/**
 * Create a session validation skill instance
 *
 * @param config - Session validation skill configuration
 * @returns Session validation skill interface
 */
export function createSessionValidationSkill(config: SessionValidationSkillConfig): SessionValidationSkill {
  return {
    validate: (input: SessionValidationInput) => validateSession(input, config)
  };
}

// Export as default for easy import
export default createSessionValidationSkill;