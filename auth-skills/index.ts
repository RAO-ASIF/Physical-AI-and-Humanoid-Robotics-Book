/**
 * Better Auth Skills - Main Entry Point
 *
 * This file provides a unified interface for all Better Auth authentication skills.
 * It allows for easy registration and usage of all authentication-related skills.
 */

export { default as createRegistrationSkill, type RegistrationSkill, type UserRegistrationInput, type UserRegistrationOutput } from './registration/index';
export { default as createLoginSkill, type LoginSkill, type UserLoginInput, type UserLoginOutput } from './login/index';
export { default as createSessionValidationSkill, type SessionValidationSkill, type SessionValidationInput, type SessionValidationOutput } from './session-validation/index';
export { default as createLogoutSkill, type LogoutSkill, type UserLogoutInput, type UserLogoutOutput } from './logout/index';
export { default as createPasswordResetSkill, type PasswordResetSkill, type RequestPasswordResetInput, type ResetPasswordInput, type ChangePasswordInput, type PasswordResetOutput } from './password-reset/index';
export { default as createSessionRefreshSkill, type SessionRefreshSkill, type SessionRefreshInput, type SessionRefreshOutput } from './token-refresh/index';
export { default as createAuthMiddlewareSkill, type AuthMiddlewareSkill, type AuthGuardInput, type AuthGuardOutput } from './middleware/index';

/**
 * Configuration for all authentication skills
 */
export interface AuthSkillsConfig {
  /**
   * Better Auth instance to use for all skills
   */
  auth: import('better-auth').Auth;

  /**
   * Optional user roles function for middleware
   */
  getUserRoles?: (userId: string) => Promise<string[]>;

  /**
   * Optional user permissions function for middleware
   */
  getUserPermissions?: (userId: string) => Promise<string[]>;

  /**
   * Default redirect URL for unauthenticated requests
   */
  defaultRedirectUrl?: string;
}

/**
 * Interface for all authentication skills combined
 */
export interface AuthSkills {
  registration: import('./registration/index').RegistrationSkill;
  login: import('./login/index').LoginSkill;
  sessionValidation: import('./session-validation/index').SessionValidationSkill;
  logout: import('./logout/index').LogoutSkill;
  passwordReset: import('./password-reset/index').PasswordResetSkill;
  sessionRefresh: import('./token-refresh/index').SessionRefreshSkill;
  middleware: import('./middleware/index').AuthMiddlewareSkill;
}

/**
 * Initialize all Better Auth skills with a single configuration
 *
 * @param config - Configuration for all skills
 * @returns Object containing all initialized skills
 */
export function initializeAuthSkills(config: AuthSkillsConfig): AuthSkills {
  return {
    registration: createRegistrationSkill({
      auth: config.auth,
      autoSignIn: true,
      sendVerificationEmail: false
    }),
    login: createLoginSkill({
      auth: config.auth
    }),
    sessionValidation: createSessionValidationSkill({
      auth: config.auth
    }),
    logout: createLogoutSkill({
      auth: config.auth
    }),
    passwordReset: createPasswordResetSkill({
      auth: config.auth
    }),
    sessionRefresh: createSessionRefreshSkill({
      auth: config.auth
    }),
    middleware: createAuthMiddlewareSkill({
      auth: config.auth,
      getUserRoles: config.getUserRoles,
      getUserPermissions: config.getUserPermissions,
      defaultRedirectUrl: config.defaultRedirectUrl
    })
  };
}

export default initializeAuthSkills;