/**
 * The Pre-made Designs page's words and pictures. Edited in the admin panel
 * (Admin → Pre-made Designs page); these are the defaults it starts from and
 * falls back to. Images uploaded there are stored in Shopify Files.
 */
export const productsPageData = {
  hero: {
    eyebrow: "The Collection",
    title: "Pre-made",
    /** Shown in burgundy after the title. */
    titleAccent: "Designs",
    description:
      "Ready-to-order pieces from our ateliers. Wear them as they are, or make them yours with your choice of fabric, colour and embroidery.",
    /** The three arch pictures in the banner; also stand in for any silhouette without a photo. */
    images: ["/Rectangle-23961.png", "/Rectangle-23962.png", "/Rectangle-23963.png", "/Rectangle-23959.png"],
  },
  silhouettes: {
    title: "Shop by silhouette",
  },
  promo: {
    eyebrow: "Made for you",
    title: "Didn't find the one?",
    accent: "Design it from scratch.",
    text: "Pick a garment and we'll walk you through the rest, from the first thread to the final stitch.",
    cta: "Start designing",
  },
};

export type ProductsPageContent = typeof productsPageData;
