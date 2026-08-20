export const createDesignData = {
  previewImage: "/customization/kurta.png",

  cart: {
    totalItems: 1,
    totalPrice: "₹23,170",
  },

  activeStep: "fabric",
};


export interface Fabric {
  id: number;
  name: string;
  image: string;
  price?: string;
}

export const fabrics: Fabric[] = [
  {
    id: 1,
    name: "Cotton",
    image: "/fabric/cotton.png",
  },
  {
    id: 2,
    name: "Silk",
    image: "/fabric/silk.png",
  },
  {
    id: 3,
    name: "Wool",
    image: "/fabric/wool.png",
  },
  {
    id: 4,
    name: "Cashmere",
    image: "/fabric/cashmere.png",
  },
  {
    id: 5,
    name: "Satin",
    image: "/fabric/satin.png",
  },
  {
    id: 6,
    name: "Kanjivaram Silk",
    image: "/fabric/kanjivaram.png",
  },
  {
    id: 7,
    name: "Linen",
    image: "/fabric/linen.png",
  },
  {
    id: 8,
    name: "Velvet",
    image: "/fabric/velvet.png",
  },
  {
    id: 9,
    name: "Georgette",
    image: "/fabric/georgette.png",
  },
  {
    id: 10,
    name: "Denim",
    image: "/fabric/denim.png",
    price: "$8-$10 per meter",
  },
  {
    id: 11,
    name: "Rayon",
    image: "/fabric/rayon.png",
  },
  {
    id: 12,
    name: "Spandex",
    image: "/fabric/spandex.png",
  },
];