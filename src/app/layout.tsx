import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartSyncer from '@/components/CartSyncer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Shoe-Mart — Premium Footwear',
    template: '%s | Shoe-Mart',
  },
  description:
    'Shop the latest sneakers, running shoes, and boots at Shoe-Mart. Premium footwear for every occasion.',
  keywords: ['sneakers', 'running shoes', 'boots', 'footwear', 'shoes'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-white text-gray-900`}
        suppressHydrationWarning
      >
        <CartSyncer />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
