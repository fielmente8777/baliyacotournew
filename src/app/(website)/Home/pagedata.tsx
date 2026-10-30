/**
 * The home page's words and pictures. Edited in the admin panel
 * (Admin → Home page); these are the defaults it starts from and falls back
 * to, section by section. The admin form is built from this shape, so a
 * field added here gets an editor automatically.
 *
 *   title + titleAccent   the accent words show in burgundy after the title
 *   show                  hides the whole section when switched off
 *
 * Product names, prices and photos come from Shopify; the fabric library's
 * fabrics and prices from the Design Builder. Only the words and pictures
 * around them live here.
 */
export const homePageData = {
  hero: {
    eyebrow: "Handcrafted · Made to measure",
    title: "Woven from your",
    titleAccent: "Imagination",
    description:
      "From lehengas to kurtis, Baliye crafts pieces that are uniquely yours. Choose the fabric, the colour and the embroidery, and we stitch it to your measurements.",
    image: "/175-1.png",
    cta: {
      label: "Design Your Dress",
      link: "/create-your-own-design",
    },
    secondaryCta: {
      label: "Shop Pre-made",
      link: "/products",
    },
    /** The small card on the photo. Name and price come live from the Shopify product with this handle. */
    featured: {
      show: true,
      label: "Bestseller",
      productHandle: "embroidered-sharara-set-dusty-pink",
    },
  },

  highlights: {
    show: true,
    items: [
      { title: "Stitched to your size", text: "Cut to your measurements, every piece" },
      { title: "10+ fabrics", text: "Cotton to velvet and premium silk" },
      { title: "Made only when you order", text: "Nothing sits in a warehouse" },
      { title: "Made with care", text: "Finished by hand by our tailors" },
    ],
  },

  silhouettes: {
    show: true,
    eyebrow: "Shop by silhouette",
    title: "Find your",
    titleAccent: "shape",
    linkLabel: "View all designs",
    /** Price and count come from the Shopify products of each type; the picture falls back to one of them. */
    items: [
      { title: "Sharara Sets", productType: "Sharara Set", image: "" },
      { title: "Anarkali Suits", productType: "Anarkali Suit", image: "" },
      { title: "Kurtis", productType: "Kurti", image: "" },
      { title: "Patiala Suits", productType: "Patiala Suit", image: "" },
    ],
  },

  philosophy: {
    show: true,
    title: "We don't make sizes.",
    titleAccent: "We make yours.",
    description:
      "Traditional artistry, modern design, and a fit that belongs to one woman only. From sharara sets and anarkalis to kurtis and suits, every piece is crafted with intricate detail and premium fabrics, for weddings, festivals and every occasion in between.",
  },

  /** The picture shows inside a laptop frame: a 16:10 screenshot of the designer works best. */
  designOnline: {
    show: true,
    eyebrow: "Made to measure",
    title: "A perfect fit,",
    titleAccent: "designed online",
    description:
      "Skip the size chart. Pick your garment, fabric, colour, neckline and embroidery, and watch the price update with every choice. Add your measurements once, and our artisans cut and stitch your piece to fit you exactly.",
    image: "/home/designer-screen.jpg",
    cta: {
      label: "Try the designer",
      link: "/create-your-own-design",
    },
  },

  products: {
    show: true,
    eyebrow: "Pre-made designs",
    title: "Ready to",
    titleAccent: "order",
    /** Each tab shows the Shopify products with this tag. */
    tabs: [
      { label: "Bestsellers", tag: "bestseller" },
      { label: "Editor's picks", tag: "editors-pick" },
      { label: "Customisable", tag: "custom" },
    ],
    button: {
      label: "Shop all designs",
      link: "/products",
    },
    /** Fills the row when a tab has fewer than four designs. */
    promo: {
      eyebrow: "Made for you",
      title: "Didn't find the one?",
      titleAccent: "Design it from scratch.",
      description: "Pick a garment and we'll walk you through the rest, from the first thread to the final stitch.",
      cta: {
        label: "Start designing",
        link: "/create-your-own-design",
      },
    },
  },

  collections: {
    show: true,
    main: {
      eyebrow: "The collection",
      title: "Pre-made",
      titleAccent: "Designs",
      description:
        "Ready-to-order pieces from our atelier. Wear them as they are, or make them yours with your choice of fabric, colour and embroidery.",
      image: "/Rectangle-23961.png",
      cta: {
        label: "Explore the designs",
        link: "/products",
      },
    },
    side: {
      eyebrow: "Customisable",
      title: "The Bridal",
      titleAccent: "Edit",
      description: "Bridal sharara sets and anarkalis, made to your measurements.",
      image: "/Rectangle-23962.png",
      cta: {
        label: "Shop the edit",
        link: "/products?tag=bridal",
      },
    },
  },

  /** The fabrics, their prices and swatch pictures come from the Design Builder. */
  fabrics: {
    show: true,
    eyebrow: "The fabric library",
    title: "10+ fabrics,",
    titleAccent: "new every season",
    description: "Pick one when you design, and the price adjusts as you go.",
    cta: {
      label: "Start with a fabric",
      link: "/create-your-own-design",
    },
  },

  behindTheScenes: {
    show: true,
    eyebrow: "Behind the scenes",
    title: "Every thread,",
    titleAccent: "by hand",
    description:
      "The weavers, pattern makers, embroiderers and tailors who make every Baliye piece by hand. Nothing is cut until you order.",
    cta: {
      label: "Design your own",
      link: "/create-your-own-design",
    },
    /** Six photos fill the mosaic: tall, small, small, tall, short, medium. */
    photos: [
      { image: "/image-3.png", caption: "Handloom weaving" },
      { image: "/image-4.png", caption: "Hand embroidery" },
      { image: "/image-5.png", caption: "Cutting to measure" },
      { image: "/image-6.png", caption: "Block printing" },
      { image: "/image-7.png", caption: "On the loom" },
      { image: "/image-8.png", caption: "Tailoring" },
    ],
    steps: [
      { title: "Cut to you", description: "Your measurements, not a size chart. Nothing is cut until you order." },
      { title: "Embroidered by hand", description: "In the style you chose, by our embroiderers, one stitch at a time." },
      { title: "Stitched and delivered", description: "Our tailors finish your piece by hand and send it to your door." },
    ],
  },

  /** Off until real customer photos and reviews are added. */
  reviews: {
    show: false,
    eyebrow: "Style gallery",
    title: "Worn by",
    titleAccent: "you",
    button: {
      label: "Share your look",
      link: "https://www.instagram.com/",
    },
    gallery: [
      { image: "/Rectangle-23959.png", caption: "Customer name in Floor Length Anarkali" },
      { image: "/Rectangle-23961.png", caption: "Customer name in Bridal Anarkali" },
      { image: "/Rectangle-23962.png", caption: "Customer name in Royal Patiala Suit" },
      { image: "/Rectangle-23963.png", caption: "Customer name in Georgette Anarkali" },
      { image: "/175-1.png", caption: "Customer name in Embroidered Sharara Set" },
    ],
    items: [
      { quote: "A real customer review about the fit.", name: "Name, City", product: "Embroidered Sharara Set" },
      { quote: "A real customer review about the fabric.", name: "Name, City", product: "Chikankari Kurti" },
      { quote: "A real customer review about designing her own piece.", name: "Name, City", product: "Custom Anarkali Suit" },
    ],
  },

  foundersMessage: {
    show: true,
    eyebrow: "A note from the founders",
    quote:
      "We founded Baliye with one simple goal: to help you express your unique style through custom clothing. Each piece is made with care, quality and a personal touch, so it's as distinctive as you are.",
    description: "Thank you for choosing us to be part of your style journey. We can't wait to see what you create.",
    signature: "The founders, Baliye Couture",
    image: "/image-2.png",
  },

  /** Sign-ups are listed under Admin → Newsletter. */
  newsletter: {
    show: true,
    title: "First look at new",
    titleAccent: "fabrics & designs",
    description: "Join the list for new fabrics, new designs and early access to every season.",
    placeholder: "you@example.com",
    buttonLabel: "Sign up",
    successMessage: "Thank you. You're on the list.",
  },
};

export type HomePageContent = typeof homePageData;
