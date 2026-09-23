import { ImageResponse } from "next/og";

/**
 * Default share card for any page that doesn't set its own image (home,
 * collections, create-your-own-design …). Product pages use the product photo.
 * To use a photo instead, delete this file and add app/opengraph-image.jpg (1200×630).
 */
export const alt = "Baliye Couture — handcrafted and made-to-measure ethnic wear";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "#FAF8F0",
          border: "24px solid #A3243B",
          color: "#2B1B1E",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 96, letterSpacing: 6, color: "#A3243B" }}>BALIYE COUTURE</div>
        <div style={{ marginTop: 24, fontSize: 38, color: "#5A4A4D" }}>
          Handcrafted · Made to Measure · Designed by You
        </div>
      </div>
    ),
    size,
  );
}
