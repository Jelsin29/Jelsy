import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  tsconfig: "tsconfig.build.json",
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  outExtension: ({ format }) => ({
    js: format === "esm" ? ".mjs" : ".cjs"
  })
})
