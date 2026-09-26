/** Logo mark for ImageResponse (OG image, apple icon) — plain SVG, explicit colors. */
export function MarkImage({ size, color = "#2D2B2A" }: { size: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24 2.8 42.4 13.4v21.2L24 45.2 5.6 34.6V13.4Z" stroke={color} strokeWidth="1.1" strokeLinejoin="round" />
      <path
        d="M13.2 15.6 18.6 32.2 24 21.4l5.4 10.8 5.4-16.6"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="13.2" cy="15.6" r="1.9" fill={color} />
      <circle cx="18.6" cy="32.2" r="1.9" fill={color} />
      <circle cx="29.4" cy="32.2" r="1.9" fill={color} />
      <circle cx="34.8" cy="15.6" r="1.9" fill={color} />
      <circle cx="24" cy="21.4" r="2.5" fill="#B89F6B" />
    </svg>
  );
}
