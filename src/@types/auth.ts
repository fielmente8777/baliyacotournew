/** Auth domain types. Mirrors baliye-node controllers/auth.ts responses. */

export type AuthRole = 'user' | 'admin';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  role: AuthRole;
  profileImage?: string;
}

/** Which screen the auth modal is showing. */
export type AuthStep = 'phone' | 'otp';

export interface Country {
  name: string;
  /** ISO 3166-1 alpha-2 — used to build the flag emoji. */
  iso: string;
  /** Includes the leading '+'. */
  dial: string;
}
