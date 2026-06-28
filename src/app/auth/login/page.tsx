'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setNeedsConfirmation(false)
    setResendSent(false)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        const msg = error.message.toLowerCase()
        if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
          setNeedsConfirmation(true)
          setError('Please confirm your email address before signing in.')
        } else if (msg.includes('invalid login credentials') || msg.includes('invalid email or password')) {
          setError('Incorrect email or password. Please try again.')
        } else {
          setError(error.message)
        }
        setLoading(false)
        return
      }

      window.location.href = redirect
    } catch {
      setError('Connection error. Please check your internet connection and try again.')
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.resend({ type: 'signup', email })
      setResendSent(true)
    } catch {
      // silently ignore
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-gray-900">
            Shoe-Mart<span className="text-red-600">.</span>
          </Link>
          <h1 className="text-2xl font-black text-gray-900 mt-4 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-400">Log in to your Shoe-Mart account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 space-y-1.5">
              <p className="text-red-600 text-sm">{error}</p>
              {needsConfirmation && !resendSent && (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-xs font-semibold text-red-700 underline underline-offset-2 hover:text-red-900"
                >
                  Resend confirmation email →
                </button>
              )}
              {resendSent && (
                <p className="text-xs font-medium text-green-700">
                  Confirmation email sent! Check your inbox.
                </p>
              )}
            </div>
          )}

          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-red-600 font-semibold hover:underline">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
