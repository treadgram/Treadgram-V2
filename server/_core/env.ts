export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  /** Dedicated identity for the owner system console (stable openId in DB). */
  systemOwnerOpenId: process.env.SYSTEM_OWNER_OPEN_ID ?? "owner_system_console",
  /** Email + password for `/system/login` (owner-only). Set both in production. */
  systemAdminEmail: process.env.SYSTEM_ADMIN_EMAIL ?? "",
  systemAdminPassword: process.env.SYSTEM_ADMIN_PASSWORD ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
