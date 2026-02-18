type RuntimeHealth = {
  configuredServices: string[];
  missingEnv: string[];
};

const REQUIRED_ENV = [
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "FIREBASE_SERVICE_ACCOUNT_KEY",
] as const;

const CANONICAL_PRODUCTION_URL = "https://www.ggvibe-chatgpt-ai.org";
const DEV_ALLOWED_URL = "http://localhost:3000";

function validateNextAuthUrl(value: string | undefined): string[] {
  if (!value) {
    return ["NEXTAUTH_URL"];
  }

  if (process.env.NODE_ENV === "production" && value !== CANONICAL_PRODUCTION_URL) {
    return ["NEXTAUTH_URL"]; 
  }

  if (process.env.NODE_ENV !== "production" && value !== CANONICAL_PRODUCTION_URL && value !== DEV_ALLOWED_URL) {
    return ["NEXTAUTH_URL"];
  }

  return [];
}

export function getRuntimeHealth(): RuntimeHealth {
  const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]);
  const urlValidationErrors = validateNextAuthUrl(process.env.NEXTAUTH_URL);

  const combinedMissing = Array.from(new Set([...missingEnv, ...urlValidationErrors])).sort();

  const configuredServices = [
    process.env.GOOGLE_CLIENT_ID && "google-oauth",
    process.env.GOOGLE_CLIENT_SECRET && "google-oauth",
    process.env.NEXTAUTH_SECRET && "nextauth",
    process.env.NEXTAUTH_URL && "app-url",
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY && "firebase-admin",
  ].filter((value): value is string => Boolean(value));

  return {
    configuredServices: Array.from(new Set(configuredServices)).sort(),
    missingEnv: combinedMissing,
  };
}
