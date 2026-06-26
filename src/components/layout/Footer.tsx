import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <p className="text-2xl font-black text-white mb-3">
              Kickd<span className="text-red-600">.</span>
            </p>
            <p className="text-sm leading-relaxed">
              Premium footwear for every step of the journey. Sneakers, runners,
              and boots built to last.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">
              Shop
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/products/sneakers"
                  className="hover:text-white transition-colors"
                >
                  Sneakers
                </Link>
              </li>
              <li>
                <Link
                  href="/products/running-shoes"
                  className="hover:text-white transition-colors"
                >
                  Running Shoes
                </Link>
              </li>
              <li>
                <Link
                  href="/products/boots"
                  className="hover:text-white transition-colors"
                >
                  Boots
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-white transition-colors"
                >
                  All Shoes
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">
              Account
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/auth/login"
                  className="hover:text-white transition-colors"
                >
                  Log In
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/signup"
                  className="hover:text-white transition-colors"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="hover:text-white transition-colors"
                >
                  Order History
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} Kickd. All rights reserved.
          </p>
          <p className="text-xs">Payments secured by Razorpay</p>
        </div>
      </div>
    </footer>
  )
}
