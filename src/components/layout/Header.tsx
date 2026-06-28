'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ShoppingCart, Menu, X, User, ChevronDown, Package, LogOut, Settings } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
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
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const itemCount = useCartStore((state) => state.items.length)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email ?? null)
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        setUserName(profile?.full_name ?? null)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        setUserEmail(session.user.email ?? null)
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single()
        setUserName(profile?.full_name ?? null)
      } else {
        setUserEmail(null)
        setUserName(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { setMenuOpen(false); setDropdownOpen(false) }, [pathname])

  const handleSignOut = async () => {
    setDropdownOpen(false)
    setMenuOpen(false)
    setUserEmail(null)
    setUserName(null)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : userEmail?.[0]?.toUpperCase() ?? 'U'

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 shrink-0">
            Shoe-Mart<span className="text-red-600">.</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={`text-sm font-medium transition-colors ${pathname === link.href ? 'text-red-600' : 'text-gray-600 hover:text-red-600'}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Cart */}
            <Link href="/cart"
              className="relative p-2 text-gray-700 hover:text-red-600 transition-colors"
              aria-label="Shopping cart">
              <ShoppingCart className="h-6 w-6" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Desktop: profile dropdown or auth links */}
            {mounted && (
              <div className="hidden md:flex items-center gap-2 ml-1">
                {userEmail ? (
                  <div ref={dropdownRef} className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-50 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {initials}
                      </div>
                      <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                        {userName ?? userEmail}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-lg py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900 truncate">{userName ?? 'My Account'}</p>
                          <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                        </div>
                        <Link href="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Settings className="h-4 w-4 text-gray-400" /> My Profile
                        </Link>
                        <Link href="/orders"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Package className="h-4 w-4 text-gray-400" /> My Orders
                        </Link>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button onClick={handleSignOut}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                            <LogOut className="h-4 w-4" /> Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link href="/auth/login"
                      className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors px-3 py-2">
                      Log in
                    </Link>
                    <Link href="/auth/signup"
                      className="text-sm font-semibold bg-red-600 text-white px-5 py-2 rounded-full hover:bg-red-700 transition-colors">
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
              aria-label="Toggle menu">
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className="block py-2.5 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors border-b border-gray-50 last:border-0">
              {link.label}
            </Link>
          ))}

          <div className="pt-3 mt-2 border-t border-gray-100 space-y-1">
            {mounted && userEmail ? (
              <>
                <div className="flex items-center gap-3 px-1 py-2 mb-1">
                  <div className="h-9 w-9 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{userName ?? 'My Account'}</p>
                    <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                  </div>
                </div>
                <Link href="/profile"
                  className="flex items-center gap-3 py-2.5 text-sm font-medium text-gray-700 hover:text-red-600">
                  <Settings className="h-4 w-4" /> My Profile
                </Link>
                <Link href="/orders"
                  className="flex items-center gap-3 py-2.5 text-sm font-medium text-gray-700 hover:text-red-600">
                  <Package className="h-4 w-4" /> My Orders
                </Link>
                <button onClick={handleSignOut}
                  className="flex items-center gap-3 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 w-full">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login"
                  className="block py-2.5 text-sm font-medium text-gray-700 hover:text-red-600">
                  Log in
                </Link>
                <Link href="/auth/signup"
                  className="block py-2.5 text-sm font-semibold text-red-600">
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
