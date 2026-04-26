# Workflow Goal

- Build the project safely, incrementally, and in a verifiable way.
- Keep each step small enough to implement, test, and confirm before moving forward.

## Mandatory Development Process

- Read the current task carefully.
- Read `SKILL.md` first.
- Read other related docs if they exist.
- Inspect the current project files before editing.
- Change only what is needed for the current step.
- Avoid unnecessary rewrites.
- Keep the project runnable after each step.
- Validate the result after changes.
- Summarize what was changed.

## Step Size Rules

- Never implement the whole game in one step.
- Each step should focus on one narrow goal.
- Prefer playable partial results.
- If a requested step is too large, break it into smaller internal substeps.
- Preserve momentum without overbuilding.

## Implementation Rules

- Keep code modular.
- Do not introduce premature abstractions.
- Do not add systems that were not requested in the current step.
- Reuse existing working code when reasonable.
- Do not replace the engine or project structure without explicit instruction.

## Validation Rules

- After each step, check for runtime errors, broken controls, broken UI, and regressions.
- Verify that older working features still work.
- Record important findings in `PROGRESS.md` once it exists.

## Agent Behavior Rules

- Do not drift away from the current milestone.
- Do not invent unnecessary lore, systems, or files.
- Do not over-focus on polish before core functionality works.
- Ask: "what is the smallest correct next step?"
