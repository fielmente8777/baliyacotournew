import LeftSidebar from "./LeftSidebar";
import ProductPreview from "./ProductPreview";
import CartSummary from "./CartSummary";
import RightPanel from "./RightPanel";

interface Props {
  data: {
    previewImage: string;
    activeStep: string;
    cart: {
      totalItems: number;
      totalPrice: string;
    };
  };
}

export default function CreateDesignLayout({
  data,
}: Props) {
  return (
    <main className="min-h-screen bg-[#FAF7F2]">

      <div
        className="
        container
        mx-auto
        px-6
        py-10

        grid
        gap-12

        xl:grid-cols-[90px_520px_1fr]
      "
      >
        <LeftSidebar
          active={data.activeStep}
        />

        <div className="flex flex-col">

          <div className="flex-1">

            <ProductPreview
              image={data.previewImage}
            />

          </div>

          <CartSummary
            totalItems={data.cart.totalItems}
            totalPrice={data.cart.totalPrice}
          />

        </div>

        <RightPanel />

      </div>

    </main>
  );
}