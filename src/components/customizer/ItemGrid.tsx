import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CATALOG } from "../../data/catalog";
import { useBuild } from "../../state/BuildContext";
import { ItemCard } from "./ItemCard";
import { FilterBar } from "./FilterBar";
import type { Rarity } from "../../types";

export function ItemGrid() {
  const { activeCategory } = useBuild();
  const [rarity, setRarity] = useState("All");
  const [sort, setSort] = useState("Popular");
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  const items = useMemo(() => {
    let list = CATALOG.filter(
      (c) => activeCategory === "all" || c.categoryId === activeCategory,
    );
    if (rarity !== "All") {
      list = list.filter((c) => c.rarity === (rarity.toLowerCase() as Rarity));
    }
    list = [...list].sort((a, b) => {
      if (sort === "Price: Low") return a.price - b.price;
      if (sort === "Price: High") return b.price - a.price;
      if (sort === "Newest") return b.id.localeCompare(a.id);
      return b.popularity - a.popularity;
    });
    return list;
  }, [activeCategory, rarity, sort]);

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-col gap-2.5">
      <FilterBar
        rarity={rarity}
        onRarityChange={setRarity}
        sort={sort}
        onSortChange={setSort}
        layout={layout}
        onLayoutChange={setLayout}
      />

      <div className="thin-scrollbar h-62 min-w-0 overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full items-center justify-center text-[12px] text-muted-2"
            >
              No parts match your filters
            </motion.div>
          ) : layout === "grid" ? (
            <motion.div key="grid" className="grid grid-cols-3 gap-2 [&>*]:min-w-0">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, delay: i * 0.02 }}
                >
                  <ItemCard item={item} layout="grid" />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="list" className="flex flex-col gap-1.5">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.25, delay: i * 0.02 }}
                >
                  <ItemCard item={item} layout="list" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
