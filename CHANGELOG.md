# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `createEnv()` — main entry point for environment validation
- 10 built-in validators: `string`, `number`, `port`, `url`, `email`, `boolean`, `json`, `enums`, `regex`, `custom`
- Full TypeScript type inference from schema (required vs optional keys, literal unions from `enums`)
- `explain()` method for debugging value provenance (env, default, devDefault)
- `prefix` option for namespaced env vars
- `emptyStringAsUndefined` option (default: `true`)
- Custom reporter support via `reporter` option
- Default table reporter with formatted error output
- `formatReportTable()` utility for custom reporters
- `Object.freeze()` on returned env object (no Proxy)
- `structuredClone`, `JSON.stringify`, spread all work correctly
- `devDefault` option for development-only fallback values
- `transform` option for post-validation value transformation
- Common validator options: `default`, `devDefault`, `optional`, `desc`, `example`, `docs`
- Zero runtime dependencies
- ESM + CJS dual build via tsup
- Tree-shakable (< 1KB for minimal usage)
- Full bundle < 3KB min+gzip
- Benchmark suite (parse, access, bundle-size, comparisons vs envsafe/Zod/Valibot)
