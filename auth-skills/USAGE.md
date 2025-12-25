# Better Auth Skills - Usage Guide

This guide demonstrates how to use the Claude-compatible Better Auth skills for authentication functionality.

## Installation

```bash
npm install better-auth @claude/better-auth-skills
```

## Basic Setup

First, initialize Better Auth and the skills:

```typescript
import { betterAuth } from "better-auth";
import initializeAuthSkills from "@claude/better-auth-skills";

// Initialize Better Auth
const auth = betterAuth({
  database: {
    // your database config
  },
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.AUTH_SECRET || "your-secret-key",
});

// Initialize all auth skills
const authSkills = initializeAuthSkills({
  auth,
  defaultRedirectUrl: "/login",
  getUserRoles: async (userId: string) => {
    // Return user roles from your database
    return ["user"]; // Example implementation
  },
  getUserPermissions: async (userId: string) => {
    // Return user permissions from your database
    return ["read:profile"]; // Example implementation
  }
});
```

## Using the Registration Skill

```typescript
// Register a new user
const registrationResult = await authSkills.registration.register({
  email: "user@example.com",
  password: "securePassword123",
  name: "John Doe",
  image: "https://example.com/avatar.jpg",
  callbackURL: "/dashboard"
});

if (registrationResult.success) {
  console.log("User registered successfully:", registrationResult.user);
} else {
  console.error("Registration failed:", registrationResult.error);
}
```

## Using the Login Skill

```typescript
// Login a user
const loginResult = await authSkills.login.login({
  email: "user@example.com",
  password: "securePassword123",
  rememberMe: true,
  callbackURL: "/dashboard"
});

if (loginResult.success) {
  console.log("Login successful:", loginResult.user);
  console.log("Session token:", loginResult.session?.token);
} else {
  console.error("Login failed:", loginResult.error);
}
```

## Using the Session Validation Skill

```typescript
// Validate a session
const validationResult = await authSkills.sessionValidation.validate({
  token: "session-token-here",
  disableCookieCache: false
});

if (validationResult.valid) {
  console.log("Session is valid:", validationResult.user);
} else {
  console.error("Session invalid:", validationResult.error);
}
```

## Using the Logout Skill

```typescript
// Logout a user
const logoutResult = await authSkills.logout.logout({
  token: "session-token-here",
  revokeAllSessions: false, // Set to true to logout from all devices
  revokeOtherSessions: false // Set to true to logout from other devices only
});

if (logoutResult.success) {
  console.log("Logout successful:", logoutResult.message);
} else {
  console.error("Logout failed:", logoutResult.error);
}
```

## Using the Password Reset Skill

```typescript
// Request password reset
const resetRequestResult = await authSkills.passwordReset.requestPasswordReset({
  email: "user@example.com",
  redirectTo: "/reset-password"
});

if (resetRequestResult.success) {
  console.log("Password reset email sent:", resetRequestResult.message);
}

// Reset password with token
const resetResult = await authSkills.passwordReset.resetPassword({
  newPassword: "newSecurePassword123",
  token: "reset-token-from-email"
});

if (resetResult.success) {
  console.log("Password reset successful:", resetResult.message);
}

// Change current password
const changeResult = await authSkills.passwordReset.changePassword({
  currentPassword: "oldPassword123",
  newPassword: "newSecurePassword123",
  revokeOtherSessions: true // Revoke other sessions after password change
});

if (changeResult.success) {
  console.log("Password changed successfully:", changeResult.message);
}
```

## Using the Session Refresh Skill

```typescript
// Refresh a session
const refreshResult = await authSkills.sessionRefresh.refresh({
  token: "session-token-here",
  forceRefresh: false // Set to true to force refresh even if session is still valid
});

if (refreshResult.success) {
  console.log("Session refreshed:", refreshResult.session);
} else {
  console.error("Session refresh failed:", refreshResult.error);
}
```

## Using the Auth Middleware Skill

### Basic Authentication Guard

