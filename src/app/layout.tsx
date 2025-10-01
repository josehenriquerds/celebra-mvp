import type { Metadata } from 'next'
import './globals.css'
import { GeistSans, GeistMono } from 'geist/font'
import { Providers } from './providers'

const geistSans = GeistSans
const geistMono = GeistMono

export const metadata: Metadata = {
  title: 'Celebre',
  description: 'Deixe o resto com a gente',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
