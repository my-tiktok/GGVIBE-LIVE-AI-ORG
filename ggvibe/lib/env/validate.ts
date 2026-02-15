type EnvCheck = {
  name: string;
  requiredFor: string;
};

const REQUIRED_ENV: EnvCheck[] = [
  { name: "NEXTAUTH_URL", requiredFor: "auth callback URL" },
  { name: "NEXTAUTH_SECRET", requiredFor: "session signing" },
];

export function validateRuntimeEnv(): string[] {
  const missing = REQUIRED_ENV.filter((entry) => !process.env[entry.name]).map((entry) => entry.name);

  return missing;
}
