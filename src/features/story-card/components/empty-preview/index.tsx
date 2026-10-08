export const EmptyPreview = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => (
  <g>
    <rect
      x={width / 2 - 32}
      y={height / 2 - 12}
      width="64"
      height="24"
      rx="9"
      className="fill-card stroke-primary/35"
      strokeWidth="1.5"
    />
    <text
      x={width / 2}
      y={height / 2 + 3}
      textAnchor="middle"
      className="fill-muted-foreground text-[8px]"
    >
      Empty
    </text>
  </g>
);
