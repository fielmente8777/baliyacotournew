'use client';

/**
 * Responsive two-pane layout.
 *
 *   < 1024px  single column — stage first, options below
 *   >= 1024px stage sticky on the left, options scroll on the right
 *
 * The stage is sticky rather than fixed so short viewports can still
 * scroll it out of the way instead of trapping the page.
 */

import OptionsPanel from './OptionsPanel';
import ProductStage from './stage/ProductStage';

export default function CreateDesignShell() {
  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6 md:py-10 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,620px)_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-24">
            <ProductStage />
          </div>

          <div className="pb-10">
            <OptionsPanel />
          </div>
        </div>
      </div>
    </main>
  );
}
