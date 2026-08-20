import { ProductDetail } from "../../type";

interface Props {
  product: ProductDetail;
}

export default function ProductDetails({ product }: Props) {
  return (
    <section className="mt-10 border-t border-[#E5E5E5] pt-8">

      <h3 className="mb-6 text-lg font-semibold tracking-wide uppercase">
        Product Detail
      </h3>

      <ul className="space-y-4 text-[15px] leading-7 text-[#555]">

        <li>
          • Color: Yellow, Material: Terivoil Cotton, Length:
          Knee Length, 45 Inches
        </li>

        <li>
          • Style: Straight Side Slit, Neck: Round Neck,
          Sleeve: 3/4 Sleeve
        </li>

        <li>
          • Chikankari Embroidery: Bakhiya &amp; Phanda,
          Thread Color: White Color Thread
        </li>

        <li>
         {` • Women's Apparel, Ethnic Wear Pair With:
          Palazzo, Trouser, Jeans &amp; Pant`}
        </li>

        <li>
          • Hand Embroidered Product, dealing with genuinely
          hand crafted products being washed multiple times
          rendering the product free from color bleeding and
          shrinkage.
        </li>

      </ul>

    </section>
  );
}