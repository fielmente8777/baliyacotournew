export interface CartItemType {
  id: number;
  title: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: string;
}

export const cartItems: CartItemType[] = [
  {
    id: 1,
    title: "Banarsi Tissue Suit",
    image: "/Rectangle-23959.png",
    price: 130,
    originalPrice: 130,
    discount: "60% off",
  },
  {
    id: 2,
    title: "Banarsi Tissue Suit",
    image: "/Rectangle-23961.png",
    price: 130,
    originalPrice: 130,
    discount: "60% off",
  },
];