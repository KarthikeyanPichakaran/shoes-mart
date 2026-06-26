'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ShoppingCart, Menu, X, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'

const navLinks = [
  { href: '/products/sneakers', label: 'Sneakers' },
  { href: '/products/running-shoes', label: 'Running' },
  { href: '/products/boots', label: 'Boots' },
  { href: '/products', label: 'All Shoes' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const itemCount = useCartStore((state) => state.getItemCount())

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-black tracking-tight text-gray-900">
            Kickd<span className="text-red-600">.</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-red-600'
                    : 'text-gray-600 hover:text-red-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-red-600 transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Desktop auth */}
            {mounted && (
              <div className="hidden md:flex items-center gap-2 ml-2">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/orders"
                      className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors px-3 py-2"
                    >
                      Orders
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors px-3 py-2"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors px-3 py-2"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="text-sm font-semibold bg-red-600 text-white px-5 py-2 rounded-full hover:bg-red-700 transition-colors"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-gray-700 hover:text-red-600 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-3 mt-3 space-y-1">
            {isLoggedIn ? (
              <>
                <Link
                  href="/orders"
                  className="block py-2 text-sm font-medium text-gray-700 hover:text-red-600"
                >
                  My Orders
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block py-2 text-sm font-medium text-gray-700 hover:text-red-600"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block py-2 text-sm font-medium text-gray-700 hover:text-red-600"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="block py-2 text-sm font-semibold text-red-600"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
