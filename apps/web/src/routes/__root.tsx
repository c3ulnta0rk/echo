import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import Navbar from "../components/landing/navbar";
import SmoothScroll from "../components/smooth-scroll";

import appCss from "../styles.css?url";

// Set VITE_SITE_URL in your .env file for canonical URLs and og:url (e.g. https://getecho.app)
const SITE_URL: string = import.meta.env.VITE_SITE_URL ?? "";

const schemaOrg = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Echo",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: ["macOS", "Windows", "Linux"],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description:
        "Echo is a free, private, offline speech-to-text application powered by OpenAI Whisper and Parakeet AI models. Transcribe your voice locally — no data ever leaves your device.",
      downloadUrl: "https://github.com/damien-schneider/Echo/releases/latest",
      license: "https://opensource.org/licenses/MIT",
      applicationSubCategory: "Speech Recognition",
      keywords:
        "speech to text, voice transcription, offline, private, whisper, parakeet, AI dictation, open source",
      featureList: [
        "100% offline processing — no cloud required",
        "OpenAI Whisper model support (100+ languages)",
        "Parakeet V2 and V3 model support",
        "Global keyboard shortcuts and push-to-talk",
        "Automatic text pasting into any application",
        "File transcription (audio and video)",
        "AI post-processing with LLM refinement",
        "Free and open source (MIT license)",
      ],
      softwareHelp: {
        "@type": "CreativeWork",
        url: "https://github.com/damien-schneider/Echo",
      },
    },
    {
      "@type": "Organization",
      name: "Echo",
      logo: "/logo192.png",
      sameAs: ["https://github.com/damien-schneider/Echo"],
    },
  ],
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Echo — Free, Private, Offline Speech-to-Text App",
      },
      {
        name: "description",
        content:
          "Echo is a free, open-source speech-to-text app powered by Whisper AI. Transcribe voice locally on macOS, Windows, and Linux — 100% private, no internet required.",
      },
      {
        name: "keywords",
        content:
          "speech to text, offline dictation, voice transcription, whisper AI, private speech recognition, local transcription, open source dictation, macOS dictation, Windows dictation",
      },
      // OpenGraph meta tags
      {
        property: "og:site_name",
        content: "Echo",
      },
      {
        property: "og:title",
        content: "Echo — Free, Private, Offline Speech-to-Text App",
      },
      {
        property: "og:description",
        content:
          "Free, open-source speech-to-text powered by Whisper AI. 100% offline — your voice never leaves your device. Available for macOS, Windows, and Linux.",
      },
      {
        property: "og:image",
        content: `${SITE_URL}/opengraph-image.png`,
      },
      ...(SITE_URL ? [{ property: "og:url", content: SITE_URL }] : []),
      {
        property: "og:type",
        content: "website",
      },
      // Twitter Card meta tags
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "Echo — Free, Private, Offline Speech-to-Text App",
      },
      {
        name: "twitter:description",
        content:
          "Free, open-source speech-to-text powered by Whisper AI. 100% offline — your voice never leaves your device. Available for macOS, Windows, and Linux.",
      },
      {
        name: "twitter:image",
        content: "/opengraph-image.png",
      },
    ],
    links: [
      ...(SITE_URL ? [{ rel: "canonical", href: SITE_URL }] : []),
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Syne:wght@400;500;600;700;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
});

function JsonLdScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: schemaOrg }}
      type="application/ld+json"
    />
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html className="dark" lang="en">
      <head>
        <JsonLdScript />
        <HeadContent />
      </head>
      <body>
        <SmoothScroll>
          <Navbar />
          {children}
          <TanStackDevtools
            config={{
              position: "bottom-right",
            }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        </SmoothScroll>
        <Scripts />
      </body>
    </html>
  );
}
