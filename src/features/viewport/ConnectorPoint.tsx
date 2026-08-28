import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { CATALOG, RARITY_META } from '@/data/catalog';
import { useBuild, useHover } from '@/features/builder';
import { CATEGORY_ICONS } from '@/shared/icons';
import { playHoverSfx } from '@/audio';
import { isStackableCategory, type CategoryDef } from '@/shared/types';
import { connectorCardDelay } from "./connectorIntro";
import { PreviewImage } from '@/shared/components';

interface ConnectorPointProps {
  category: CategoryDef;
  index: number;
}

export function ConnectorPoint({ category, index }: ConnectorPointProps) {
  const { selection, activeCategory, setActiveCategory } = useBuild();
  const { hoveredCategory, setHoveredCategory } = useHover();
  const Icon = CATEGORY_ICONS[category.id];

  const selectedIds = isStackableCategory(category.id)
    ? (selection[category.id] ?? [])
    : [selection[category.id]];
  const item = CATALOG.find((c) => c.id === selectedIds[0]);
  const extraCount = isStackableCategory(category.id)
    ? Math.max(selectedIds.length - 1, 0)
    : 0;

  const isHovered = hoveredCategory === category.id;
  const isActiveTab = activeCategory === category.id;
  const isLive = isHovered || isActiveTab;
  const isLeft = category.side === "left";
  const enterDelay = connectorCardDelay(index);

  return (
    <motion.button
      initial={{ opacity: 0, x: isLeft ? -56 : 56, scale: 0.72, filter: "blur(8px)" }}
      animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
      exit={{
        opacity: 0,
        x: isLeft ? -36 : 36,
        scale: 0.88,
        filter: "blur(4px)",
        transition: { duration: 0.28, ease: [0.4, 0, 1, 1] },
      }}
      transition={{
        delay: enterDelay,
        type: "spring",
        stiffness: 420,
        damping: 22,
        mass: 0.82,
        filter: { duration: 0.38, delay: enterDelay, ease: [0.16, 1, 0.3, 1] },
      }}
      onMouseEnter={() => {
        setHoveredCategory(category.id);
        playHoverSfx();
      }}
      onMouseLeave={() => setHoveredCategory(null)}
      onClick={() => setActiveCategory(category.id)}
      title={category.hint}
      className={`cursor-pointer absolute z-10 flex w-24 -translate-y-1/2 flex-col gap-1 overflow-visible rounded-xl border p-1.5 backdrop-blur-md transition-all duration-200 ${
        isLive
          ? "border-primary-2/60 bg-primary/12 shadow-[0_0_20px_rgba(168,85,247,0.35)]"
          : "border-white/10 bg-black/35 hover:border-white/20"
      }`}
      style={{
        top: `${category.anchor}%`,
        [isLeft ? "left" : "right"]: "0.75rem",
        transformOrigin: isLeft ? "left center" : "right center",
      }}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          delay: enterDelay + 0.16,
          duration: 0.58,
          ease: "easeOut",
          times: [0, 0.32, 1],
        }}
        style={{ boxShadow: "0 0 28px 8px rgba(168,85,247,0.5)" }}
      />
      <span
        className={`text-center text-[9px] font-bold tracking-[0.16em] transition-colors duration-200 ${
          isLive ? "text-ink" : "text-muted-2"
        }`}
      >
        {category.label.toUpperCase()}
      </span>

      <motion.span
        className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg"
        initial={{ opacity: 0, scale: 0.78 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: enterDelay + 0.1,
          duration: 0.38,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={
          item && !item.previewPath
            ? {
                background: `linear-gradient(150deg, ${item.colorFrom}, ${item.colorTo})`,
              }
            : undefined
        }
      >
        {item ? (
          <>
            {item.previewPath ? (
              <PreviewImage
                src={item.previewPath}
                priority
                className="h-full w-full object-cover"
              />
            ) : (
              <Icon className="h-4 w-4 text-white/85" strokeWidth={1.5} />
            )}
            <span
              className="absolute right-1 bottom-1 h-1.5 w-1.5 rounded-full"
              style={{ background: RARITY_META[item.rarity].color }}
            />
            {extraCount > 0 && (
              <span className="absolute top-0.5 left-0.5 rounded-full bg-black/55 px-1 text-[8px] font-bold text-white/90">
                +{extraCount}
              </span>
            )}
          </>
        ) : (
          <span className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/3">
            <Plus className="h-3 w-3 text-white/40" />
          </span>
        )}
      </motion.span>
    </motion.button>
  );
}
