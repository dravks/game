# Engine Choice

- Phaser is the engine/framework for the first prototype phase.
- The first implementation stage is browser-based.

## Why Phaser for the First Version

- Fast iteration for small gameplay steps.
- Easy browser testing during rapid development.
- Easy Codex-friendly file structure with readable project organization.
- Simple 2D rendering and input handling for early gameplay needs.
- Good fit for a playable vertical slice.
- Lower setup friction for early implementation.

## What This Decision Does Not Mean

- It does not mean the final long-term version must stay browser-only.
- It does not mean multiplayer is being built now.
- It does not mean all future systems must be decided today.

## Technical Direction for Early Builds

- Keep the structure simple.
- Prefer a small readable project.
- Avoid premature complexity.
- Focus on city, movement, UI, NPCs, dungeon flow, enemies, and the progression loop first.

## Engine Change Rule

- Do not switch engines without explicit instruction.
- Build the prototype first before reconsidering long-term migration.
