import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SALL — Self-Access Language Learning',
  description:
    'Platform pembelajaran Bahasa Inggris fashion untuk siswa kelas XI Tata Busana SMKN 2 Bondowoso. Belajar mandiri, interaktif, dan terukur.',
  keywords: ['bahasa inggris', 'fashion', 'SMK', 'pembelajaran', 'SALL'],
  authors: [{ name: 'SALL Team' }],
  openGraph: {
    title: 'SALL — Self-Access Language Learning',
    description: 'Platform pembelajaran Bahasa Inggris fashion interaktif untuk siswa SMK.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-rose-50 font-sans text-gray-800">
        {children}
      </body>
    </html>
  )
}
