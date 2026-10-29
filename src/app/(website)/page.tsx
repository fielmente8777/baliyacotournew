import type { Metadata } from "next";
import VideoBanner from "@/components/banners/VideoBanner";
import BehindTheScenes from "./Home/Components/BehindTheScenes";
import BestSellers from "./Home/Components/BestSellers";
import Categories from "./Home/Components/Categories";
import DesignProcess from "./Home/Components/DesignProcess";
import FoundersMessage from "./Home/Components/FoundersMessage";
import PreMadeDesigns from "./Home/Components/PreMadeDesigns";
import Steps from "./Home/Components/Steps";
import { homePageData as defaults } from "./Home/pagedata";
import { getSiteContent } from "@/lib/siteContent";

/* Title, description and share image are inherited from app/layout.tsx. */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/* Copy and images are edited in the admin panel; pagedata.tsx holds the defaults. */
export default async function Home() {
  const homePageData = await getSiteContent("home", defaults);

  return (
    <main className="bg-[#FAF7F2]">
      <VideoBanner {...homePageData.hero} />
      <Categories {...homePageData.categories} />
      <DesignProcess {...homePageData.designProcess} />
      <Steps {...homePageData.steps} />
      <PreMadeDesigns {...homePageData.preMadeDesigns} />
      <BestSellers {...homePageData.bestSellers} />
      <BehindTheScenes {...homePageData.behindTheScenes} />
      <FoundersMessage {...homePageData.foundersMessage} />
    </main>
  );
}
