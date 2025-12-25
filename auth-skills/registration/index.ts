/**
 * Better Auth User Registration Skill
 *
 * A Claude-compatible skill for handling user registration with Better Auth.
 * This skill wraps Better Auth's email/password registration functionality.
 */

import type { BetterAuthOptions, Auth } from "better-auth";
import type { APIContext } from "better-auth/api";

/**
 * Input interface for user registration
 */
export interface UserRegistrationInput {
  /**
   * User's email address
   */
  email: string;

  /**
   * User's password (min 8 chars, max 128 chars by default)
   */
  password: string;

  /**
   * User's display name
   */
  name: string;

  /**
   * Optional profile image URL
   */
  image?: string;

  /**
   * Optional callback URL for post-registration redirect
   */
  callbackURL?: string;
}

/**
 * Output interface for user registration result
 */
export interface UserRegistrationOutput {
  /**
   * Registration success status
   */
  success: boolean;

  /**
   * User data if registration was successful
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
   * Session data if autoSignIn is enabled
   */
  session?: {
    token: string;
    userId: string;
    expiresAt: string;
  };

  /**
   * Error message if registration failed
   */
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Configuration options for the registration skill
 */
export interface RegistrationSkillConfig {
  /**
   * Better Auth instance
   */
  auth: Auth;

  /**
   * Whether to auto sign in after registration
   * @default true
   */
  autoSignIn?: boolean;

  /**
   * Whether to send verification email after registration
   * @default false
   */
  sendVerificationEmail?: boolean;
}

/**
 * User Registration Skill
 *
 * Registers a new user with Better Auth using email and password.
 *
 * @param input - Registration input data
 * @param config - Skill configuration
 * @returns Registration result with user/session data or error
 */
export async function registerUser(
  input: UserRegistrationInput,
  config: RegistrationSkillConfig
): Promise<UserRegistrationOutput> {
  try {
    // Validate input
    if (!input.email || !input.password || !input.name) {
      return {
        success: false,
        error: {
          message: "Email, password, and name are required fields",
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

    // Validate password length
    if (input.password.length < 8) {
      return {
        success: false,
        error: {
          message: "Password must be at least 8 characters long",
          code: "WEAK_PASSWORD"
        }
      };
    }

    // Prepare registration data
    const registrationData = {
      email: input.email,
      password: input.password,
      name: input.name,
      ...(input.image && { image: input.image }),
      ...(input.callbackURL && { callbackURL: input.callbackURL })
    };

    // Call Better Auth registration API
    const result = await config.auth.api.signUpEmail({
      body: registrationData,
      asResponse: false // Return data instead of Response object
    });

    // Check if registration was successful
    if (!result || !result.user) {
      return {
        success: false,
        error: {
          message: "Registration failed - user data not returned",
          code: "REGISTRATION_FAILED"
        }
      };
    }

    // Return success result
    return {
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name || input.name,
        image: result.user.image || input.image,
        emailVerified: result.user.emailVerified || false,
        createdAt: result.user.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: result.user.updatedAt?.toISOString() || new Date().toISOString()
      },
      ...(result.session && {
        session: {
          token: result.session.token,
          userId: result.session.userId,
          expiresAt: result.session.expiresAt.toISOString()
        }
      })
    };
  } catch (error: any) {
    // Handle specific Better Auth errors
    if (error.message?.includes("already exists")) {
      return {
        success: false,
        error: {
          message: "A user with this email already exists",
          code: "USER_EXISTS"
        }
      };
    }

    return {
      success: false,
      error: {
        message: error.message || "Registration failed due to an unexpected error",
        code: error.code || "REGISTRATION_ERROR"
      }
    };
  }
}

/**
 * Skill interface for Claude compatibility
 */
export interface RegistrationSkill {
  /**
   * Register a new user
   */
  register: (input: UserRegistrationInput) => Promise<UserRegistrationOutput>;
}

/**
 * Create a registration skill instance
 *
 * @param config - Registration skill configuration
 * @returns Registration skill interface
 */
export function createRegistrationSkill(config: RegistrationSkillConfig): RegistrationSkill {
  return {
    register: (input: UserRegistrationInput) => registerUser(input, config)
  };
}

// Export as default for easy import
export default createRegistrationSkill;