/**
 * Legacy auth helper module retained for compatibility.
 * Auth flows are handled by NextAuth handlers in /api/auth/[...nextauth].
 */

export function getAuthorizationUrl() {
  throw new Error('Legacy OIDC auth helper is not supported. Use NextAuth /api/auth/signin routes.');
}
