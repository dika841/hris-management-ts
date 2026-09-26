import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { THEME, THEME_STORAGE_KEY } from "./src/libs/theme/theme.ts";

const API_URL = process.env.VITE_API_URL ?? "http://localhost:3001";

const THEME_PLACEHOLDER = {
	STORAGE_KEY: "__THEME_STORAGE_KEY__",
	LIGHT: "__THEME_LIGHT__",
} as const;

const themeScriptPlugin = (): Plugin => ({
	name: "theme-script-constants",
	transformIndexHtml: (html: string): string =>
		html
			.replaceAll(THEME_PLACEHOLDER.STORAGE_KEY, THEME_STORAGE_KEY)
			.replaceAll(THEME_PLACEHOLDER.LIGHT, THEME.LIGHT),
});

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	plugins: [
		tailwindcss(),
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
			routesDirectory: "./src/routes",
			generatedRouteTree: "./src/routeTree.gen.ts",
			routeFileIgnorePattern:
				"^(_apis|_components|_data|_hooks|_constants|_stores|_utils)",
		}),
		viteReact(),
		themeScriptPlugin(),
	],
	server: {
		host: true, // Listen on 0.0.0.0 so localhost & remote inspection work seamlessly
		port: 5173,
		watch: {
			ignored: ["**/coverage/**"],
		},
		proxy: {
			"/api": { target: API_URL, changeOrigin: true },
			"/rpc": { target: API_URL, changeOrigin: true },
		},
	},
});
