import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import { creaoPlugins } from "./config/vite/creao-plugin.mjs";

// https://vitejs.dev/config/
export default defineConfig({
	// NOTE: Using /QR-App/ because the site is served from ceoamarion.github.io/QR-App/
	// Once hallguardian.com custom domain is set in GitHub Pages settings,
	// change this back to "/" and re-add public/CNAME with "hallguardian.com"
	base: "/QR-App/",
	define: {
		"import.meta.env.TENANT_ID": JSON.stringify(process.env.TENANT_ID || ""),
	},
	plugins: [
		...creaoPlugins(),
		TanStackRouterVite({
			autoCodeSplitting: false, // affects pick-n-edit feature. disabled for now.
		}),
		viteReact({
			jsxRuntime: "automatic",
		}),
		svgr(),
		tailwindcss(),
	],
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
	server: {
		host: "0.0.0.0",
		port: 3000,
		allowedHosts: true, // respond to *any* Host header
		watch: {
			usePolling: true,
			interval: 300, // ms; tune if CPU gets high
		},
	},
	build: {
		chunkSizeWarningLimit: 1500,
	},
});
