# Microsoft OAuth Authentication Flow

## Production-Ready Implementation

This document describes the complete OAuth 2.0 authentication flow implementation for the Churchill Application Portal.

## Architecture Overview

### Flow Diagram

```
1. User clicks "Staff Login" button
   ↓
2. Frontend requests auth URL from backend
   GET /auth/microsoft/login?role=staff&redirect_uri=https://domain.com/auth/callback
   ↓
3. Backend returns Microsoft OAuth URL
   ↓
4. User redirects to Microsoft
   ↓
5. User authenticates with Microsoft
   ↓
6. Microsoft redirects to backend callback
   GET /auth/microsoft/callback?code=xxx&state=staff|https://domain.com/auth/callback
   ↓
7. Backend exchanges code for tokens, validates user, creates/updates account
   ↓
8. Backend redirects to frontend callback with tokens in URL
   https://domain.com/auth/callback?access_token=xxx&refresh_token=xxx&user_id=xxx&email=xxx&role=xxx
   ↓
9. Frontend callback page processes tokens
   - Extracts tokens from URL
   - Calls NextAuth signIn with credentials provider
   - Stores session via NextAuth
   ↓
10. User redirected to dashboard
```

## Components

### 1. Frontend Callback Page
**Location:** `/src/app/auth/callback/page.tsx`

**Purpose:** Handles OAuth redirect with tokens from backend

**Features:**
- Extracts tokens from URL parameters
- Validates required parameters
- Parses JWT for user information
- Authenticates with NextAuth
- Proper loading/success/error states
- Auto-redirects on success or error
- Clean URL after processing

### 2. Microsoft OAuth Button
**Location:** `/src/components/auth/microsoft-oauth-button.tsx`

**Purpose:** Initiates OAuth flow

**Features:**
- Triggers backend OAuth initiation
- Redirects to Microsoft login
- Handles OAuth errors
- Loading states and UI feedback

### 3. Middleware
**Location:** `/src/middleware.ts`

**Purpose:** Route protection and authentication checks

**Features:**
- Protects dashboard routes
- Allows public routes (login, register, callback)
- Redirects unauthenticated users to login
- NextAuth JWT token validation

### 4. NextAuth Configuration
**Location:** `/src/lib/auth-options.ts`

**Purpose:** Session management and token handling

**Features:**
- Credentials provider for OAuth tokens
- JWT strategy for session management
- Token refresh logic
- User role and profile management
- Access/refresh token storage

## Backend Integration

### Required Backend Endpoints

#### 1. Initiate OAuth
```
GET /auth/microsoft/login
Query Params:
  - role: string (staff, admin, agent)
  - redirect_uri: string (frontend callback URL)

Response:
{
  "auth_url": "https://login.microsoftonline.com/...",
  "state": "staff|https://domain.com/auth/callback"
}
```

#### 2. Handle OAuth Callback
```
GET /auth/microsoft/callback
Query Params:
  - code: string (from Microsoft)
  - state: string (role|redirect_uri)

Response: HTTP 302 Redirect
Location: https://domain.com/auth/callback?access_token=xxx&refresh_token=xxx&user_id=xxx&email=xxx&role=xxx
```

### Backend Requirements

The backend must:
1. Accept `redirect_uri` parameter in `/auth/microsoft/login`
2. Use `redirect_uri` for the OAuth callback URL sent to Microsoft
3. Parse state to extract role and original redirect_uri
4. Validate user against Microsoft groups
5. Create or update user in database
6. Generate JWT access and refresh tokens
7. Redirect to frontend callback with tokens in URL

## Security Considerations

### Token Handling
- Tokens are passed via URL parameters (OAuth standard)
- Frontend immediately extracts and removes tokens from URL
- Tokens stored securely in NextAuth session (httpOnly cookies)
- JWT tokens have expiration times
- Refresh token mechanism for session renewal

### Route Protection
- Middleware validates authentication on protected routes
- Unauthenticated users redirected to login
- Session validation on every request
- Token refresh automatic when expired

