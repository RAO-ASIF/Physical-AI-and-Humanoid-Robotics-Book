/**
 * Better Auth Password Reset Skill
 *
 * A Claude-compatible skill for handling password reset with Better Auth.
 * This skill wraps Better Auth's password reset functionality including
 * requesting password reset emails and resetting passwords.
 */

import type { Auth } from "better-auth";

/**
 * Input interface for requesting password reset
 */
export interface RequestPasswordResetInput {
  /**
   * User's email address to send reset link to
   */
  email: string;

  /**
   * Optional redirect URL after reset link is clicked
   */
  redirectTo?: string;
}

/**
 * Input interface for resetting password
 */
export interface ResetPasswordInput {
  /**
   * New password for the user
   */
  newPassword: string;

  /**
   * Password reset token received via email
   */
  token: string;
}

/**
 * Input interface for changing current password
 */
export interface ChangePasswordInput {
  /**
   * User's current password
   */
  currentPassword: string;

  /**
   * New password for the user
   */
  newPassword: string;

  /**
   * Whether to revoke other sessions after password change
   * @default false
   */
  revokeOtherSessions?: boolean;
}

/**
 * Output interface for password reset operations
 */
export interface PasswordResetOutput {
  /**
   * Operation success status
   */
  success: boolean;

  /**
   * Message indicating the result of the operation
   */
  message: string;

