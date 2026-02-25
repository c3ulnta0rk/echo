import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import Navbar from "../components/landing/navbar";
import SmoothScroll from "../components/smooth-scroll";

import appCss from "../styles.css?url";

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
        title: "Echo - Private, Offline, Fast Speech-to-Text",
      },
      {
        name: "description",
        content:
          "Echo is a private, offline, and fast speech-to-text application. Transcribe your voice locally without sending data to the cloud.",
      },
      // OpenGraph meta tags
      {
        property: "og:title",
        content: "Echo - Private, Offline, Fast Speech-to-Text",
      },
      {
        property: "og:description",
        content:
          "Echo is a private, offline, and fast speech-to-text application. Transcribe your voice locally without sending data to the cloud.",
      },
      {
        property: "og:image",
        content: "/opengraph-image.png",
      },
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
        content: "Echo - Private, Offline, Fast Speech-to-Text",
      },
      {
        name: "twitter:description",
        content:
          "Echo is a private, offline, and fast speech-to-text application. Transcribe your voice locally without sending data to the cloud.",
      },
      {
        name: "twitter:image",
        content: "/opengraph-image.png",
      },
    ],
    links: [
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

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html className="dark" lang="en">
      <head>
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
