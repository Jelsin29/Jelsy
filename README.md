# Jelsy

The modern, type-safe environment variable validator for TypeScript.

[![CI](https://github.com/Jelsin29/Jelsy/actions/workflows/ci.yml/badge.svg)](https://github.com/Jelsin29/Jelsy/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/jelsy)](https://www.npmjs.com/package/jelsy)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/jelsy)](https://bundlephobia.com/package/jelsy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Zero dependencies. ESM-first. Tree-shakable. < 3KB min+gzip.**

Jelsy validates your environment variables at startup and gives you a fully typed, frozen object. No Proxy bugs. No runtime surprises. Just a plain `Object.freeze()` result that works everywhere — `structuredClone`, `JSON.stringify`, spread, you name it.

## Why Jelsy?

| Feature                | Jelsy       | envsafe     | envalid     | t3-env      |
| ---------------------- | ----------- | ----------- | ----------- | ----------- |
| `structuredClone(env)` | **Works**   | Throws      | Throws      | N/A         |
| `JSON.stringify(env)`  | **Correct** | `"{}"`      | Partial     | N/A         |
| `{ ...env }`           | **Works**   | Loses props | Loses props | N/A         |
| Bundle size            | **< 3KB**   | ~4KB        | ~6KB        | ~15KB+      |
| Dependencies           | **0**       | 0           | 0           | Zod/Valibot |
| Tree-shakable          | **Yes**     | No          | No          | Partial     |
| `explain()`            | **Yes**     | No          | No          | No          |

## Install

```bash
npm install jelsy
```

## Quick Start

```typescript
import {
  createEnv,
  string,
  number,
  port,
  url,
  email,
  boolean,
  enums
} from "jelsy"

const env = createEnv({
  DATABASE_URL: url(),
  PORT: port({ default: 3000 }),
  NODE_ENV: enums({
    values: ["development", "staging", "production"] as const
  }),
  DEBUG: boolean({ default: false }),
  ADMIN_EMAIL: email(),
  API_KEY: string(),
  MAX_RETRIES: number({ default: 3, integer: true })
})

// Fully typed:
env.PORT // number
env.NODE_ENV // 'development' | 'staging' | 'production'
env.DEBUG // boolean
env.DATABASE_URL // string (validated URL)
env.MISSING // TS error: Property 'MISSING' does not exist
```

## Validators

### `string(options?)`

```typescript
API_KEY: string() // required, non-empty
APP_NAME: string({ default: "myapp" }) // with default
REGION: string({ choices: ["us", "eu"] as const }) // literal union: 'us' | 'eu'
BIO: string({ minLength: 0, maxLength: 500 }) // allow empty, cap at 500
```

### `number(options?)`

```typescript
MAX_RETRIES: number({ default: 3, integer: true }) // integer only
RATE_LIMIT: number({ min: 0.1, max: 100 }) // float range
```

### `port(options?)`

```typescript
PORT: port({ default: 3000 }) // integer 1-65535
```

### `url(options?)`

```typescript
DATABASE_URL: url() // http/https
REDIS_URL: url({ protocols: ["redis:", "rediss:"] }) // custom protocols
```

### `email(options?)`

```typescript
ADMIN_EMAIL: email()
SUPPORT_EMAIL: email({ default: "help@example.com" })
```

### `boolean(options?)`

Accepts (case-insensitive): `true/false`, `1/0`, `yes/no`, `on/off`

```typescript
DEBUG: boolean({ default: false })
```

### `json<T>(options?)`

```typescript
FEATURE_FLAGS: json<{ darkMode: boolean }>()
ALLOWED_IPS: json<string[]>({ default: [] })
```

### `enums(options)`

```typescript
NODE_ENV: enums({ values: ["development", "staging", "production"] as const })
// Type: 'development' | 'staging' | 'production'
```

### `regex(options)`

```typescript
AWS_REGION: regex({ pattern: /^[a-z]{2}-[a-z]+-\d$/, example: "us-east-1" })
```

### `custom<T>(options)`

```typescript
ALLOWED_ORIGINS: custom({
  parser: (value) => value.split(",").map((s) => s.trim()),
  desc: "Comma-separated CORS origins"
})
// Type: string[]
```

## Common Options

All validators share these options:

```typescript
{
  default?: T;          // Fallback value (makes key optional in the type)
  devDefault?: T;       // Fallback only when NODE_ENV !== 'production'
  optional?: boolean;   // Explicitly optional (T | undefined)
  desc?: string;        // Human-readable description (shown in errors + explain())
  example?: string;     // Example value (shown in errors)
  docs?: string;        // URL to documentation
  transform?: (v: T) => T;  // Post-validation transform
}
```

## Options

```typescript
const env = createEnv(schema, {
  env: process.env, // Custom env source (default: process.env)
  reporter: customReporter, // Custom error reporter
  prefix: "MYAPP_", // Read MYAPP_PORT instead of PORT
  emptyStringAsUndefined: true // Treat '' as missing (default: true)
})
```

### Prefix

```typescript
const env = createEnv(
  {
    PORT: port({ default: 3000 }),
    DATABASE_URL: url()
  },
  {
    prefix: "MYAPP_"
  }
)
// Reads MYAPP_PORT and MYAPP_DATABASE_URL from process.env
// Access via env.PORT and env.DATABASE_URL
```

## Error Reporting

When validation fails, Jelsy shows a formatted error table:

```
========================================================================
  jelsy: Invalid Environment
========================================================================

 Variable      Error              Received    Description
 -----------   ----------------   ---------   --------------------------
 DATABASE_URL  Missing required   -           Database connection string
 PORT          Invalid port       "abc"       Server port (1-65535)

========================================================================
  1 missing, 1 invalid. Exiting.
========================================================================
```

### Custom Reporter

```typescript
import { createEnv, string, port } from "jelsy"

const env = createEnv(
  {
    PORT: port(),
    API_KEY: string()
  },
  {
    reporter: ({ errors }) => {
      // Send to Sentry, PagerDuty, etc.
      console.error(`Missing/invalid: ${Object.keys(errors).join(", ")}`)
    }
  }
)
```

## `explain()` — Debug Provenance

```typescript
const env = createEnv({
  PORT: port({ default: 3000 }),
  DATABASE_URL: url(),
  DEBUG: boolean({ devDefault: true, default: false })
})

console.table(env.explain())
```

Output:

```
 key           value                     source       type     desc
 -----------   -----------------------   ----------   ------   ----
 PORT          3000                      default      port
 DATABASE_URL  postgres://localhost/db    env          url
 DEBUG         true                      devDefault   boolean
```

No other env validation library has this. When a deployment fails because `DATABASE_URL` is coming from a default instead of the actual environment, `explain()` tells you in one call.

## Browser / Vite / Webpack

```typescript
import { createEnv, url, string } from "jelsy"

export const env = createEnv(
  {
    VITE_API_URL: url(),
    VITE_APP_NAME: string({ default: "MyApp" })
  },
  {
    env: import.meta.env as Record<string, string | undefined>
  }
)
```

## Testing

```typescript
import { createEnv, port, url } from "jelsy"

test("uses default port", () => {
  const env = createEnv(
    {
      PORT: port({ default: 3000 }),
      DATABASE_URL: url()
    },
    {
      env: { DATABASE_URL: "https://localhost:5432/test" }
    }
  )
  expect(env.PORT).toBe(3000)
})
```

## Serialization

Unlike Proxy-based libraries, Jelsy's `Object.freeze()` approach works with every serialization method:

```typescript
const env = createEnv({ PORT: port({ default: 3000 }) });

structuredClone(env);   // { PORT: 3000 } — works
JSON.stringify(env);    // '{"PORT":3000}' — correct
{ ...env };             // { PORT: 3000 } — works
Object.keys(env);       // ['PORT'] — correct
Object.entries(env);    // [['PORT', 3000]] — correct
```

## Type Inference

Jelsy infers the correct TypeScript types from your schema:

```typescript
const env = createEnv({
  PORT: port({ default: 3000 }), // number (has default → always present)
  HOST: string(), // string (required)
  DEBUG: boolean({ optional: true }), // boolean | undefined
  NODE_ENV: enums({ values: ["dev", "prod"] as const }) // 'dev' | 'prod'
})

// Inferred type:
// {
//   readonly PORT: number;
//   readonly HOST: string;
//   readonly DEBUG?: boolean | undefined;
//   readonly NODE_ENV: 'dev' | 'prod';
// }
```

## License

MIT
