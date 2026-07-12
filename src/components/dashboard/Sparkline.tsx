interface SparklineProps {
  data: number[];
  height?: number;
  className?: string;
  color?: string;
}

export default function Sparkline({
  data,
  height = 36,
  className = "",
  color = "#6366f1",
}: SparklineProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data, 1); // avoid division by zero
  const width = 100; // viewBox width
  const padding = 2;
  const usableHeight = height - padding * 2;
  const usableWidth = width - padding * 2;
  const step = usableWidth / Math.max(data.length - 1, 1);

  const points = data.map((v, i) => {
    const x = padding + i * step;
    const y = padding + usableHeight - (v / max) * usableHeight;
    return `${x},${y}`;
  });

  const polyline = points.join(" ");

  // Gradient fill path: close the polygon at the bottom
  const fillPath = `M ${padding},${padding + usableHeight} ${points.map((p) => `L ${p}`).join(" ")} L ${padding + (data.length - 1) * step},${padding + usableHeight} Z`;

  const gradientId = `sparkline-grad-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full ${className}`}
      style={{ height: `${height}px` }}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${gradientId})`} />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
