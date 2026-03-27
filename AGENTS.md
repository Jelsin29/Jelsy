# Jelsy — Code Review Rules

## Project Context

Jelsy is a TypeScript library: zero-dependency, ESM-first, tree-shakable environment variable validator. It uses Object.freeze (NOT Proxy) for immutability.

## Critical Rules (MUST block commit)

- **No Proxy usage** — Object.freeze() ONLY. Any use of `new Proxy` or `Proxy` is a hard reject.
- **No runtime dependencies** — `dependencies` in package.json must be empty.
- **No `function` declarations for exports** — use arrow functions: `export const fn = (...): ReturnType => { }`
- **Explicit return types** on all exported functions.
- **No `type` aliases for object shapes** — use `interface` instead.
- **No `for...of` loops** — use `forEach` for iteration.
- **No `--no-verify`** — pre-commit hooks must never be bypassed.
- **Conventional commits** — format: `type(scope): description`.

## Important Rules (SHOULD block commit)

- Use `interface` for object shapes, `type` for unions/intersections only.
- Use `Set` and `Map` for collections, not arrays with `.includes()`.
- Use spread for immutable updates (`[...arr]`, `{ ...obj }`).
- Use optional chaining (`?.`) for safe access.
- Interfaces and types at the top of files, then state, then functions.
- Tests must use Vitest (`describe`, `it`, `expect`).

## Style Preferences (WARN only)

- Prefer `??` over `||` for nullish coalescing.
- Keep functions small and focused.
- Module-level state with `const` — no classes unless truly necessary.

## Ignore

- Do not flag benchmark files (`bench/`) for code style.
- Do not flag test files for `@typescript-eslint/no-non-null-assertion`.
- Do not flag `.todo` tests as incomplete — they are intentional stubs.