```typescript
// Create an auth guard for a route
const request = new Request("https://example.com/protected", {
  headers: {
    cookie: "better-auth.session_token=your-session-token"
  }
});

const guardResult = await authSkills.middleware.guard({
  headers: request.headers,
  requireFreshSession: true // Require session to be fresh
});

if (guardResult.authenticated) {
  console.log("Access granted to user:", guardResult.user?.email);
} else {
  console.log("Access denied:", guardResult.message);
  // Redirect if needed
  if (guardResult.redirect) {
    // Redirect to login page
  }
}
```

### Role-Based Access Control

```typescript
// Check for specific roles
const roleGuardResult = await authSkills.middleware.roleGuard({
  headers: request.headers,
  requiredRoles: ["admin", "editor"]
});

if (roleGuardResult.authenticated && !roleGuardResult.error) {
  console.log("User has required roles:", roleGuardResult.roles);
} else {
  console.error("Access denied:", roleGuardResult.error?.message);
}
```

### Permission-Based Access Control

```typescript
// Check for specific permissions
const permissionGuardResult = await authSkills.middleware.permissionGuard({
  headers: request.headers,
  requiredPermissions: ["read:users", "write:posts"]
});

if (permissionGuardResult.authenticated && !permissionGuardResult.error) {
  console.log("User has required permissions:", permissionGuardResult.permissions);
} else {
  console.error("Access denied:", permissionGuardResult.error?.message);
}
```

### Creating Middleware Function

```typescript
// Create a reusable middleware function
const requireAuth = authSkills.middleware.createMiddleware({
  requireFreshSession: true,
  redirectUrl: "/login"
});

// Use in your route handler
const routeHandler = async (request: Request) => {
  const result = await requireAuth({ request });

  if (!result.authenticated) {
    return Response.redirect(result.redirectUrl || "/login", 302);
  }

  // Continue with authenticated request
  return new Response("Protected content");
};
```

## Integration with Frameworks

### Next.js Example

```typescript
// pages/api/protected.ts
import { NextApiRequest, NextApiResponse } from 'next';
import initializeAuthSkills from '@claude/better-auth-skills';
import { auth } from '../../lib/auth'; // Your Better Auth instance

const authSkills = initializeAuthSkills({ auth });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Validate session
  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (value) {
      headers.append(key, Array.isArray(value) ? value[0] : value);
    }
  });

  const result = await authSkills.middleware.guard({
    headers,
    requireFreshSession: true
  });

  if (!result.authenticated) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Return protected data
  res.status(200).json({ message: "Protected data", user: result.user });
}
```

### Express.js Example

```typescript
// middleware/auth.js
import initializeAuthSkills from '@claude/better-auth-skills';
import { auth } from '../lib/auth'; // Your Better Auth instance

const authSkills = initializeAuthSkills({ auth });

export const requireAuth = async (req, res, next) => {
  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (value) {
      headers.append(key, value);
    }
  });

  const result = await authSkills.middleware.guard({
    headers,
    requireFreshSession: true
  });

  if (!result.authenticated) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.user = result.user;
  req.session = result.session;
  next();
};

// Usage in route
app.get('/protected', requireAuth, (req, res) => {
  res.json({ message: "Protected route", user: req.user });
});
```

## Error Handling

All skills follow a consistent error handling pattern:

```typescript
try {
  const result = await authSkills.login.login({
    email: "user@example.com",
    password: "password"
  });

  if (result.success) {
    // Handle success
  } else {
    // Handle specific error
    switch (result.error?.code) {
      case "INVALID_CREDENTIALS":
        // Handle invalid credentials
        break;
      case "USER_EXISTS":
        // Handle user already exists
        break;
      default:
        // Handle other errors
        break;
    }
  }
} catch (error) {
  // Handle unexpected errors
  console.error("Unexpected error:", error);
}
```

## Configuration Options

Each skill can be configured separately or through the main initialization:

```typescript
const authSkills = initializeAuthSkills({
  auth, // Your Better Auth instance
  defaultRedirectUrl: "/login",
  getUserRoles: async (userId) => {
    // Custom role lookup logic
    return ["user"];
  },
  getUserPermissions: async (userId) => {
    // Custom permission lookup logic
    return ["read:profile"];
  }
});
```

This approach provides a comprehensive, Claude-compatible skill system for Better Auth that maintains type safety, follows security best practices, and offers flexible integration options for various frameworks.