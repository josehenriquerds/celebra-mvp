import { GeistSans, GeistMono } from 'geist/font'
import './globals.css'
import { Providers } from './providers'
import type { Metadata } from 'next'

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
