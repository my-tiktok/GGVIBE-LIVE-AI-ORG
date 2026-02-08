type EnvCheck = {
  name: string;
  requiredFor: string;
};

const REQUIRED_ENV: EnvCheck[] = [
  { name: "REPL_ID", requiredFor: "OIDC login" },
  { name: "DATABASE_URL", requiredFor: "database access" },
  { name: "SESSION_SECRET", requiredFor: "session persistence (or NEXTAUTH_SECRET)" },
];

export function validateRuntimeEnv(): string[] {
  const missing = REQUIRED_ENV.filter((entry) => {
    if (entry.name === "SESSION_SECRET") {
      return !process.env.SESSION_SECRET && !process.env.NEXTAUTH_SECRET;
    }
    return !process.env[entry.name];
  }).map((entry) => entry.name);

  if (missing.length > 0) {
    console.error(
      `[env] Missing required variables: ${missing.join(
        ", "
      )}. Configure them for production runtime.`
    );
  }

  return missing;
}
