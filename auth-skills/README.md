# Better Auth Skills for Claude

A collection of Claude-compatible authentication skills built on top of [Better Auth](https://better-auth.com), providing a comprehensive authentication system with email/password, session management, and access control.

## Features

- ✅ **User Registration**: Email and password registration with validation
- ✅ **User Login**: Secure authentication with session management
- ✅ **Session Validation**: Verify and validate active sessions
- ✅ **Logout**: Single or multi-device logout capabilities
- ✅ **Password Reset**: Complete password reset workflow
- ✅ **Session Refresh**: Automatic and manual session refresh
- ✅ **Auth Middleware**: Role and permission-based access control
- ✅ **Type Safety**: Full TypeScript support with proper typing
- ✅ **Security Focused**: Implements security best practices
- ✅ **Framework Agnostic**: Works with any Node.js framework

## Installation

```bash
npm install better-auth @claude/better-auth-skills
```

## Quick Start

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
  defaultRedirectUrl: "/login"
});

// Use the registration skill
const result = await authSkills.registration.register({
  email: "user@example.com",
  password: "securePassword123",
  name: "John Doe"
});

if (result.success) {
  console.log("User registered:", result.user);
}
```

## Available Skills

### 1. Registration Skill
Handle new user registration with email/password.

### 2. Login Skill
Authenticate users with email/password.

### 3. Session Validation Skill
Validate existing user sessions.

### 4. Logout Skill
Handle user logout with various options.

### 5. Password Reset Skill
Complete password reset workflow including request, reset, and change.

### 6. Session Refresh Skill
Refresh user sessions when needed.

### 7. Auth Middleware Skill
Create authentication guards and middleware with role/permission checks.

## Documentation

See the [Usage Guide](./USAGE.md) for detailed examples and integration instructions.

## Architecture

The skills follow Better Auth's architecture while providing Claude-compatible interfaces:

- **Server-side only**: All skills operate on the server for security
- **Type safe**: Full TypeScript support with proper interfaces
- **Error handling**: Consistent error handling patterns
- **Extensible**: Easy to extend with custom logic
- **Secure**: Implements security best practices

## Integration

The skills work with popular frameworks:

- Next.js
- Express.js
- Fastify
- Hono
- And more!

## Security

- Passwords are securely hashed using scrypt (default) or custom algorithms
- Sessions are stored securely with automatic refresh
- CSRF protection through trusted origins
- Rate limiting to prevent abuse
- Secure cookie handling

## License

MIT