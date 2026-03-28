# AGENTS.md

This file gives coding agents repository-specific guidance for `vue-cropperjs`.
Use it when editing code, changing config, or validating work.

## Repository Overview

- Package: `@xcvzmoon/vue-cropperjs`
- Goal: publish a Vue wrapper around CropperJS
- Current state: TypeScript library scaffold with sample source and tests
- Package manager: `pnpm@10.33.0`
- Runtime target: Node `>=18`
- Module system: ESM via `"type": "module"`
- Tooling: `tsdown`, `vitest`, `oxfmt`, `oxlint`

## Important Paths

- Source entry: `packages/src/index.ts`
- Test file example: `packages/src/index.test.ts`
- Build config: `tsdown.config.ts`
- TypeScript config: `tsconfig.json`
- Package manifest: `package.json`
- CI workflow: `.github/workflows/ci.yaml`
- Pre-commit hook: `.husky/pre-commit`

## External Agent Rules

- No prior `AGENTS.md` existed in the repo.
- No Cursor rules were found in `.cursor/rules/`.
- No `.cursorrules` file was found.
- No Copilot instructions were found in `.github/copilot-instructions.md`.
- If any of those files appear later, merge their guidance into this file.

## Setup

- Install deps with `pnpm install`.
- If git hooks need initialization, run `pnpm prepare`.
- Prefer `pnpm install --frozen-lockfile` for CI-like verification.

## Core Commands

- Format: `pnpm fmt`
- Lint: `pnpm lint`
- Test once: `pnpm test`
- Test watch: `pnpm test:watch`
- Build: `pnpm build`
- Full validation: `pnpm fmt && pnpm lint && pnpm test && pnpm build`

## Single-Test Commands

- Run one file: `pnpm vitest run packages/src/index.test.ts`
- Run one test name: `pnpm vitest run packages/src/index.test.ts -t "returns a hello message with the provided name"`
- General pattern: `pnpm vitest run path/to/file.test.ts`
- Prefer `vitest run` in automation.

## CI And Hooks

- CI currently runs install, lint, and build.
- CI does not currently run tests, so do not assume test coverage from CI alone.
- Pre-commit currently runs `pnpm fmt`, `pnpm lint`, and `pnpm test`.
- If you change local commands, keep hooks and CI behavior coherent.

## Build And Publish Notes

- `tsdown` builds from `./packages/src/index.ts`.
- DTS generation is enabled with `dts: true`.
- Output is minified.
- Package entry points target `dist/index.mjs` and `dist/index.d.mts`.
- `typescript` must remain installed for declaration generation.

## TypeScript Rules

- Treat the repo as strict TypeScript.
- Important compiler flags include `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `isolatedModules`, and `verbatimModuleSyntax`.
- `module` is `nodenext`, so local ESM imports must use runtime extensions.
- Example: import sibling modules as `./index.js`, not `./index`.
- Keep emitted ESM compatibility in mind when adding files.

## Import Style

- Let `oxfmt` control import ordering.
- Import groups are: type imports; built-in/external values; internal values; parent/sibling/index values; unknown last.
- `newlinesBetween` groups is disabled, so keep imports compact.
- Prefer `import type` where possible; `consistent-type-imports` is enforced.
- Avoid duplicate imports.
- Use ESM imports only; avoid CommonJS `require`.
- Prefer direct imports over barrel files because `no-barrel-file` is enabled.

## Formatting Style

- Run `pnpm fmt` instead of hand-formatting large edits.
- Use single quotes.
- Do not manually reorder `package.json` keys for style; sorting is disabled.
- Respect ignored paths such as `node_modules`, `dist`, `CHANGELOG.md`, and `.vscode`.
- Keep formatting plain and machine-friendly.
- Avoid decorative comments and alignment padding.

## Naming Conventions

- Use clear descriptive names.
- Use camelCase for variables and functions.
- Use PascalCase for Vue components, classes, and exported component-like types.
- Keep filenames consistent with exports; `filename-case` is enforced.
- Test files should use `.test.ts`.
- Avoid anonymous default exports.

## Types And API Design

- Prefer explicit types at public boundaries.
- Keep unsafe casts to a minimum.
- Avoid non-null assertions.
- Prefer named exports for public API.
- Keep package `exports`, `main`, and `types` aligned with build output.
- Centralize the public library surface in `packages/src/index.ts` unless structure changes intentionally.

## Error Handling

- Throw `Error` objects, not strings.
- Write actionable error messages.
- Prefer early validation over deep failure paths.
- Avoid silent failures.
- Do not use `console.log`; `no-console` is enabled.
- If a recoverable path makes sense, return a typed result instead of throwing broadly.

## Lint-Driven Defaults

- Assume linting is intentionally strict.
- Prefer `const` over `let` when possible.
- Avoid parameter reassignment.
- Avoid nested ternaries and deep control flow.
- Prefer modern ECMAScript APIs when they improve clarity.
- Avoid empty abstractions, unused wrappers, and unsafe flows.
- Do not weaken lint or TS config just to make a change pass.

## Testing Guidelines

- Use Vitest primitives like `describe`, `it`, and `expect`.
- Keep tests deterministic and fast.
- Prefer behavior-based test names.
- Add tests for public API behavior before implementation details.
- For future Vue components, add rendering, props, emits, and integration coverage.

## Future Vue Test Patterns

- When Vue components are introduced, prefer `@vue/test-utils` with Vitest.
- Test user-visible behavior first: rendered DOM, props, emitted events, and exposed methods.
- Keep CropperJS integration tests focused on wrapper behavior rather than third-party internals.
- Stub browser-only APIs only when necessary, and keep those stubs local to the test file.
- Prefer one focused component test file per exported component or composable.
- If the wrapper exposes imperative methods, test them through the public component instance or documented API.

## Package-Specific Guidance

- The repo is intended to become a Vue CropperJS wrapper, but it currently ships scaffold code.
- When adding real wrapper code, make dependency choices explicit.
- `vue` should generally be a peer dependency for a Vue library so consumers do not install a duplicate Vue runtime.
- Prefer a broad Vue 3 peer range such as `^3.0.0` unless the implementation requires newer Vue APIs.
- Keep `vue` in `devDependencies` as well for local typechecking, tests, and examples.
- `cropperjs` should generally be a runtime dependency because the wrapper directly uses it.
- Only make `cropperjs` a peer dependency if consumers must control the exact installed CropperJS version.
- Keep `typescript` in `devDependencies`; it is needed for local builds and DTS generation, not for package consumers.
- Keep README usage docs aligned with the exported API.
- Revisit publish contents before first release; current tarball contents are broader than ideal.

## Safe Workflow For Agents

- Read the relevant config before changing tooling.
- Prefer small, targeted edits.
- Run the narrowest validating command first.
- For source changes, run relevant tests at minimum.
- For config, package, or build changes, run `pnpm lint && pnpm test && pnpm build`.
- Do not assume CI covers everything.
- Avoid changing generated `dist` files unless the workflow explicitly requires it.

## Things To Avoid

- Do not introduce CommonJS patterns.
- Do not omit `.js` in local relative imports under `nodenext`.
- Do not add console logging for normal behavior.
- Do not treat the current sample `greet` API as the intended long-term package design.

## When Unsure

- Prefer consistency with existing config and tests.
- Let formatter and linter define final code shape.
- Optimize for a clean ESM TypeScript library that will evolve into a Vue CropperJS wrapper.
