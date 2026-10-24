import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Preloads the two fonts needed for the first screen (body text + handwritten
 * headings) so text doesn't reflow when they arrive late on slow connections.
 */
function preloadCriticalFonts() {
  const critical = [/nunito-latin-wght-normal-[\w-]+\.woff2$/, /caveat-latin-700-normal-[\w-]+\.woff2$/]
  return {
    name: 'preload-critical-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const files = Object.keys(ctx.bundle ?? {}).filter((f) => critical.some((re) => re.test(f)))
        return files.map((file) => ({
          tag: 'link',
          attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: `/${file}` },
          injectTo: 'head',
        }))
      },
    },
  }
}

/**
 * Link-preview metadata. Most chat apps need an absolute image URL, so set
 * VITE_SITE_URL (e.g. https://our-little-universe.vercel.app) in production.
 */
function socialPreview(siteUrl) {
  const base = (siteUrl ?? '').replace(/\/+$/, '')
  return {
    name: 'social-preview',
    transformIndexHtml() {
      const tags = [
        { tag: 'meta', attrs: { property: 'og:image', content: `${base}/og-image.png` } },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
        { tag: 'meta', attrs: { property: 'og:image:alt', content: 'Our Little Universe — a pastel planet with a heart' } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: `${base}/og-image.png` } },
      ]
      if (base) tags.push({ tag: 'meta', attrs: { property: 'og:url', content: `${base}/` } })
      return tags.map((t) => ({ ...t, injectTo: 'head' }))
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [react(), tailwindcss(), preloadCriticalFonts(), socialPreview(env.VITE_SITE_URL)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
