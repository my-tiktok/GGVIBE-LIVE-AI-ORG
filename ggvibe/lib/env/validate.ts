type EnvCheck = {
  name: string;
  requiredFor: string;
};

const REQUIRED_ENV: EnvCheck[] = [
    { name: "DATABASE_URL", requiredFor: "database access" },
  { name: "NEXTAUTH_SECRET", requiredFor: "auth/session signing" },
];

export function validateRuntimeEnv(): string[] {
  const missing = REQUIRED_ENV.filter((entry) => !process.env[entry.name]).map((entry) => entry.name);

  if (missing.length > 0) {
    console.error(
      `[env] Missing required variables: ${missing.join(
        ", "
      )}. Configure them for production runtime.`
    );
  }

  return missing;
}
