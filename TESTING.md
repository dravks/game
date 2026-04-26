# Testing Goal

- Every implementation step must be checked before continuing.
- Testing exists to protect working progress and reduce regressions.

## Core Validation Checklist

- Game launches successfully.
- No obvious console or runtime errors appear.
- Controls still work.
- UI still appears correctly.
- Collisions still behave correctly.
- The feature added in the current step works as intended.
- Previously working systems still work.

## Step-Specific Testing

- Each step must include checks for the specific system being worked on.
- Example areas include city navigation, NPC interaction, combat, dungeon flow, progression rewards, and inventory updates.
- Do not rely only on the general checklist when a step introduces system-specific behavior.

## Failure Handling

- If a feature breaks the game, fix the break before adding more.
- If regressions appear, resolve them before continuing.
- Do not stack unfinished broken systems.

## Progress Logging

- Important findings, bugs, fixes, and remaining issues should be recorded in `PROGRESS.md`.

## Testing Philosophy

- Prefer small reliable steps.
- Test immediately after implementation.
- Preserve working behavior.
- Do not assume a feature works without checking.
