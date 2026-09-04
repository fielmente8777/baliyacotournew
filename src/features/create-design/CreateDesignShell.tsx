'use client';

/**
 * The design builder, laid out as the Figma shows it: a white product card on
 * the left holding the styling rail, the garment preview, the price and the
 * CTA, with the option grid on the right.
 *
 * The steps inside that rail are not fixed. They come from GET /designs/config,
 * so a garment type exposing Dupatta gets a Dupatta step with no code change.
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
  useQuotePriceMutation,
} from '@/store/api/designApi';
import { useGetMeasurementProfilesQuery } from '@/store/api/measurementApi';
import { useCart } from '@/hooks/useCart';
import type { BuilderStep, PriceBreakdown } from '@/@types/design';
import { cn } from '@/lib/format';

import StepRail from './StepRail';
import PriceSummary from './PriceSummary';
import OptionStep from './steps/OptionStep';
import InstructionsStep from './steps/InstructionsStep';
import ReviewStep from './steps/ReviewStep';
import MeasurementPanel from './panels/MeasurementPanel';

interface Props {
  garmentTypeId?: string;
  productId?: string;
}

/**
 * A standard size means the garment is cut to a size chart, so body
 * measurements are not needed. Only this option requires them.
 */
const CUSTOM_SIZE_LABEL = 'Custom Measurement';

export default function CreateDesignShell({ garmentTypeId, productId }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { add, isAdding } = useCart();

  const { selections, stepIndex, measurementProfileId, instructions, designName } =
    useAppSelector((s) => s.createDesign);

  const [pricing, setPricing] = useState<PriceBreakdown | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: config, isLoading } = useGetDesignConfigQuery({ garmentTypeId, productId });
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

  const steps: BuilderStep[] = useMemo(() => {
    if (!config) return [];

    const optionSteps: BuilderStep[] = config.groups
      .filter((group) => group.isVisible)
      .map((group) => ({ kind: 'option', group }));

    return [
      ...optionSteps,
      ...(usesStandardSize ? [] : ([{ kind: 'measurement' }] as BuilderStep[])),
      { kind: 'instructions' },
      { kind: 'review' },
    ];
  }, [config, usesStandardSize]);

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

    const orphaned = config.groups
      .filter((group) => !group.isVisible && selections[group._id])
      .map((group) => group._id);

    if (orphaned.length) dispatch(clearSelections(orphaned));
  }, [config, selections, dispatch]);

  /* Re-price on every change. The backend is the source of truth for price. */
  useEffect(() => {
    if (!config) return;

    quotePrice({ garmentTypeId, productId, selections: payloadSelections })
      .unwrap()
      .then(setPricing)
      /* A partial selection fails validation mid-flow; keep the last good price. */
      .catch(() => undefined);
  }, [payloadSelections, config, garmentTypeId, productId, quotePrice]);

  const isStepComplete = (index: number) => {
    const step = steps[index];
    if (!step) return false;
    if (step.kind === 'option') return Boolean(selections[step.group._id]);
    if (step.kind === 'measurement') return Boolean(measurementProfileId);
    if (step.kind === 'instructions') return true;
    return false;
  };

  const isStepReachable = (index: number) =>
    steps.slice(0, index).every((step, i) => {
      if (step.kind === 'option' && !step.group.isRequired) return true;
      if (step.kind === 'instructions') return true;
      return isStepComplete(i);
    });

  const missingStep = steps.findIndex(
    (step, i) =>
      (step.kind === 'option' && step.group.isRequired && !isStepComplete(i)) ||
      (step.kind === 'measurement' && !measurementProfileId)
  );

  const canAddToCart = missingStep === -1 && !isAdding && !isSaving;

  const handleAddToCart = async () => {
    setError(null);

    try {
      const design = await createDesign({
        garmentTypeId,
        productId,
        name: designName || undefined,
        selections: payloadSelections,
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

  if (isLoading || !config) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] px-4 py-10 md:px-8">
        <div className="mx-auto grid max-w-[1500px] animate-pulse gap-8 lg:grid-cols-2">
          <div className="h-[560px] rounded-2xl bg-black/5" />
          <div className="h-[560px] rounded-2xl bg-black/5" />
        </div>
      </main>
    );
  }

  const activeStep = steps[Math.min(stepIndex, steps.length - 1)];
  const selectedProfile = profiles.find((p) => p._id === measurementProfileId);
  const previewImage =
    config.product?.images?.[0]?.url ?? '/customization/kurta-preview.png';

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-6 md:py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-[#1B2B36] md:text-3xl">
            {config.product ? `Customise ${config.product.name}` : config.garmentType.name}
          </h1>

          <p className="mt-1 text-sm text-[#6B6B6B]">
            Step {Math.min(stepIndex + 1, steps.length)} of {steps.length}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,600px)_minmax(0,1fr)] lg:gap-10">
          {/* ---- Product card: rail, preview, price, CTA ------------------ */}
          <section className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col rounded-2xl bg-white p-4 md:p-6 lg:p-8">
              <div className="flex flex-1 flex-col gap-6 md:flex-row md:items-start md:gap-6">
                <StepRail
                  steps={steps}
                  activeIndex={stepIndex}
                  isComplete={isStepComplete}
                  isReachable={isStepReachable}
                  onSelect={(i) => dispatch(setStepIndex(i))}
                />

                <div className="flex flex-1 items-center justify-center">
                  <div className="relative aspect-[3/4] w-full max-w-[380px]">
                    <Image
                      src={previewImage}
                      alt={config.product?.name ?? config.garmentType.name}
                      fill
                      sizes="(max-width: 768px) 80vw, 380px"
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 md:mt-10">
                <PriceSummary pricing={pricing} basePrice={config.basePrice} />

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
                    onClick={() => dispatch(setStepIndex(missingStep))}
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
          <section className="min-w-0">
            {activeStep?.kind === 'option' && (
              <OptionStep
                group={activeStep.group}
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
                groups={config.groups}
                selections={selections}
                pricing={pricing}
                measurementName={
                  usesStandardSize
                    ? 'Standard size — no measurements needed'
                    : selectedProfile?.profileName
                }
                instructions={instructions}
                onEditStep={(i) => dispatch(setStepIndex(i))}
              />
            )}

            <div className="mt-8 flex items-center justify-between gap-4">
              <button
                type="button"
                disabled={stepIndex === 0}
                onClick={() => dispatch(setStepIndex(stepIndex - 1))}
                className="h-11 rounded-md border border-[#DDD] px-6 text-sm disabled:opacity-40"
              >
                Back
              </button>

              {stepIndex < steps.length - 1 && (
                <button
                  type="button"
                  disabled={!isStepReachable(stepIndex + 1)}
                  onClick={() => dispatch(setStepIndex(stepIndex + 1))}
                  className="h-11 rounded-md bg-secondary px-8 text-sm font-medium text-white disabled:opacity-40"
                >
                  Continue
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
