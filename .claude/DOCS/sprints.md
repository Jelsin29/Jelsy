# Jelsy -- Sprints

This document organizes Jelsy's implementation plan into 4 sprints, each with specific phases, tasks (with checkboxes), and deliverables. The v0.2.0 deferred features list is included at the bottom.

---

## Sprint 1: Foundation

### Phase 1: Project Scaffold + Benchmark Infrastructure

This happens BEFORE any feature code is written. We are not guessing about performance -- we are measuring from commit zero.

- [x] Scaffold project: `package.json`, `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`
- [x] Set up `tinybench` and benchmark harness in `bench/`
- [x] Write `bench/parse.bench.ts`: create 10K env objects with 10 validators each, measure parse time
- [x] Write `bench/access.bench.ts`: 1M property reads on frozen object vs Proxy baseline
- [x] Write `bench/compare-envsafe.bench.ts`: install envsafe (KATT) as a dev dep, run identical schemas through both libraries, output comparison table
- [x] Write `bench/bundle-size.bench.ts`: build, gzip, measure, compare against 3KB threshold
- [x] Write `bench/compare-zod.bench.ts`: install Zod as a dev dep, define identical env schema (10 vars: string, url, port, boolean, enum), measure parse throughput for both. This proves Jelsy beats Zod for env-shaped flat records.
- [x] Write `bench/compare-valibot.bench.ts`: install Valibot as a dev dep, same schema as above. Valibot tree-shakes well, so also measure bundle size of the Valibot-based env validation vs Jelsy.
- [x] Create `bench/baseline.json` with initial thresholds
- [x] Set up CI job that runs benchmarks on every PR and fails if thresholds are exceeded
- [x] Create a stub `createEnv()` that returns `Object.freeze({})` to establish the benchmark baseline

### Phase 2: Core Types + make-validator Factory

- [x] Implement `types.ts` -- all public types (`EnvSchema`, `Validator<T>`, `InferEnv<T>`, `ValidatorOptions<T>`, `CreateEnvOptions`)
- [x] Implement `errors.ts` -- error classes (`JelsyError`, `JelsyAccessError`)
- [x] Implement `make-validator.ts` -- internal factory that handles `default`/`devDefault`/`optional` logic

### Phase 3: First Validators (string, number)

- [x] Implement `string()` validator with full tests
- [x] Implement `number()` validator with full tests
- [x] Run benchmarks -- verify we are within budget

**Deliverable**: Benchmark infrastructure is live. `string()` and `number()` work with `makeValidator`, types compile, benchmarks pass. Every subsequent sprint's work is measured against these baselines.

---

## Sprint 2: Validators

### Phase 1: port, url, email, boolean

- [x] Implement `port()` validator with full tests
- [x] Implement `url()` validator with full tests
- [x] Implement `email()` validator with full tests
- [x] Implement `boolean()` validator with full tests

### Phase 2: json, enums, regex, custom

- [x] Implement `json()` validator with full tests
- [x] Implement `enums()` validator with full tests
- [x] Implement `regex()` validator with full tests
- [x] Implement `custom()` validator with full tests

### Phase 3: Type-level Tests with expect-type

- [x] Verify all validators' type inference with `expect-type`
- [x] Run benchmarks -- verify no regression

**Deliverable**: All 10 validators complete with tests passing and type inference verified.

---

## Sprint 3: Core Engine

### Phase 1: createEnv() Implementation

- [x] Implement `create-env.ts` -- the main `createEnv()` function
- [x] Wire up: schema iteration, validator calls, error collection

### Phase 2: Error Collection + Object.freeze

- [x] Implement `Object.freeze()` on output -- verify with `freeze.test.ts`
- [x] Write integration tests: happy path, all-errors, mixed schemas

### Phase 3: prefix, emptyStringAsUndefined Options

- [x] Implement `prefix` option
- [x] Implement `emptyStringAsUndefined` option
- [x] Write integration tests for prefix stripping and empty string handling
- [x] Run benchmarks -- this is the critical sprint for parse performance

**Deliverable**: `createEnv()` works end-to-end. Core engine is functional with all options.

---

## Sprint 4: Polish and Ship

### Phase 1: Table Reporter + explain()

- [x] Implement `reporter.ts` -- default table reporter
- [x] Handle terminal width detection (fallback to 80 cols)
- [x] Implement custom reporter support
- [x] Implement `explain()` method on the returned object
- [x] Tests for reporter output format
- [x] Tests for explain() output
- [x] Run benchmarks -- verify explain() is within 0.5ms budget

### Phase 2: Serialization Tests (structuredClone, JSON.stringify, spread)

- [x] Write serialization tests: `structuredClone`, `JSON.stringify`, spread
- [x] Write `freeze.test.ts` -- verify Object.freeze behavior, no Proxy
- [x] Verify we beat envsafe on every serialization path

### Phase 3: Benchmarks, README, Publish Prep

- [x] Comprehensive type-level tests with `expect-type`
- [x] Test: optional vs required inference
- [x] Test: enums literal union inference
- [x] Test: custom() return type inference
- [x] Test: default/devDefault affecting optionality
- [x] Edge case tests: empty env, all defaults, browser environment
- [x] Final benchmark run -- generate comparison report vs envsafe
- [x] Write README.md (write it like the package has 2K stars)
- [x] Set up GitHub Actions CI (Node 20, 22; test + lint + benchmarks)
- [ ] Configure `np` or `changeset` for publishing
- [x] Add CHANGELOG.md
- [ ] Publish v0.1.0 to npm
- [ ] Post on Twitter/X, Reddit r/node, r/typescript
- [ ] Include benchmark results in announcement: "X times faster than envsafe, zero Proxy bugs, < 3KB"

**Deliverable**: Beautiful error tables and explain() working. All tests green, types verified, benchmarks documented, README complete. v0.1.0 published to npm.

---

## v0.1.0 (MVP) Ships With

- `createEnv()` with full type inference
- All 10 validators: `string`, `number`, `port`, `url`, `email`, `boolean`, `json`, `enums`, `regex`, `custom`
- `explain()` for debugging
- Default table reporter + custom reporter support
- Prefix support
- `emptyStringAsUndefined` option
- Zero dependencies
- ESM + CJS dual build
- Full test suite
- Serialization tests proving structuredClone/JSON.stringify/spread work
- Benchmark suite with comparison against envsafe (KATT)
- Bundle size < 3KB min+gzip

---

## Deferred to v0.2.0

- `extends` / `merge` for composing multiple schemas (monorepo support)
- `createEnv.lazy()` -- deferred validation (validate on first access, not on creation)
- `watch()` -- react to env changes in long-running processes (HMR dev servers)
- Preset packs: `presets/aws`, `presets/database`, `presets/auth` with common vars pre-defined
- `toJSON()` / `toRedacted()` for safe logging (masks secrets)
- `requiredWhen` conditional requirement (e.g., "required only when NODE_ENV is production")
- Framework adapters: `jelsy/next`, `jelsy/vite` with client/server separation
- `new Function()` JIT compilation for the validator pipeline (flat record shape compiles to a very tight function; requires CSP fallback path)
