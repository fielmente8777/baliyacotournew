export type OrderStatus =
  | "placed"
  | "stitching"
  | "embroidery"
  | "shipping"
  | "delivered";

export interface OrderTimelineItem {
  id: number;
  title: string;
  date: string;
  status: "completed" | "current" | "pending";
}

export interface OrderReview {
  rating: number;
  action: string;
  /** Absent until the customer actually writes one. */
  title?: string;
  description?: string;
  images: string[];
}

export interface Order {
  id: number;
  productName: string;
  price: string;
  image: string;
  statusTitle: string;
  statusDescription: string;
  status: OrderStatus;
  timeline?: OrderTimelineItem[];
  review?: OrderReview;
}

export const orders: Order[] = [
  {
    id: 1,
    productName: "Banarsi Tissue Suit",
    price: "$130",
    image: "/Rectangle-23959.png",
    statusTitle: "Order Placed on 31 Oct 2024",
    statusDescription: "Custom Stitching in 5 days",
    status: "stitching",

    timeline: [
      {
        id: 1,
        title: "Order Placed",
        date: "14 December 2024",
        status: "completed",
      },
      {
        id: 2,
        title: "Stitching Starts",
        date: "14 December 2024",
        status: "current",
      },
      {
        id: 3,
        title: "Embroidery Started",
        date: "",
        status: "pending",
      },
      {
        id: 4,
        title: "Order Shipping",
        date: "",
        status: "pending",
      },
      {
        id: 5,
        title: "Order Delivered",
        date: "",
        status: "pending",
      },
    ],
  },

  {
    id: 2,
    productName: "Banarsi Tissue Suit",
    price: "$130",
    image: "/Rectangle-23959.png",
    statusTitle: "Order Completed on 2 Nov 2024",
    statusDescription: "Your order has been delivered",
    status: "delivered",

    review: {
      rating: 5,
      action: "Edit a review",
      title: "Perfect Fit and Stunning Quality!",
      description:
        "I recently purchased a corset set from this shop, and I couldn’t be more thrilled! The fit is absolutely perfect—hugging my curves in all the right places without feeling too tight or uncomfortable.",
      images: [
        "/Rectangle-23961.png",
        "/Rectangle-23962.png",
      ],
    },
  },

  {
    id: 3,
    productName: "Banarsi Tissue Suit",
    price: "$130",
    image: "/Rectangle-23959.png",
    statusTitle: "Order Completed on 29 Dec 2024",
    statusDescription: "Order was delivered successfully",
    status: "delivered",

    review: {
      rating: 0,
      action: "Add a review",
      images: [],
    },

    timeline: [
      { id: 1, title: "Order Placed", date: "14 December 2024", status: "completed" },
      { id: 2, title: "Stitching Starts", date: "14 December 2024", status: "completed" },
      { id: 3, title: "Embroidery Started", date: "20 December 2024", status: "completed" },
      { id: 4, title: "Order Shipping", date: "22 December 2024", status: "completed" },
      { id: 5, title: "Order Delivered", date: "29 December 2024", status: "completed" },
    ],
  },
];
