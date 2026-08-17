// Shared utility — imported by LevelPage without pulling in Monaco.
export function hintXpMultiplier(hintsUsed: number): number {
  return 1 - 0.1 * Math.max(0, hintsUsed - 1)
}
