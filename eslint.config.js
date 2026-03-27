import eslint from "@eslint/js"
import prettier from "eslint-config-prettier"
import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config(
  {
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: {
        projectService: {
          allowDefaultProject: ["tsup.config.ts", "vitest.config.ts"]
        },
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  prettier,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" }
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "separate-type-imports" }
      ],
      "@typescript-eslint/consistent-type-exports": "error"
    }
  },
  {
    extends: [tseslint.configs.disableTypeChecked],
    files: ["**/*.js"]
  },
  {
    ignores: ["dist/", "coverage/", "node_modules/", "bench/"]
  }
)
