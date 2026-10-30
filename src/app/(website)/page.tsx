import type { Metadata } from "next";
import BehindTheScenes from "./Home/Components/BehindTheScenes";
import Collections from "./Home/Components/Collections";
import DesignOnline from "./Home/Components/DesignOnline";
import FabricLibrary from "./Home/Components/FabricLibrary";
import FoundersMessage from "./Home/Components/FoundersMessage";
import Hero from "./Home/Components/Hero";
import Highlights from "./Home/Components/Highlights";
import Newsletter from "./Home/Components/Newsletter";
import Philosophy from "./Home/Components/Philosophy";
import ReadyToOrder from "./Home/Components/ReadyToOrder";
import Reviews from "./Home/Components/Reviews";
import Silhouettes from "./Home/Components/Silhouettes";
import { homePageData as defaults } from "./Home/pagedata";
import { getSiteContent } from "@/lib/siteContent";

/* Title, description and share image are inherited from app/layout.tsx. */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/* Copy and images are edited in the admin panel; pagedata.tsx holds the defaults.
   Every section but the hero can be switched off there ("Show"). */
export default async function Home() {
  const home = await getSiteContent("home", defaults);

  return (
    <main className="bg-[#FAF7F2]">
      <Hero {...home.hero} />
      {home.highlights.show && <Highlights {...home.highlights} />}
      {home.silhouettes.show && <Silhouettes {...home.silhouettes} />}
      {home.philosophy.show && <Philosophy {...home.philosophy} />}
      {home.designOnline.show && <DesignOnline {...home.designOnline} />}
      {home.products.show && <ReadyToOrder {...home.products} />}
      {home.collections.show && <Collections {...home.collections} />}
      {home.fabrics.show && <FabricLibrary {...home.fabrics} />}
      {home.behindTheScenes.show && <BehindTheScenes {...home.behindTheScenes} />}
      {home.reviews.show && <Reviews {...home.reviews} />}
      {home.foundersMessage.show && <FoundersMessage {...home.foundersMessage} />}
      {home.newsletter.show && <Newsletter {...home.newsletter} />}
    </main>
  );
}
