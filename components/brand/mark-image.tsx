import { LOCKUP, MONOGRAM } from "./logo-paths";

/** Client's own logo colours (from the vector artwork). */
export const BRAND_CHAMPAGNE = "#C4AE74";
export const BRAND_LIGHT = "#EDEDED";

type Group = { viewBox: string; paths: readonly string[] };

function BrandSvg({ group, height, color }: { group: Group; height: number; color: string }) {
  const [, , w, h] = group.viewBox.split(" ").map(Number);
  return (
    <svg width={Math.round((height * w) / h)} height={height} viewBox={group.viewBox} fill={color}>
      {group.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

/** Official monogram for ImageResponse (apple icon). */
export function MarkImage({ size, color = "#2D2B2A" }: { size: number; color?: string }) {
  return <BrandSvg group={MONOGRAM} height={size} color={color} />;
}

/** Official stacked lockup for ImageResponse (social share image). */
export function LockupImage({ height, color = "#2D2B2A" }: { height: number; color?: string }) {
  return <BrandSvg group={LOCKUP} height={height} color={color} />;
}
