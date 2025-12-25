/**
 * Better Auth User Login Skill
 *
 * A Claude-compatible skill for handling user authentication with Better Auth.
 * This skill wraps Better Auth's email/password login functionality.
 */

import type { Auth } from "better-auth";

/**
 * Input interface for user login
 */
export interface UserLoginInput {
  /**
   * User's email address
   */
  email: string;

  /**
   * User's password
   */
  password: string;

  /**
   * Whether to remember the user session after browser is closed
   * @default true
   */
  rememberMe?: boolean;

  /**
   * Optional callback URL for post-login redirect
   */
  callbackURL?: string;
}

/**
 * Output interface for user login result
 */
export interface UserLoginOutput {
  /**
   * Login success status
   */
  success: boolean;

  /**
   * Session data if login was successful
   */
  session?: {
    token: string;
    userId: string;
    expiresAt: string;
  };

  /**
   * User data if login was successful
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
   * Error message if login failed
   */
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Configuration options for the login skill
 */
export interface LoginSkillConfig {
  /**
   * Better Auth instance
   */
  auth: Auth;
}

/**
 * User Login Skill
 *
 * Authenticates a user with Better Auth using email and password.
 *
 * @param input - Login input data
 * @param config - Skill configuration
 * @returns Login result with session/user data or error
 */
export async function loginUser(
  input: UserLoginInput,
  config: LoginSkillConfig
): Promise<UserLoginOutput> {
  try {
    // Validate input
    if (!input.email || !input.password) {
      return {
        success: false,
        error: {
          message: "Email and password are required fields",
          code: "MISSING_REQUIRED_FIELDS"
        }
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      return {
        success: false,
        error: {
          message: "Invalid email format",
          code: "INVALID_EMAIL_FORMAT"
        }
      };
    }

    // Prepare login data
    const loginData = {
      email: input.email,
      password: input.password,
      ...(input.rememberMe !== undefined && { rememberMe: input.rememberMe }),
      ...(input.callbackURL && { callbackURL: input.callbackURL })
    };

    // Call Better Auth login API
    const result = await config.auth.api.signInEmail({
      body: loginData,
      asResponse: false // Return data instead of Response object
    });

    // Check if login was successful
    if (!result || !result.session || !result.user) {
      return {
        success: false,
        error: {
          message: "Invalid email or password",
          code: "INVALID_CREDENTIALS"
        }
      };
    }

    // Return success result
    return {
      success: true,
      session: {
        token: result.session.token,
        userId: result.session.userId,
        expiresAt: result.session.expiresAt.toISOString()
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
    if (error.message?.includes("invalid")) {
      return {
        success: false,
        error: {
          message: "Invalid email or password",
          code: "INVALID_CREDENTIALS"
        }
      };
    }

    if (error.message?.includes("not verified") || error.status === 403) {
      return {
        success: false,
        error: {
          message: "Please verify your email address before logging in",
          code: "EMAIL_NOT_VERIFIED"
        }
      };
    }

    return {
      success: false,
      error: {
        message: error.message || "Login failed due to an unexpected error",
        code: error.code || "LOGIN_ERROR"
      }
    };
  }
}

/**
 * Skill interface for Claude compatibility
 */
export interface LoginSkill {
  /**
   * Login a user
   */
  login: (input: UserLoginInput) => Promise<UserLoginOutput>;
}

/**
 * Create a login skill instance
 *
 * @param config - Login skill configuration
 * @returns Login skill interface
 */
export function createLoginSkill(config: LoginSkillConfig): LoginSkill {
  return {
    login: (input: UserLoginInput) => loginUser(input, config)
  };
}

// Export as default for easy import
export default createLoginSkill;