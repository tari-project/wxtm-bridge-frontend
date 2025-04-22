import '@/styles/globals.css'
import Header from '@/components/header'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from './providers'
import { getConfig } from '@/utils/config'
import { headers } from 'next/headers'
import { cookieToInitialState } from 'wagmi'

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
  const headerList = await headers()
  const cookieHeader = headerList.get('cookie')
  const initialState = cookieToInitialState(getConfig(), cookieHeader)

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col items-center justify-center bg-[url('/background.png')]
        bg-no-repeat bg-cover bg-center min-h-screen`}
      >
        <Providers initialState={initialState}>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}