### Error Handling
- OAuth errors displayed to user with clear messages
- Failed authentication redirects to login with error message
- Network errors caught and logged
- Invalid tokens rejected with proper error messages

## Environment Variables

### Frontend (.env.local)
```bash
# NextAuth Configuration
NEXTAUTH_URL=https://application.churchill.edu.au
NEXTAUTH_SECRET=<random-secret-key>

# Backend API
NEXT_PUBLIC_API_BASE_URL=https://api.churchill.edu.au/api/v1
```

### Backend (.env)
```bash
# Microsoft OAuth
MICROSOFT_CLIENT_ID=<your-client-id>
MICROSOFT_CLIENT_SECRET=<your-client-secret>
MICROSOFT_TENANT_ID=<your-tenant-id>
MICROSOFT_REDIRECT_URI=https://api.churchill.edu.au/api/v1/auth/microsoft/callback

# JWT Configuration
JWT_SECRET_KEY=<random-secret-key>
ACCESS_TOKEN_EXPIRE_MINUTES=20
REFRESH_TOKEN_EXPIRE_DAYS=7
```

## Testing

### Local Development

1. Update redirect URIs in Azure AD app registration:
   - http://localhost:8000/api/v1/auth/microsoft/callback
   - http://localhost:3000/auth/callback

2. Set environment variables:
```bash
# Frontend
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Backend
MICROSOFT_REDIRECT_URI=http://localhost:8000/api/v1/auth/microsoft/callback
```

3. Test the flow:
   - Navigate to http://localhost:3000/login
   - Click "Staff Login"
   - Authenticate with Microsoft
   - Verify redirect to dashboard

### Production Testing

1. Verify all URLs use HTTPS
2. Test error scenarios:
   - Invalid credentials
   - Network failures
   - Expired tokens
   - Unauthorized users
3. Monitor logs for errors
4. Verify session persistence across page refreshes

## Troubleshooting

### Common Issues

#### 1. Redirect URI Mismatch
**Error:** "redirect_uri_mismatch" from Microsoft

**Solution:** 
- Verify Azure AD app registration includes exact callback URL
- Ensure backend MICROSOFT_REDIRECT_URI matches what's sent to Microsoft

#### 2. Tokens Not Processing
**Error:** Redirect to login after reaching callback

**Solution:**
- Check browser console for errors
- Verify tokens present in URL on callback page
- Ensure NextAuth credentials provider configured correctly
- Check JWT token format and expiration

#### 3. Session Not Persisting
**Error:** User logged out on page refresh

**Solution:**
- Verify NEXTAUTH_SECRET is set and consistent
- Check browser cookie settings
- Ensure NEXTAUTH_URL matches actual domain
- Verify token expiration settings

#### 4. CORS Errors
**Error:** CORS policy blocking requests

**Solution:**
- Configure backend CORS to allow frontend domain
- Ensure credentials: true in axios config
- Verify allowed origins in backend CORS middleware

## Deployment Checklist

- [ ] Update Azure AD redirect URIs for production
- [ ] Set all environment variables on production servers
- [ ] Enable HTTPS for all URLs
- [ ] Configure CORS properly
- [ ] Test complete OAuth flow in production
- [ ] Monitor logs for errors
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure session timeout appropriately
- [ ] Test token refresh mechanism
- [ ] Verify middleware protection on all routes
- [ ] Test error scenarios in production

## Maintenance

### Token Expiration
- Access tokens: 20 minutes (configurable)
- Refresh tokens: 7 days (configurable)
- Session automatically refreshes when access token expires

### Monitoring
- Log all OAuth errors
- Monitor failed authentication attempts
- Track token refresh failures
- Alert on repeated authentication failures

### Updates
- Keep NextAuth library updated
- Monitor Microsoft Graph API changes
- Review security best practices quarterly
- Update JWT secret keys annually

## References

- [OAuth 2.0 RFC](https://datatracker.ietf.org/doc/html/rfc6749)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
