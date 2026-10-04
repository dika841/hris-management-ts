import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [tsconfigPaths({ projects: ["./tsconfig.json"] })],
	test: {
		environment: "node",
		globals: false,
		include: ["src/**/*.{test,spec}.ts", "scripts/**/*.{test,spec}.ts"],
		passWithNoTests: true,
		fileParallelism: false,
		env: {
			NODE_ENV: "test",
			DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/hris",
			REDIS_URL: "redis://localhost:6379",
			BETTER_AUTH_URL: "https://api-hris.randikaa.my.id",
			BETTER_AUTH_SECRET: "placeholder-secret-at-least-32-chars-long!!",
		},
	},
});