  /**
   * Error message if operation failed
   */
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Configuration options for the password reset skill
 */
export interface PasswordResetSkillConfig {
  /**
   * Better Auth instance
   */
  auth: Auth;
}

/**
 * Request Password Reset Skill
 *
 * Requests a password reset email to be sent to the user.
 *
 * @param input - Request password reset input data
 * @param config - Skill configuration
 * @returns Result of the password reset request
 */
export async function requestPasswordReset(
  input: RequestPasswordResetInput,
  config: PasswordResetSkillConfig
): Promise<PasswordResetOutput> {
  try {
    // Validate input
    if (!input.email) {
      return {
        success: false,
        message: "Email is required for password reset request",
        error: {
          message: "Email address is required",
          code: "MISSING_EMAIL"
        }
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      return {
        success: false,
        message: "Invalid email format",
        error: {
          message: "Invalid email format",
          code: "INVALID_EMAIL_FORMAT"
        }
      };
    }

    // Prepare request data
    const requestData = {
      email: input.email,
      ...(input.redirectTo && { redirectTo: input.redirectTo })
    };

    // Call Better Auth password reset request API
    await config.auth.api.requestPasswordReset({
      body: requestData,
      asResponse: false
    });

    return {
      success: true,
      message: "Password reset email sent successfully"
    };
  } catch (error: any) {
    // Handle specific Better Auth errors
    if (error.message?.includes("user not found")) {
      // Note: For security, we don't reveal if the user exists
      return {
        success: true, // Still return success to prevent enumeration attacks
        message: "If the email exists, a password reset link has been sent"
      };
    }

    return {
      success: false,
      message: "Failed to send password reset email",
      error: {
        message: error.message || "Password reset request failed due to an unexpected error",
        code: error.code || "PASSWORD_RESET_REQUEST_ERROR"
      }
    };
  }
}

/**
 * Reset Password Skill
 *
 * Resets the user's password using a token from the password reset email.
 *
 * @param input - Reset password input data
 * @param config - Skill configuration
 * @returns Result of the password reset operation
 */
export async function resetPassword(
  input: ResetPasswordInput,
  config: PasswordResetSkillConfig
): Promise<PasswordResetOutput> {
  try {
    // Validate input
    if (!input.token) {
      return {
        success: false,
        message: "Password reset token is required",
        error: {
          message: "Password reset token is required",
          code: "MISSING_TOKEN"
        }
      };
    }

    if (!input.newPassword) {
      return {
        success: false,
        message: "New password is required",
        error: {
          message: "New password is required",
          code: "MISSING_PASSWORD"
        }
      };
    }

    // Validate password length
    if (input.newPassword.length < 8) {
      return {
        success: false,
        message: "New password must be at least 8 characters long",
        error: {
          message: "New password must be at least 8 characters long",
          code: "WEAK_PASSWORD"
        }
      };
    }

    // Prepare reset data
    const resetData = {
      newPassword: input.newPassword,
      token: input.token
    };

    // Call Better Auth password reset API
    await config.auth.api.resetPassword({
      body: resetData,
      asResponse: false
    });

    return {
      success: true,
      message: "Password has been reset successfully"
    };
  } catch (error: any) {
    // Handle specific Better Auth errors
    if (error.message?.includes("invalid") || error.message?.includes("expired")) {
      return {
        success: false,
        message: "Invalid or expired password reset token",
        error: {
          message: "The password reset token is invalid or has expired",
          code: "INVALID_TOKEN"
        }
      };
    }

    return {
      success: false,
      message: "Failed to reset password",
      error: {
        message: error.message || "Password reset failed due to an unexpected error",
        code: error.code || "PASSWORD_RESET_ERROR"
      }
    };
  }
}

/**
 * Change Password Skill
 *
 * Changes the user's current password after verifying the current password.
 *
 * @param input - Change password input data
 * @param config - Skill configuration
 * @returns Result of the password change operation
 */
export async function changePassword(
  input: ChangePasswordInput,
  config: PasswordResetSkillConfig
): Promise<PasswordResetOutput> {
  try {
    // Validate input
    if (!input.currentPassword) {
      return {
        success: false,
        message: "Current password is required",
        error: {
          message: "Current password is required",
          code: "MISSING_CURRENT_PASSWORD"
        }
      };
    }

    if (!input.newPassword) {
      return {
        success: false,
        message: "New password is required",
        error: {
          message: "New password is required",
          code: "MISSING_NEW_PASSWORD"
        }
      };
    }

    // Validate password length
    if (input.newPassword.length < 8) {
      return {
        success: false,
        message: "New password must be at least 8 characters long",
        error: {
          message: "New password must be at least 8 characters long",
          code: "WEAK_PASSWORD"
        }
      };
    }

    // Prepare change data
    const changeData = {
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
      ...(input.revokeOtherSessions !== undefined && { revokeOtherSessions: input.revokeOtherSessions })
    };

    // Call Better Auth password change API
    await config.auth.api.changePassword({
      body: changeData,
      asResponse: false
    });

    return {
      success: true,
      message: "Password has been changed successfully"
    };
  } catch (error: any) {
    // Handle specific Better Auth errors
    if (error.message?.includes("invalid") || error.message?.includes("incorrect")) {
      return {
        success: false,
        message: "Current password is incorrect",
        error: {
          message: "The current password provided is incorrect",
          code: "INCORRECT_CURRENT_PASSWORD"
        }
      };
    }

    return {
      success: false,
      message: "Failed to change password",
      error: {
        message: error.message || "Password change failed due to an unexpected error",
        code: error.code || "PASSWORD_CHANGE_ERROR"
      }
    };
  }
}

/**
 * Skill interface for Claude compatibility
 */
export interface PasswordResetSkill {
  /**
   * Request password reset email
   */
  requestPasswordReset: (input: RequestPasswordResetInput) => Promise<PasswordResetOutput>;

  /**
   * Reset password using token
   */
  resetPassword: (input: ResetPasswordInput) => Promise<PasswordResetOutput>;

  /**
   * Change current password
   */
  changePassword: (input: ChangePasswordInput) => Promise<PasswordResetOutput>;
}

/**
 * Create a password reset skill instance
 *
 * @param config - Password reset skill configuration
 * @returns Password reset skill interface
 */
export function createPasswordResetSkill(config: PasswordResetSkillConfig): PasswordResetSkill {
  return {
    requestPasswordReset: (input: RequestPasswordResetInput) => requestPasswordReset(input, config),
    resetPassword: (input: ResetPasswordInput) => resetPassword(input, config),
    changePassword: (input: ChangePasswordInput) => changePassword(input, config)
  };
}

// Export as default for easy import
export default createPasswordResetSkill;