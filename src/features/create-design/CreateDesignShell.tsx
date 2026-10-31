'use client';

/**
 * The design builder, laid out as the Figma shows it: a white product card on
 * the left holding the styling rail, the garment preview, the price and the
 * CTA, with the option grid on the right.
 *
 * The steps inside that rail are not fixed. They come from GET /designs/config,
 * so a garment type exposing Dupatta gets a Dupatta step with no code change.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  applyPresets,
  clearSelections,
  selectOption,
  setMeasurementProfile,
  setStepIndex,
  startDesign,
} from '@/store/features/createDesignSlice';
import {
  useCreateDesignMutation,
  useGetDesignConfigQuery,
  useGetDesignImagesQuery,
  useQuotePriceMutation,
} from '@/store/api/designApi';
import { useGetMeasurementProfilesQuery } from '@/store/api/measurementApi';
import { useCart } from '@/hooks/useCart';
import type { BuilderStep, DesignGroup, DesignOption, PriceBreakdown } from '@/@types/design';
import { cn } from '@/lib/format';
import { designImageKey } from '@/lib/designImages';
import { GarmentPreviewIllustration } from '@/components/illustrations';

import StepRail, { labelFor } from './StepRail';
import StepTabs from './StepTabs';
import MobileBuilderBar from './MobileBuilderBar';
import PriceSummary from './PriceSummary';
import OptionStep from './steps/OptionStep';
import InstructionsStep from './steps/InstructionsStep';
import ReviewStep from './steps/ReviewStep';
import MeasurementPanel from './panels/MeasurementPanel';
import { useRecolouredPreview } from './useRecolouredPreview';
import { useStepInUrl } from './useStepInUrl';
import RecolourOverlay, { TokenBalanceChip } from './RecolourOverlay';
import { useGetWalletQuery } from '@/store/api/tokenApi';
import { useCreditsEnabled } from '@/store/api/settingsApi';
import { useAuth } from '@/features/auth/useAuth';
import TokenWalletButton from '@/features/tokens/TokenWalletButton';
import { LIVE } from '@/lib/liveUpdates';

interface Props {
  garmentTypeId?: string;
  productId?: string;
}

/**
 * A standard size means the garment is cut to a size chart, so body
 * measurements are not needed. Only this option requires them.
 */
const CUSTOM_SIZE_LABEL = 'Custom Measurement';

/**
 * The steps in the order the Design Builder set, the same order the server
 * checks pairing in (`stepOrder`, baliye-node services/customization.ts).
 * Pairing works both ways, so any order is valid: Embroidery before Neck
 * narrows the necks to the embroidery's; after it, the embroidery list.
 */
function orderGroups(groups: DesignGroup[]): DesignGroup[] {
  return [...groups].sort((a, b) => a.position - b.position);
}

/**
 * Narrows each step to the options that suit every choice made in an earlier
 * step. Pairing works both ways: A suits B when A's pairs in B's step (if it
 * has any there) include B, and B's pairs in A's step include A. So Colour and
 * Neck narrow the Embroidery list, and the chosen embroidery narrows Sleeve,
 * Length, Lower and Dupatta. Each step is checked on its own, so the neck and
 * the sleeve must both fit.
 *
 * Same rule as the server's `isPairable` (baliye-node services/customization.ts),
 * which also drops options that could never be completed on this garment.
 */
