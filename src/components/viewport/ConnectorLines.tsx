import { useBuild } from "../../state/BuildContext";
import { CATEGORIES } from "../../data/catalog";

export function ConnectorLines() {
  const { hoveredCategory, activeCategory } = useBuild();

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-5 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {CATEGORIES.map((cat) => {
        const isLeft = cat.side === "left";
        const startX = isLeft ? 7.5 : 92.5;
        const endX = isLeft ? 34 : 66;
        const y = cat.anchor;
        const midX = (startX + endX) / 2;
        const isHighlighted =
          hoveredCategory === cat.id || activeCategory === cat.id;

        return (
          <g key={cat.id}>
            <path
              d={`M ${startX} ${y} Q ${midX} ${y - 2.5}, ${endX} ${y}`}
              fill="none"
              stroke={isHighlighted ? "#c084fc" : "rgba(168,85,247,0.28)"}
              strokeWidth={isHighlighted ? 0.45 : 0.28}
              strokeDasharray="1.2 1.6"
              vectorEffect="non-scaling-stroke"
              className={isHighlighted ? "animate-dash" : ""}
              style={{ transition: "stroke 0.25s ease" }}
            />
            <circle
              cx={endX}
              cy={y}
              r={isHighlighted ? 0.9 : 0.55}
              fill={isHighlighted ? "#c084fc" : "rgba(168,85,247,0.5)"}
              vectorEffect="non-scaling-stroke"
              style={{ transition: "all 0.25s ease" }}
            />
          </g>
        );
      })}
    </svg>
  );
}
