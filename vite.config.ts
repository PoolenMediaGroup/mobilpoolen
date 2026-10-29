// Egen Vite-konfiguration. Ersätter @lovable.dev/vite-tanstack-config sedan
// sajten hostas på Cloudflare Workers i stället för hos Lovable.
//
// Bygget: TanStack Start (SSR) + React, Tailwind och Nitro med presetet
// cloudflare-module. Lokalt kan man bygga för Node med
// NITRO_PRESET=node-server bun run build && node .output/server/index.mjs
import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command, mode }) => {
  // Bakar in VITE_*-variabler i bygget (samma beteende som tidigare).
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const define = Object.fromEntries(
    Object.entries(env).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)]),
  );

  return {
    define,
    css: { transformer: "lightningcss" },
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    server: { host: "::", port: 8080 },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        // Serverns startpunkt är src/server.ts (felhantering för SSR).
        server: { entry: "server" },
        importProtection: {
          behavior: "error",
          client: { files: ["**/server/**"], specifiers: ["server-only"] },
        },
      }),
      ...(command === "build"
        ? [
            nitro({
              // Cloudflare Workers. Kan skrivas över med NITRO_PRESET (t.ex. node-server för lokala tester).
              preset: process.env.NITRO_PRESET || "cloudflare-module",
              cloudflare: { nodeCompat: true, deployConfig: true },
            }),
          ]
        : []),
      viteReact(),
    ],
  };
});
