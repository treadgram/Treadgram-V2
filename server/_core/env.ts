export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  /** Email whose AuthKit login is auto-granted the admin role. Set in production. */
  systemAdminEmail: process.env.SYSTEM_ADMIN_EMAIL ?? "",
  workosApiKey: process.env.WORKOS_API_KEY ?? "",
  workosClientId: process.env.WORKOS_CLIENT_ID ?? "",
  /** Absolute URL of the AuthKit callback (e.g. https://treadgram.vercel.app/auth/workos/callback). */
  workosRedirectUri: process.env.WORKOS_REDIRECT_URI ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
