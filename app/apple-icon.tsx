import { ImageResponse } from "next/og";
import { BRAND_CHAMPAGNE, BRAND_LIGHT, MarkImage } from "@/components/brand/mark-image";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: BRAND_CHAMPAGNE }}>
        <MarkImage size={122} color={BRAND_LIGHT} />
      </div>
    ),
    size,
  );
}
