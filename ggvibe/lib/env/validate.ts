const RUNTIME_REQUIREMENTS = [
  { name: "DATABASE_URL", requiredFor: "database access" },
  { name: "OIDC_CLIENT_ID", requiredFor: "OIDC login" },
  { name: "ISSUER_URL", requiredFor: "OIDC discovery" },
  { name: "OPENAI_API_KEY", requiredFor: "chat completions" },
  { name: "SESSION_SECRET", requiredFor: "session persistence (or NEXTAUTH_SECRET)" },
] as const;

export function validateRuntimeEnv(): string[] {
  return RUNTIME_REQUIREMENTS
    .filter(({ name }) => {
      if (name === "SESSION_SECRET") {
        return !process.env.SESSION_SECRET && !process.env.NEXTAUTH_SECRET;
      }
      return !process.env[name];
    })
    .map(({ name }) => name);
}
