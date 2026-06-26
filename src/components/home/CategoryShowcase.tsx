import Link from 'next/link'
import type { Category } from '@/types'

interface CategoryShowcaseProps {
  categories: Category[]
}

const categoryConfig: Record<
  string,
  { emoji: string; tagline: string; bg: string }
> = {
  sneakers: {
    emoji: '👟',
    tagline: 'Casual to bold — everyday expression',
    bg: 'bg-gradient-to-br from-slate-50 to-slate-100',
  },
  'running-shoes': {
    emoji: '🏃',
    tagline: 'Built for speed, comfort, and miles',
    bg: 'bg-gradient-to-br from-red-50 to-red-100',
  },
  boots: {
    emoji: '🥾',
    tagline: 'Rugged style for every terrain',
    bg: 'bg-gradient-to-br from-stone-50 to-stone-100',
  },
}

export default function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  if (categories.length === 0) return null

  return (
    <section className="bg-gray-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-widest mb-2">
            Browse by type
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
            Shop by Category
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category) => {
            const config = categoryConfig[category.slug] ?? {
              emoji: '👟',
              tagline: category.description ?? '',
              bg: 'bg-gray-100',
            }

            return (
              <Link
                key={category.id}
                href={`/products/${category.slug}`}
                className={`group relative rounded-3xl p-8 ${config.bg} hover:shadow-lg transition-all duration-300 overflow-hidden`}
              >
                <div className="absolute -right-6 -bottom-6 text-8xl opacity-20 group-hover:opacity-30 transition-opacity select-none">
                  {config.emoji}
                </div>
                <div className="relative">
                  <span className="text-4xl mb-4 block">{config.emoji}</span>
                  <h3 className="text-xl font-black text-gray-900 mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">{config.tagline}</p>
                  <span className="inline-flex items-center text-sm font-semibold text-red-600 group-hover:translate-x-1 transition-transform">
                    Shop now &rarr;
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
