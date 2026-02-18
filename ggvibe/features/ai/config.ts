import "server-only";

const REQUIRED_AI_ENV = ["OPENAI_API_KEY"] as const;

export function getAiConfigStatus() {
  const missingEnv = REQUIRED_AI_ENV.filter((key) => !process.env[key]);
  return {
    configured: missingEnv.length === 0,
    missingEnv,
  };
}
