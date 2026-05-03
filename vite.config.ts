// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

/**
 * Dev: frontend port 5015, proxy `/api` → backend (default 5010).
 * - `cloudflare: false` — Lovable’s default Cloudflare build targets Workers, not Vercel.
 * - `nitro()` — TanStack Start on Vercel needs Nitro’s output (see Vercel “TanStack Start” docs).
 *   Without it, `vite build` has no deployable static root → Vercel `404 NOT_FOUND`.
 */
export default defineConfig({
  cloudflare: false,
  plugins: [nitro()],
  vite: {
    server: {
      host: "127.0.0.1",
      port: 5015,
      strictPort: true,
      proxy: {
        "/api": {
          target: "http://127.0.0.1:5010",
          changeOrigin: true,
        },
      },
    },
  },
});
