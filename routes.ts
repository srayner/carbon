/**
 * Path prefixes that send a guest to the login page.
 * Everything else (the home page and content pages) is public. /admin is not
 * listed on purpose: its layout answers anyone but an admin with a 404, so
 * the admin area is not revealed to guests or users.
 * @type {string[]}
 */
export const protectedPrefixes = ["/api"];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /settings
 * @type {string[]}
 */
export const authRoutes = ["/auth/login", "/auth/register", "/auth/error"];

/**
 * The prefix for API authentication routes
 * Routes that starts with this prefix are used for API
 * authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/";

/**
 * Where an admin goes after logging in with a password
 * @type {string}
 */
export const ADMIN_LOGIN_REDIRECT = "/admin";
