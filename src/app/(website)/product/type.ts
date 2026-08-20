export interface ProductImage {
  src: string;
  alt: string;
}

export interface ProductDetail {
  id: number;
  name: string;
  price: string;
  description: string;
  images: ProductImage[];
}