function filterByPairing(ordered: DesignGroup[], selections: Record<string, string | undefined>): DesignGroup[] {
  const groupOf = new Map<string, string>();
  const byId = new Map<string, DesignOption>();
  for (const g of ordered) {
    for (const o of g.options) {
      groupOf.set(o._id, g._id);
      byId.set(o._id, o);
    }
  }
  const pairsIn = (o: DesignOption, groupId: string) => (o.pairsWith ?? []).filter((id) => groupOf.get(id) === groupId);

  return ordered.map((group, rank) => {
    const earlier = ordered
      .slice(0, rank)
      .map((g) => byId.get(selections[g._id] ?? ''))
      .filter((o): o is DesignOption => Boolean(o));
    return {
      ...group,
      options: group.options.filter((option) =>
        earlier.every((chosen) => {
          const mine = pairsIn(option, groupOf.get(chosen._id) ?? '');
          if (mine.length && !mine.includes(chosen._id)) return false;
          const theirs = pairsIn(chosen, group._id);
          return !theirs.length || theirs.includes(option._id);
        })
      ),
    };
  });
}

/**
 * Shown while the design options load. Usually a second; after a quiet spell
 * the server has to wake up first, which can take much longer — so after a
 * few seconds it says so, rather than leaving grey boxes that look frozen.
 */
function BuilderLoading() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-375">
        <p className="mb-6 flex items-center gap-2 text-sm text-[#6B6B6B]" role="status">
          <span className="size-4 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary" aria-hidden />
          {slow
            ? 'Still loading — the first visit after a quiet spell can take up to a minute. Thanks for waiting.'
            : 'Loading the designer…'}
        </p>
        <div className="grid animate-pulse gap-8 lg:grid-cols-2">
          <div className="h-140 rounded-2xl bg-black/5" />
          <div className="h-140 rounded-2xl bg-black/5" />
        </div>
      </div>
    </main>
  );
}

