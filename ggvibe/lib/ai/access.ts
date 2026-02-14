
import "server-only";

/**
 * Checks if a user is approved to access AI features.
 * The list of approved users is stored in the AI_ENABLED_USERS environment variable.
 *
 * @param userId The ID of the user to check.
 * @returns True if the user is approved, false otherwise.
 */
export function isAiEnabled(userId: string): boolean {
  const enabledUsers = (process.env.AI_ENABLED_USERS || "").split(",").filter(Boolean);
  return enabledUsers.includes(userId);
}
