export interface OrderProduct {
  id: number;
  title: string;
  image: string;
  delivery: string;
}

export const orderNumber = "#1234567890";

export const products: OrderProduct[] = [
  {
    id: 1,
    title: "Banarsi Tissue Suit",
    image: "/Rectangle-23959.png",
    delivery: "Tailored and Delivered in 3 weeks",
  },
  {
    id: 2,
    title: "Banarsi Tissue Suit",
    image: "/Rectangle-23961.png",
    delivery: "Tailored and Delivered in 3 weeks",
  },
  {
    id: 3,
    title: "Banarsi Tissue Suit",
    image: "/Rectangle-23962.png",
    delivery: "Tailored and Delivered in 3 weeks",
  },
];