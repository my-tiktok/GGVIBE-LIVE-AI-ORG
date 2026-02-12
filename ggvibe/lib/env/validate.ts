const RUNTIME_REQUIREMENTS = [
  { name: "NEXT_PUBLIC_FIREBASE_API_KEY", requiredFor: "Firebase Auth" },
  { name: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", requiredFor: "Firebase Auth" },
  { name: "NEXT_PUBLIC_FIREBASE_PROJECT_ID", requiredFor: "Firebase project mapping" },
  { name: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", requiredFor: "Firebase storage" },
  { name: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", requiredFor: "Firebase messaging" },
  { name: "NEXT_PUBLIC_FIREBASE_APP_ID", requiredFor: "Firebase app identity" },
  { name: "SESSION_SECRET", requiredFor: "server-issued auth cookie signing" },
] as const;

export function validateRuntimeEnv(): string[] {
  return RUNTIME_REQUIREMENTS
    .filter(({ name }) => !process.env[name])
    .map(({ name }) => name);
}
