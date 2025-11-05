import '@/styles/globals.css'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from './providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'wXTM Bridge',
  description: 'Bridge between Tari and Ethereum',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col items-center justify-center bg-[url('/background.png')]
        bg-no-repeat bg-cover min-h-screen bg-center`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
