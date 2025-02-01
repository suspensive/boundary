import './global.css'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Suspensive - Visualization',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <nav className="flex items-center justify-center bg-white/[.06] px-4 py-2 font-bold">
            <Link href="/">
              <div className="flex items-center justify-center">
                <Image src="/logo_not_cropped.png" width={40} height={40} alt="logo" />
                Visualization
              </div>
            </Link>
          </nav>
          <ul>
            <li>
              <details>
                <summary>@suspensive/react</summary>
                <li>
                  <Link href="/react/Delay">{`<Delay/>`}</Link>
                </li>
                <li>
                  <Link href="/react/ErrorBoundary/shouldCatch">{`<ErrorBoundary/>`} shouldCatch prop</Link>
                </li>
                <li>
                  <Link href="/react/ErrorBoundary/ErrorInFallback">{`<ErrorBoundary/>`}'s fallback Error</Link>
                </li>
                <li>
                  <Link href="/react/ErrorBoundary/shouldCatch/renderPhase">
                    {`<ErrorBoundary/>`} shouldCatch prop render phase
                  </Link>
                </li>
                <li>
                  <Link href="/react/zodSearchParams">zod: no param</Link>
                </li>
                <li>
                  <Link href="/react/zodSearchParams?id=1">zod: id=1</Link>
                </li>
                <li>
                  <Link href="/react/zodSearchParams?id=0.1">zod: id=0.1</Link>
                </li>
                <li>
                  <Link href="/react/zodSearchParams?id=-1">zod: id=-1</Link>
                </li>
              </details>
            </li>
            <li>
              <details>
                <summary>@suspensive/react-dom</summary>
                <li>
                  <Link href="/react-dom/InView">{`<InView/>`}</Link>
                </li>
                <li>
                  <Link href="/react-dom/FadeIn">{`<FadeIn/>`}</Link>
                </li>
              </details>
            </li>
            <li>
              <details>
                <summary>@suspensive/react-query</summary>
                <li>
                  <Link href="/react-query/SuspenseQuery">{`<SuspenseQuery/>`}</Link>
                </li>
                <li>
                  <Link href="/react-query/SuspenseInfiniteQuery">{`<SuspenseInfiniteQuery/>`}</Link>
                </li>
              </details>
            </li>
          </ul>
          <div className="flex flex-1 items-center justify-center">{children}</div>
        </Providers>
      </body>
    </html>
  )
}
