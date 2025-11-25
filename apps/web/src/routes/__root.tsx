import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Navbar from '../components/landing/navbar'
import SmoothScroll from '../components/smooth-scroll'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Echo - Private, Offline, Fast Speech-to-Text',
      },
      {
        name: 'description',
        content:
          'Echo is a private, offline, and fast speech-to-text application. Transcribe your voice locally without sending data to the cloud.',
      },
      // OpenGraph meta tags
      {
        property: 'og:title',
        content: 'Echo - Private, Offline, Fast Speech-to-Text',
      },
      {
        property: 'og:description',
        content:
          'Echo is a private, offline, and fast speech-to-text application. Transcribe your voice locally without sending data to the cloud.',
      },
      {
        property: 'og:image',
        content: '/opengraph-image.png',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      // Twitter Card meta tags
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'Echo - Private, Offline, Fast Speech-to-Text',
      },
      {
        name: 'twitter:description',
        content:
          'Echo is a private, offline, and fast speech-to-text application. Transcribe your voice locally without sending data to the cloud.',
      },
      {
        name: 'twitter:image',
        content: '/opengraph-image.png',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <SmoothScroll>
          <Navbar />
          {children}
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        </SmoothScroll>
        <Scripts />
      </body>
    </html>
  )
}
