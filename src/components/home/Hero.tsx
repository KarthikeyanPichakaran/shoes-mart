import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative bg-gray-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-red-950 opacity-95" />

      {/* Decorative circles */}
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />
      <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-red-600/5 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-36">
        <div className="max-w-2xl">
          <span className="inline-block bg-red-600 text-white text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5 sm:mb-6">
            New Collection
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-none mb-5 sm:mb-6">
            Step Into
            <br />
            <span className="text-red-500">Your Style</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-300 mb-8 sm:mb-10 max-w-lg leading-relaxed">
            Premium sneakers, running shoes, and boots — crafted for the streets
            and beyond. Free shipping on orders over ₹999.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/products"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-full text-sm tracking-wide transition-colors"
            >
              Shop All Shoes
            </Link>
            <Link
              href="/products/sneakers"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-full text-sm tracking-wide transition-colors border border-white/20"
            >
              View Sneakers
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-sm">
          {[
            { label: 'Products', value: '14+' },
            { label: 'Categories', value: '3' },
            { label: 'Brands', value: '1' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
