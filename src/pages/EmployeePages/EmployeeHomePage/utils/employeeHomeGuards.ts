/**
 * Pure guards for Employee Home rendering phases (no I/O).
 */
export function isEmployeeHomeUserReady(username: string): boolean {
  return Boolean(username);
}
