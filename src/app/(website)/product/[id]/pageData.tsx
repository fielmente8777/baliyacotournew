export interface ProductImage {
  src: string;
  alt: string;
}

export interface ProductDetail {
  id: number;
  name: string;
  sku: string;
  price: string;
  description: string;
  fabric: string;
  work: string;
  color: string;
  delivery: string;
  images: ProductImage[];
}

export const product: ProductDetail = {
  id: 1,
  name: "Banarsi Tissue Suit",
  sku: "BALIYE-001",
  price: "₹12,500",
  description:
    "Gracefully handcrafted Banarasi Tissue Suit designed with premium craftsmanship and timeless elegance.",
  fabric: "Banarasi Tissue",
  work: "Hand Embroidery",
  color: "Golden Beige",
  delivery: "Ships within 5–7 business days",
  images: [
    {
      src: "/Rectangle-23959.png",
      alt: "Front View",
    },
    {
      src: "/Rectangle-23961.png",
      alt: "Side View",
    },
    {
      src: "/Rectangle-23962.png",
      alt: "Back View",
    },
    {
      src: "/Rectangle-23963.png",
      alt: "Close View",
    },
  ],
};