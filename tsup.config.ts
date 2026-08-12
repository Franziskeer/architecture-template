import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    main: "src/main.ts",
    cli: "src/apps/cli/cli.ts",
  },
  format: ["esm"],
  platform: "node",
  target: "node22",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  splitting: false,
  external: [/^node:/],
});
