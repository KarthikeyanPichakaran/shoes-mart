import Link from 'next/link'
import { UserPlus, LogIn } from 'lucide-react'

export default function GuestWelcome() {
  return (
    <section className="bg-gray-900 py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-1">
            First time here?
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-white mb-1">
            Create your free Shoe-Mart account
          </h2>
          <p className="text-sm text-gray-400">
            Save addresses, track orders, and check out faster — all in one place.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Sign up free
          </Link>
        </div>
      </div>
    </section>
  )
}
