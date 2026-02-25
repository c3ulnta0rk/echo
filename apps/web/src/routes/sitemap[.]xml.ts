import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

const STATIC_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/blog", changefreq: "weekly", priority: "0.9" },
  {
    path: "/blog/best-offline-speech-to-text-apps-2026",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/blog/how-to-transcribe-audio-without-internet",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/blog/whisper-vs-parakeet-models-compared",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/blog/voice-dictation-privacy-guide",
    changefreq: "monthly",
    priority: "0.8",
  },
  { path: "/vs", changefreq: "monthly", priority: "0.8" },
  { path: "/vs/otter-ai", changefreq: "monthly", priority: "0.8" },
  { path: "/vs/whisper-desktop", changefreq: "monthly", priority: "0.8" },
  { path: "/vs/apple-dictation", changefreq: "monthly", priority: "0.7" },
  { path: "/vs/super-whisper", changefreq: "monthly", priority: "0.8" },
  { path: "/vs/wispr-flow", changefreq: "monthly", priority: "0.8" },
  { path: "/vs/macwhisper", changefreq: "monthly", priority: "0.8" },
  { path: "/vs/dragon", changefreq: "monthly", priority: "0.8" },
  { path: "/vs/buzz", changefreq: "monthly", priority: "0.7" },
  { path: "/vs/handy", changefreq: "monthly", priority: "0.7" },
  { path: "/vs/voiceink", changefreq: "monthly", priority: "0.7" },
  { path: "/faq", changefreq: "monthly", priority: "0.8" },
  { path: "/roadmap", changefreq: "monthly", priority: "0.7" },
  { path: "/contributing", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/license", changefreq: "yearly", priority: "0.3" },
];

function buildSitemap(baseUrl: string): string {
  const urls = STATIC_ROUTES.map(
    (route) => `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  ).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }: { request: Request }) => {
        const { origin } = new URL(request.url);
        const xml = buildSitemap(origin);
        return new Response(xml, {
          headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});

export default json({});
