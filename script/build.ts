import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, rename } from "fs/promises";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  process.env.NODE_ENV = "production";
  delete process.env.REPL_ID;

  console.log("building client...");
  await viteBuild({
    configFile: false,
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "..", "client", "src"),
        "@shared": path.resolve(__dirname, "..", "shared"),
        "@assets": path.resolve(__dirname, "..", "attached_assets"),
      },
    },
    root: path.resolve(__dirname, "..", "client"),
    build: {
      outDir: path.resolve(__dirname, "..", "dist/public"),
      emptyOutDir: true,
    },
  });

  console.log("moving index.html out of public dir to bypass CDN cache...");
  await rename(
    path.resolve(__dirname, "..", "dist/public/index.html"),
    path.resolve(__dirname, "..", "dist/index.html")
  );

  console.log("building server...");
  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: [
      "vite",
      "../vite.config",
      "@replit/vite-plugin-runtime-error-modal",
      "@replit/vite-plugin-cartographer",
      "@replit/vite-plugin-dev-banner",
      "resend",
    ],
    logLevel: "info",
  });

}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
