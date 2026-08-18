import { useEffect, useRef } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'motion/react'
import { useHover } from '../../state/BuildContext'
import { CATEGORIES } from '../../data/catalog'
import type { CategoryDef } from '../../types'
import { BRANCH_COUNT, VIEW_HEIGHT, branchPath, spinePath, strike } from './lightning'
import type { Bolt } from './lightning'
import {
  CONNECTOR_LINE_DURATION,
  connectorCardDelay,
  connectorLandingDelay,
  connectorLineDelay,
} from './connectorIntro'

/** Card inset (0.75rem) plus card width (5.5rem), so lines start flush with the card. */
const CARD_EDGE = 'calc(5.5rem + 0.75rem)'
/** Distance from the far side of the panel. Higher = dots sit farther from the avatar. */
const INNER_STOP = '71%'

const FORKS = Array.from({ length: BRANCH_COUNT }, (_, i) => i)
/** Real lightning re-strikes several times inside one flash; so does this. */
const RESTRIKE_MIN_MS = 70
const RESTRIKE_RANGE_MS = 90

function Connector({ category, index }: { category: CategoryDef; index: number }) {
  const { hoveredCategory } = useHover()
  // The bolt is hover-only — an active tab keeps its card highlight instead.
  const isLive = hoveredCategory === category.id
  const isLeft = category.side === 'left'

  const bolt = useRef<Bolt>(strike())
  const charge = useMotionValue(0)
  // Driven separately from the charge so the whole bolt can gutter without
  // regenerating its shape.
  const flicker = useMotionValue(1)
  const flash = useMotionValue(0)

  const spine = useTransform(charge, (value) => spinePath(bolt.current, value))
  // All forks share one path element: subpaths are free, extra nodes are not.
  const forks = useTransform(charge, (value) =>
    FORKS.map((index) => branchPath(bolt.current, index, value)).join(' '),
  )
  const glow = useTransform(charge, [0, 1], [0, 0.55])
  const forkOpacity = useTransform(charge, [0.35, 1], [0, 0.75])
  const lineDelay = connectorLineDelay(index)
  const cardDelay = connectorCardDelay(index)
  const landingDelay = connectorLandingDelay(index)

  useEffect(() => {
    if (!isLive) {
      const settle = animate(charge, 0, { duration: 0.28, ease: [0.16, 1, 0.3, 1] })
      const dim = animate(flicker, 1, { duration: 0.2 })
      flash.set(0)
      return () => {
        settle.stop()
        dim.stop()
      }
    }

    bolt.current = strike()
    let restrike: number | undefined

    // The leader stroke: one fast throw, with a bloom that decays behind it.
    const controls = animate(charge, 1, { duration: 0.22, ease: [0.16, 1, 0.3, 1] })
    flash.set(1)
    const bloom = animate(flash, 0, { duration: 0.55, ease: 'easeOut' })

    const queue = () => {
      restrike = window.setTimeout(
        () => {
          bolt.current = strike()
          // Snapping the charge short of 1 is what makes the bolt jump rather
          // than glide between shapes.
          charge.set(0.86 + Math.random() * 0.18)
          flicker.set(0.66 + Math.random() * 0.34)
          queue()
        },
        RESTRIKE_MIN_MS + Math.random() * RESTRIKE_RANGE_MS,
      )
    }
    queue()

    return () => {
      controls.stop()
      bloom.stop()
      window.clearTimeout(restrike)
    }
  }, [charge, flash, flicker, isLive])

  return (
    <div
      // Mirrored on the right so the surge always travels toward the avatar.
      className={`absolute h-9 -translate-y-1/2 leading-none ${isLeft ? '' : '-scale-x-100'}`}
      style={{
        top: `${category.anchor}%`,
        left: isLeft ? CARD_EDGE : INNER_STOP,
        right: isLeft ? INNER_STOP : CARD_EDGE,
      }}
    >
      <motion.svg
        className="absolute inset-0 block h-full w-full overflow-visible"
        viewBox={`0 0 100 ${VIEW_HEIGHT}`}
        preserveAspectRatio="none"
        fill="none"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        style={{ originX: 0, originY: 0.5 }}
        transition={{
          duration: CONNECTOR_LINE_DURATION,
          delay: lineDelay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <motion.g style={{ opacity: flicker }}>
          {/* Atmosphere: the wide halo the strike throws onto the panel. */}
          <motion.path
            className="blur-[6px]"
            d={spine}
            stroke="#a855f7"
            strokeWidth={9}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{ opacity: flash }}
          />
          <motion.path
            className="blur-[3px]"
            d={spine}
            stroke="#a855f7"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{ opacity: glow }}
          />

          <motion.path
            className="blur-[0.5px]"
            d={forks}
            stroke="#d8b4fe"
            strokeWidth={0.9}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{ opacity: forkOpacity }}
          />

          <motion.path
            className="blur-[1px]"
            d={spine}
            stroke="#c084fc"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{ opacity: glow }}
          />

          {/* The core stays put when idle, and is what the flat line reads as. */}
          <motion.path
            d={spine}
            stroke={isLive ? '#f5e8ff' : 'rgba(168,85,247,0.32)'}
            strokeWidth={isLive ? 1.2 : 1}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{ transition: 'stroke 0.25s ease' }}
          />

          {/* Draw-head: a bright flash along the growing stroke, then it settles. */}
          <motion.path
            d={spine}
            stroke="#f5e8ff"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              duration: CONNECTOR_LINE_DURATION + 0.18,
              delay: lineDelay,
              times: [0, 0.45, 1],
            }}
          />
          <motion.path
            className="blur-[3px]"
            d={spine}
            stroke="#c084fc"
            strokeWidth={5}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{
              duration: CONNECTOR_LINE_DURATION + 0.14,
              delay: lineDelay,
              times: [0, 0.4, 1],
            }}
          />

          {/* Mounted only while live, so an idle panel animates nothing at all. */}
          <AnimatePresence>
            {isLive ? (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <motion.path
                  className="animate-surge blur-[2px]"
                  d={spine}
                  pathLength={100}
                  stroke="#e9d5ff"
                  strokeWidth={4}
                  strokeDasharray="16 84"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                <motion.path
                  className="animate-surge"
                  d={spine}
                  pathLength={100}
                  stroke="#ffffff"
                  strokeWidth={1.6}
                  strokeDasharray="16 84"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </motion.g>
            ) : null}
          </AnimatePresence>
        </motion.g>
      </motion.svg>

      {/* Zero-size anchors sit on the stroke endpoints so line-height cannot
          lift the dots off the path. */}
      <span className="absolute top-1/2 left-0 z-10 flex h-0 w-0 items-center justify-center">
        <motion.span
          className="block h-1 w-1 shrink-0 rounded-full bg-primary/50"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: cardDelay + 0.08, duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        />
      </span>
      <span className="absolute top-1/2 right-0 z-10 flex h-0 w-0 items-center justify-center">
        <motion.span
          className={`block shrink-0 rounded-full bg-primary-2 transition-all duration-300 ${
            isLive ? 'animate-arc-impact' : ''
          }`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: landingDelay,
            type: 'spring',
            stiffness: 520,
            damping: 16,
          }}
          style={{
            height: isLive ? '0.4rem' : '0.3rem',
            width: isLive ? '0.4rem' : '0.3rem',
            boxShadow: `0 0 ${isLive ? 10 : 6}px ${isLive ? 3 : 1.5}px rgba(192,132,252,${isLive ? 0.6 : 0.35})`,
          }}
        />
      </span>
    </div>
  )
}

export function ConnectorLines() {
  return (
    <div className="pointer-events-none absolute inset-0 z-5">
      {CATEGORIES.map((category, index) => (
        <Connector key={category.id} category={category} index={index} />
      ))}
    </div>
  )
}
