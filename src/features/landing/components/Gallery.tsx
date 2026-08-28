import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { GALLERY, rarityClass } from '../data'
import { useParallaxY } from '../useParallaxY'
import { Reveal, SectionHeading } from './Reveal'

export function Gallery() {
  return (
    <section
      id="gallery"
      className="scroll-mt-20 border-y border-white/6 bg-black px-5 py-20 sm:px-8 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            eyebrow="Gallery Demo"
            title="Infinite Possibilities. One Platform."
            subtitle="Explore pre-made chassis configurations uploaded by our community, or use them as a launching point for your custom build."
          />
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {GALLERY.map((item, i) => (
            <Reveal key={item.name} delay={i * 0.06}>
              <GalleryCard item={item} distance={18 + (i % 2) * 16} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function GalleryCard({
  item,
  distance,
}: {
  item: (typeof GALLERY)[number]
  distance: number
}) {
  const { ref, y } = useParallaxY(distance)

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-white/8 bg-panel-2 p-3 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary-3/45 hover:shadow-[0_12px_48px_rgba(124,58,237,0.18)]">
      <div ref={ref} className="relative mb-4 aspect-[238/260] overflow-hidden rounded-xl bg-black">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(124,58,237,0.32),transparent_60%)]" />
        <motion.img
          src={item.img}
          alt={item.name}
          style={{ y }}
          className="relative z-10 h-full w-full object-contain p-3 transition-transform duration-700 ease-out group-hover:scale-110"
          draggable={false}
        />
        <div className="pointer-events-none absolute inset-0 z-20 -translate-x-full bg-gradient-to-r from-transparent via-white/12 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      </div>
      <div className="mb-4 flex flex-1 flex-col gap-1.5 px-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-white">{item.name}</h3>
          <span className={`text-xs font-semibold ${rarityClass[item.rarity]}`}>{item.rarity}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-2">
          <span>by {item.by}</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {item.likes}
          </span>
        </div>
      </div>
      <Link
        to="/customize"
        className="btn-sheen inline-flex w-fit items-center gap-2 rounded-xl bg-primary-3 px-5 py-2.5 text-sm font-semibold text-white uppercase transition-colors hover:bg-primary"
      >
        Customize
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </article>
  )
}
