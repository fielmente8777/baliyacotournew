/** Reviews. Mirrors baliye-node models/review.ts. */

export interface Review {
  _id: string;
  userId: string;
  orderId: string;
  productId?: string;
  customDesignId?: string;
  rating: number;
  title?: string;
  body?: string;
  images: string[];
  isApproved: boolean;
  createdAt: string;
}

export interface SaveReviewBody {
  orderId: string;
  productId?: string;
  customDesignId?: string;
  rating: number;
  title?: string;
  body?: string;
  images?: string[];
}
