import { ImageResponse } from "next/og";
import { BRAND_CHAMPAGNE, BRAND_LIGHT, LockupImage } from "@/components/brand/mark-image";

export const alt = "Worth Aesthetics — Clinical Peptide Skincare";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social share image — the client's official lockup on brand champagne. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND_CHAMPAGNE,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ position: "absolute", inset: 28, border: `1px solid ${BRAND_LIGHT}`, opacity: 0.6, display: "flex" }} />
        <LockupImage height={400} color={BRAND_LIGHT} />
        <div style={{ fontSize: 22, letterSpacing: 12, color: BRAND_LIGHT, marginTop: 34 }}>CLINICAL PEPTIDE SKINCARE</div>
      </div>
    ),
    size,
  );
}