export default function CreateDesignShell({ garmentTypeId, productId }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { add, isAdding } = useCart();
  const { isAuthenticated, openLogin } = useAuth();

  const { selections, stepIndex, measurementProfileId, instructions, designName } =
    useAppSelector((s) => s.createDesign);

  const [pricing, setPricing] = useState<PriceBreakdown | null>(null);
  const [error, setError] = useState<string | null>(null);
  /* The fallback preview file may not exist; show the illustration instead
     of a broken-image icon. */
  const [previewFailed, setPreviewFailed] = useState(false);
  const optionsRef = useRef<HTMLElement>(null);

  const { data: config, isLoading } = useGetDesignConfigQuery(
    { garmentTypeId, productId },
    /* Always current: options, prices and rules are edited in the admin panel. */
    LIVE
  );
  const { data: designImages = {} } = useGetDesignImagesQuery(undefined, LIVE);
  const { data: profiles = [] } = useGetMeasurementProfilesQuery();
  const [quotePrice] = useQuotePriceMutation();
  const [createDesign, { isLoading: isSaving }] = useCreateDesignMutation();

  useEffect(() => {
    dispatch(startDesign({ garmentTypeId, productId }));
  }, [dispatch, garmentTypeId, productId]);

  /**
   * Seed from the product's presets — but only for groups this product
   * actually exposes.
   *
   * A pre-designed product carries presets for every group it was built with,
   * including ones the customer cannot change. Seeding those too meant sending
   * selections for unconfigured groups, which the API rejects with "one of the
   * selected options is not part of this design".
   */
  useEffect(() => {
    if (!config?.presetSelections.length) return;

    const configured = new Set(config.groups.map((group) => group._id));
    const relevant = config.presetSelections.filter((preset) =>
      configured.has(preset.groupId)
    );

    if (relevant.length) dispatch(applyPresets(relevant));
  }, [config, dispatch]);

  /** Only ever send selections for groups this design actually has. */
  const payloadSelections = useMemo(() => {
    if (!config) return [];
    const configured = new Set(config.groups.map((group) => group._id));

    return Object.entries(selections)
      .filter(([groupId]) => configured.has(groupId))
      .map(([groupId, optionId]) => ({ groupId, optionId }));
  }, [config, selections]);

  /** The size group, if this garment has one. */
  const sizeGroup = useMemo(
    () => config?.groups.find((group) => group.code === 'size') ?? null,
    [config]
  );

  /**
   * True when the customer picked a standard size, so the measurement step is
   * unnecessary. Custom Measurement — or no size group at all — keeps it.
   */
  const usesStandardSize = useMemo(() => {
    if (!sizeGroup) return false;
    const chosenId = selections[sizeGroup._id];
    if (!chosenId) return false;

    const chosen = sizeGroup.options.find((option) => option._id === chosenId);
    return Boolean(chosen && chosen.label !== CUSTOM_SIZE_LABEL);
  }, [sizeGroup, selections]);

  /**
   * Groups in step order, with visibility worked out from the live selections
   * (so "Full Sleeve" reveals Sleeve Cuff the moment it's picked, rather than
   * only after a reload) and each group's options narrowed by pairing rules
   * (Embroidery → only designs that suit the chosen Colour and Neck Type;
   * Sleeve, Length, Lower, Dupatta → only what the chosen embroidery goes with).
   */
  const groups = useMemo(() => {
    if (!config) return [];
    return filterByPairing(orderGroups(config.groups), selections).map((group) => ({
      ...group,
      isVisible: group.dependsOn
        ? group.dependsOn.optionIds.includes(selections[group.dependsOn.groupId] ?? '')
        : group.isVisible,
    }));
  }, [config, selections]);

  const steps: BuilderStep[] = useMemo(() => {
    if (!config) return [];

    const optionSteps: BuilderStep[] = groups
      .filter((group) => group.isVisible)
      .map((group) => ({ kind: 'option', group }));

    return [
      ...optionSteps,
      ...(usesStandardSize ? [] : ([{ kind: 'measurement' }] as BuilderStep[])),
      { kind: 'instructions' },
      { kind: 'review' },
    ];
  }, [config, groups, usesStandardSize]);

  /* Dropping the measurement step can leave the pointer past the end. */
  useEffect(() => {
    if (steps.length && stepIndex > steps.length - 1) {
      dispatch(setStepIndex(steps.length - 1));
    }
  }, [steps.length, stepIndex, dispatch]);

  /**
   * Clearing a parent selection must clear anything that depended on it, or a
   * now-hidden group keeps a price the customer cannot see or change.
   */
  useEffect(() => {
    if (!config) return;

    const orphaned = groups
      .filter((group) => {
        const chosen = selections[group._id];
        if (!chosen) return false;
        /* Hidden group, or its choice no longer pairs with the rest — e.g.
           the neck was changed and the old embroidery doesn't suit it. */
        return !group.isVisible || !group.options.some((option) => option._id === chosen);
      })
      .map((group) => group._id);

    if (orphaned.length) dispatch(clearSelections(orphaned));
  }, [config, groups, selections, dispatch]);

  /* Re-price on every change. The backend is the source of truth for price. */
  const selectionKey = JSON.stringify(payloadSelections);
  const [pricedFor, setPricedFor] = useState<string | null>(null);
  useEffect(() => {
    if (!config) return;

    quotePrice({ garmentTypeId, productId, selections: payloadSelections })
      .unwrap()
      .then((quote) => {
        setPricing(quote);
        setPricedFor(JSON.stringify(payloadSelections));
      })
      /* A partial selection fails validation mid-flow — the local estimate
         below covers it. */
      .catch(() => undefined);
  }, [payloadSelections, config, garmentTypeId, productId, quotePrice]);

  /**
   * The price shown. The server's quote when it matches the current choices;
   * otherwise base price plus each chosen option, worked out here. Before,
   * a half-finished design (which the server won't quote) froze the price at
   * its last value — picking Cotton Silk (+₹200) left it at the base price.
   */
  const shownPricing: PriceBreakdown | null = useMemo(() => {
    if (!config) return null;
    if (pricing && pricedFor === selectionKey) return pricing;

    const adjustments = groups.flatMap((group) => {
      const option = group.options.find((o) => o._id === selections[group._id]);
      return option && option.priceModifier > 0 ? [{ label: `${group.label}: ${option.label}`, amount: option.priceModifier }] : [];
    });
    const base = pricing?.basePrice ?? config.basePrice;
    return {
      basePrice: base,
      adjustments,
      discount: 0,
      total: base + adjustments.reduce((sum, a) => sum + a.amount, 0),
      currency: pricing?.currency ?? 'INR',
    };
  }, [config, pricing, pricedFor, selectionKey, groups, selections]);

  const isStepComplete = (index: number) => {
    const step = steps[index];
    if (!step) return false;
    if (step.kind === 'option') return Boolean(selections[step.group._id]);
    if (step.kind === 'measurement') return Boolean(measurementProfileId);
    /* Optional notes count as done once written or passed — not before, or
       the rail said "3 of 10 done" on step 2. */
    if (step.kind === 'instructions') return Boolean(instructions?.trim()) || stepIndex > index;
    return false;
  };

  const isStepReachable = (index: number) =>
    steps.slice(0, index).every((step, i) => {
      if (step.kind === 'option' && !step.group.isRequired) return true;
      if (step.kind === 'instructions') return true;
      return isStepComplete(i);
    });

  /* ?step=fabric — refresh, share and the Back button keep the step. */
  useStepInUrl(steps, stepIndex, isStepReachable);

  const missingStep = steps.findIndex(
    (step, i) =>
      (step.kind === 'option' && step.group.isRequired && !isStepComplete(i)) ||
      (step.kind === 'measurement' && !measurementProfileId)
  );

  const canAddToCart = missingStep === -1 && !isAdding && !isSaving;

  /**
   * Every step change the customer makes goes through here. On phones and
   * tablets the options sit below the preview, so the new step's options are
   * scrolled into view (under the sticky tabs) — otherwise the page stays on
   * the picture and the change looks like nothing happened.
   */
  const goToStep = (index: number) => {
    dispatch(setStepIndex(index));
    if (window.matchMedia('(min-width: 1024px)').matches) return;
    requestAnimationFrame(() => optionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const handleAddToCart = async () => {
    setError(null);

    try {
      const design = await createDesign({
        garmentTypeId,
        productId,
        name: designName || undefined,
        selections: payloadSelections,
        /**
         * Recording the size on the design is what tells order placement this
         * line is cut to a size chart. Without it the backend treats every
         * design as made-to-measure and refuses to place the order.
         */
        sizeOptionId: usesStandardSize
          ? (selections[sizeGroup!._id] ?? undefined)
          : undefined,
        /* Omitted entirely for a standard size — there is no body to fit. */
        measurementProfileId: usesStandardSize
          ? undefined
          : (measurementProfileId ?? undefined),
        instructions: instructions || undefined,
      }).unwrap();

      const result = await add(
        { kind: 'design', customDesignId: design._id, quantity: 1 },
        '/create-your-own-design'
      );

      if (result) router.push('/cart');
    } catch (err) {
      const message = (err as { data?: { message?: string } }).data?.message;
      setError(message ?? 'We could not add this design to your cart.');
    }
  };

  /* A pre-designed product shows its own photo; otherwise the garment's
     preview image from Shopify (key preview/<slug>). */
  const previewImage = config
    ? (config.product?.images?.[0]?.url ?? designImages[designImageKey.preview(config.garmentType.slug)])
    : undefined;

  const colourGroup = config?.groups.find((g) => g.inputType === 'color_select');
  const chosenColourId = colourGroup ? selections[colourGroup._id] : undefined;
  const chosenHex = colourGroup?.options.find((o) => o._id === chosenColourId)?.hex;

  /* The product photo already shows its presets — only ask the AI for
     choices that differ from them. Size never shows in a photo. */
  const previewOptions = useMemo(() => {
    if (!config) return [];
    const presets = new Map(config.presetSelections.map((p) => [p.groupId, p.optionId]));
    return groups.flatMap((group) => {
      if (!group.isVisible || group.code === 'size' || group.inputType === 'size_select') return [];
      const chosen = group.options.find((o) => o._id === selections[group._id]);
      if (!chosen || presets.get(group._id) === chosen._id) return [];
      /* The option's picture, as shown on its card — the AI's reference. */
      const image = chosen.fromStudio
        ? chosen.image
        : (designImages[designImageKey.option(group.code, chosen.value)] ?? chosen.image);
      return [{ optionId: chosen._id, ...(image?.startsWith('https://') && { imageUrl: image }) }];
    });
  }, [config, groups, selections, designImages]);

  /* The admin's switch. Off: AI previews are free and no credit UI shows. */
  const creditsEnabled = useCreditsEnabled();
  const { data: wallet } = useGetWalletQuery(undefined, {
    skip: !creditsEnabled || !isAuthenticated,
    ...LIVE,
  });
  /* Signed in with enough credits: a new design starts by itself. */
  const canSpend = !isAuthenticated
    ? false
    : wallet
      ? wallet.balance >= wallet.costs.recolour
      : undefined;
  const recoloured = useRecolouredPreview(
    previewImage && !previewFailed ? previewImage : undefined,
    previewOptions,
    { credits: creditsEnabled, canSpend }
  );
  /* Back to this exact design after signing in. */
  const signIn = () => openLogin(window.location.pathname + window.location.search);

  if (isLoading || !config) return <BuilderLoading />;

  const activeStep = steps[Math.min(stepIndex, steps.length - 1)];
  const nextStep = stepIndex < steps.length - 1 ? steps[stepIndex + 1] : undefined;

  /**
   * For a step narrowed by pairing: a note naming what it's matched to, or, if
   * an earlier step it depends on has no choice yet, a message sending the
   * customer back to make it. Embroidery is matched to Colour and Neck Type
   * (picked before it); Sleeve, Length, Lower and Dupatta to the embroidery.
   */
  const pairingCopy = (group: DesignGroup): { note?: string; blockedMessage?: string } => {
    const ordered = orderGroups(config.groups);
    const rank = ordered.findIndex((g) => g._id === group._id);
    const earlierSteps = ordered.slice(0, rank);
    const raw = ordered[rank];
    const pairedIds = new Set(raw?.options.flatMap((o) => o.pairsWith ?? []) ?? []);

    /* Earlier steps this step's options are matched to (Colour, Neck Type for Embroidery). */
    const sources = earlierSteps.filter((g) => g.options.some((o) => pairedIds.has(o._id)));
    const unchosen = sources.filter((g) => !selections[g._id]);
    if (unchosen.length) {
      const names = unchosen.map((g) => g.label).join(' and ');
      return { blockedMessage: `Choose your ${names} first. ${group.label} designs are matched to it.` };
    }

    /* Earlier choices that narrow this step: the picked embroidery, for Sleeve. */
    const narrowing = earlierSteps
      .map((g) => g.options.find((o) => o._id === selections[g._id]))
      .filter((o): o is DesignOption => Boolean(o))
      .filter((o) => (o.pairsWith ?? []).some((id) => raw?.options.some((opt) => opt._id === id)));
    const matchedTo = [
      ...sources.map((g) => g.options.find((o) => o._id === selections[g._id])?.label),
      ...narrowing.map((o) => o.label),
    ].filter(Boolean);
    if (!matchedTo.length) return {};
    return { note: `${group.label} options that go with your ${[...new Set(matchedTo)].join(' · ')}` };
  };

  const selectedProfile = profiles.find((p) => p._id === measurementProfileId);

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-28 lg:pb-10">
      <div className="mx-auto w-full max-w-[1500px] px-4 pt-6 md:px-6 md:pt-10">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-dark md:text-3xl">
              {config.product ? `Customise ${config.product.name}` : config.garmentType.name}
            </h1>

            <p className="mt-1 text-sm text-[#6B6B6B]">
              Step {Math.min(stepIndex + 1, steps.length)} of {steps.length}
              {activeStep && <span className="text-dark">{` · ${labelFor(activeStep)}`}</span>}
            </p>
          </div>

          {creditsEnabled && (
            <TokenWalletButton wallet={wallet} isSignedIn={isAuthenticated} onSignIn={signIn} />
          )}
        </header>

        <StepTabs
          steps={steps}
          activeIndex={stepIndex}
          isComplete={isStepComplete}
          isReachable={isStepReachable}
          onSelect={goToStep}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,600px)_minmax(0,1fr)] lg:gap-10">
          {/* ---- Product card: rail, preview, price, CTA ------------------ */}
          {/* min-w-0: a grid column otherwise grows to its widest child (the
              sideways step strip on phones) and pushes the page off-screen. */}
          <section className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col rounded-2xl border border-[#EFE8DE] bg-white p-4 shadow-[0_8px_30px_rgba(27,43,54,0.05)] md:p-6 lg:p-7">
              <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:items-start lg:gap-6">
                {/* Phones and tablets get the sticky StepTabs instead. */}
                <div className="hidden shrink-0 lg:block">
                  <StepRail
                    steps={steps}
                    activeIndex={stepIndex}
                    isComplete={isStepComplete}
                    isReachable={isStepReachable}
                    onSelect={goToStep}
                  />
                </div>

                <div className="flex flex-1 flex-col items-center justify-center">
                  <div className="relative aspect-2/3 w-full max-w-65 overflow-hidden sm:max-w-80 lg:max-w-95 rounded-xl bg-linear-to-b from-[#F7F3ED] to-[#EFE8DE] ring-1 ring-[#EFE8DE]">
                    {previewImage && !previewFailed ? (
                      <>
                        <Image
                          key={recoloured.url ?? previewImage}
                          src={recoloured.url ?? previewImage}
                          alt={config.product?.name ?? config.garmentType.name}
                          fill
                          sizes="(max-width: 768px) 80vw, 380px"
                          /* While a new design is made, the last photo stays as
                             it is (no tint, no dimming): only the pill at the
                             bottom says it's working, and the result replaces
                             the photo when it's ready. */
                          className="animate-fade-in object-cover"
                          priority
                          onError={() => {
                            if (!recoloured.url) setPreviewFailed(true);
                          }}
                        />
                        <RecolourOverlay
                          recoloured={recoloured}
                          tokensEnabled={Boolean(creditsEnabled)}
                          isSignedIn={isAuthenticated}
                          balance={wallet?.balance}
                          cost={wallet?.costs.recolour ?? 1}
                          onSignIn={signIn}
                        />
                      </>
                    ) : (
                      <div className="flex h-full animate-fade-in items-center justify-center p-6">
                        <GarmentPreviewIllustration className="h-full w-auto max-w-full" fill={chosenHex ?? '#FFFFFF'} />
                      </div>
                    )}
                  </div>
                  {creditsEnabled && (
                    <TokenBalanceChip balance={wallet?.balance} cost={wallet?.costs.recolour ?? 1} />
                  )}
                </div>
              </div>

              {/* Phones and tablets: price and Add To Cart live in MobileBuilderBar. */}
              <div className="mt-10 hidden lg:block">
                <PriceSummary pricing={shownPricing} basePrice={config.basePrice} />

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  className={cn(
                    'mt-6 h-12 w-full rounded-md text-[15px] font-medium transition-colors sm:w-64 md:h-14',
                    canAddToCart
                      ? 'bg-secondary text-white hover:bg-secondary/90'
                      : 'cursor-not-allowed bg-[#EDEDED] text-[#B4B4B4]'
                  )}
                >
                  {isSaving || isAdding ? 'Adding…' : 'Add To Cart'}
                </button>

                {missingStep !== -1 && (
                  <button
                    type="button"
                    onClick={() => goToStep(missingStep)}
                    className="mt-3 block text-xs text-[#8B6E54] underline"
                  >
                    Finish{' '}
                    {steps[missingStep]?.kind === 'option'
                      ? (steps[missingStep] as { group: { label: string } }).group.label
                      : 'measurements'}{' '}
                    to continue
                  </button>
                )}

                {error && <p className="mt-3 text-sm text-secondary">{error}</p>}
              </div>
            </div>
          </section>

          {/* ---- Options panel ------------------------------------------- */}
          {/* scroll-mt: lands below the sticky StepTabs. */}
          <section ref={optionsRef} className="min-w-0 scroll-mt-16">
            {activeStep?.kind === 'option' && (
              <OptionStep
                key={activeStep.group._id}
                group={activeStep.group}
                {...pairingCopy(activeStep.group)}
                tint={chosenHex}
                selectedId={selections[activeStep.group._id]}
                onSelect={(optionId) =>
                  dispatch(selectOption({ groupId: activeStep.group._id, optionId }))
                }
              />
            )}

            {activeStep?.kind === 'measurement' && (
              <MeasurementPanel
                selectedId={measurementProfileId}
                onSelect={(id) => dispatch(setMeasurementProfile(id))}
              />
            )}

            {activeStep?.kind === 'instructions' && <InstructionsStep />}

            {activeStep?.kind === 'review' && (
              <ReviewStep
                groups={groups}
                selections={selections}
                pricing={shownPricing}
                measurementName={
                  usesStandardSize
                    ? 'Standard size — no measurements needed'
                    : selectedProfile?.profileName
                }
                instructions={instructions}
                onEditStep={goToStep}
              />
            )}

            <div className="mt-10 hidden items-center justify-between gap-4 border-t border-[#EFE8DE] pt-6 lg:flex">
              <button
                type="button"
                disabled={stepIndex === 0}
                onClick={() => goToStep(stepIndex - 1)}
                className="inline-flex h-12 items-center gap-1.5 rounded-md border border-[#E4DED4] bg-white px-5 text-sm text-dark transition-colors hover:border-secondary/40 disabled:opacity-40"
              >
                <ChevronLeft size={16} aria-hidden /> Back
              </button>

              {nextStep && (
                <button
                  type="button"
                  disabled={!isStepReachable(stepIndex + 1)}
                  onClick={() => goToStep(stepIndex + 1)}
                  className="inline-flex h-12 items-center gap-1.5 rounded-md bg-secondary px-7 text-sm font-medium text-white transition-colors hover:bg-secondary/90 disabled:opacity-40"
                >
                  Next: {labelFor(nextStep)} <ChevronRight size={16} aria-hidden />
                </button>
              )}
            </div>
          </section>
        </div>
      </div>

      <MobileBuilderBar
        previewUrl={previewImage && !previewFailed ? (recoloured.url ?? previewImage) : undefined}
        isGenerating={recoloured.isGenerating}
        total={shownPricing?.total ?? config.basePrice}
        canGoBack={stepIndex > 0}
        onBack={() => goToStep(stepIndex - 1)}
        error={error}
        hint={
          nextStep && !isStepReachable(stepIndex + 1) && activeStep
            ? `Choose your ${labelFor(activeStep)} to continue`
            : undefined
        }
        action={
          nextStep
            ? {
                label: `Next: ${labelFor(nextStep)}`,
                onClick: () => goToStep(stepIndex + 1),
                disabled: !isStepReachable(stepIndex + 1),
              }
            : missingStep !== -1
              ? { label: `Finish ${labelFor(steps[missingStep])}`, onClick: () => goToStep(missingStep) }
              : {
                  label: isSaving || isAdding ? 'Adding…' : 'Add To Cart',
                  onClick: handleAddToCart,
                  disabled: !canAddToCart,
                  isFinal: true,
                }
        }
      />
    </main>
  );
}
