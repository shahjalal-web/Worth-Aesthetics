import { ImageResponse } from "next/og";

export const alt = "Worth Aesthetics — Clinical Peptide Skincare";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social share image (text-only until the official logo SVG is supplied). */
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
          background: "#EFE9E0",
          color: "#2D2B2A",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ position: "absolute", inset: 32, border: "1px solid #B89F6B", display: "flex" }} />
        <div style={{ fontSize: 30, letterSpacing: 14, color: "#7A653B" }}>CLINICAL PEPTIDE SKINCARE</div>
        <div style={{ fontSize: 96, letterSpacing: 30, marginTop: 36, fontWeight: 600 }}>WORTH</div>
        <div style={{ fontSize: 30, letterSpacing: 22, marginTop: 8, color: "#6B6560" }}>AESTHETICS</div>
        <div style={{ width: 120, height: 1, background: "#B89F6B", marginTop: 48, display: "flex" }} />
        <div style={{ fontSize: 34, marginTop: 40, fontStyle: "italic", color: "#2D2B2A" }}>
          Precision peptides for visibly firmer skin
        </div>
      </div>
    ),
    size,
  );
}
