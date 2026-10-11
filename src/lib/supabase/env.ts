/** Validate required configuration without including secret values in errors. */
export function requiredEnv(value: string | undefined, name: string): string {
  if (!value?.trim()) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}
