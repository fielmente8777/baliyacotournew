export interface Product {
  id: number;
  title: string;
  image: string;
  price: string;
  isEditorsPick?: boolean;
}

export const products: Product[] = [
  {
    id: 1,
    title: "Banarsi Tissue Suit",
    price: "$150 - $200",
    image: "/Rectangle-23959.png",
    isEditorsPick: true,
  },
  {
    id: 2,
    title: "Banarsi Tissue Suit",
    price: "$150 - $200",
    image: "/Rectangle-23961.png",
  },
  {
    id: 3,
    title: "Banarsi Tissue Suit",
    price: "$150 - $200",
    image: "/Rectangle-23962.png",
  },
  {
    id: 4,
    title: "Banarsi Tissue Suit",
    price: "$150 - $200",
    image: "/Rectangle-23963.png",
  },
  {
    id: 5,
    title: "Banarsi Tissue Suit",
    price: "$150 - $200",
    image: "/Rectangle-23959.png",
  },

  // Mixed Order (3,2,1,4,5)

  {
    id: 6,
    title: "Banarsi Tissue Suit",
    price: "$150 - $200",
    image: "/Rectangle-23962.png",
  },
  {
    id: 7,
    title: "Banarsi Tissue Suit",
    price: "$150 - $200",
    image: "/Rectangle-23961.png",
  },
  {
    id: 8,
    title: "Banarsi Tissue Suit",
    price: "$150 - $200",
    image: "/Rectangle-23959.png",
    isEditorsPick: true,
  },
  {
    id: 9,
    title: "Banarsi Tissue Suit",
    price: "$150 - $200",
    image: "/Rectangle-23963.png",
  },
  {
    id: 10,
    title: "Banarsi Tissue Suit",
    price: "$150 - $200",
    image: "/Rectangle-23959.png",
  },

  // Mixed Again

  {
    id: 11,
    title: "Banarsi Tissue Suit",
    price: "$150 - $200",
    image: "/Rectangle-23961.png",
  },
  {
    id: 12,
    title: "Banarsi Tissue Suit",
    price: "$150 - $200",
    image: "/Rectangle-23963.png",
    isEditorsPick: true,
  },
  {
    id: 13,
    title: "Banarsi Tissue Suit",
    price: "$150 - $200",
    image: "/Rectangle-23962.png",
  },
  {
    id: 14,
    title: "Banarsi Tissue Suit",
    price: "$150 - $200",
    image: "/Rectangle-23959.png",
  },
];