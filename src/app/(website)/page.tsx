import VideoBanner from "@/components/banners/VideoBanner";
import BehindTheScenes from "./Home/Components/BehindTheScenes";
import BestSellers from "./Home/Components/BestSellers";
import Categories from "./Home/Components/Categories";
import DesignProcess from "./Home/Components/DesignProcess";
import FoundersMessage from "./Home/Components/FoundersMessage";
import PreMadeDesigns from "./Home/Components/PreMadeDesigns";
import Steps from "./Home/Components/Steps";
import { homePageData } from "./Home/pagedata";

export default function Home() {
  return (
    <main>
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
