'use client';

/**
 * The design builder.
 *
 * Everything is derived from GET /designs/config: which steps exist, their
 * order, which are required and which are hidden behind a dependency. Adding
 * "Dupatta" to a garment type in the dashboard makes it appear here with no
 * frontend change.
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
import { cn, formatINR } from '@/lib/format';

import StepRail from './StepRail';
import OptionStep from './steps/OptionStep';
import InstructionsStep from './steps/InstructionsStep';
import ReviewStep from './steps/ReviewStep';
import MeasurementPanel from './panels/MeasurementPanel';

interface Props {
  garmentTypeId?: string;
  productId?: string;
}

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

  /* A customized product starts from what the team already configured. */
  useEffect(() => {
    if (config?.presetSelections.length) dispatch(applyPresets(config.presetSelections));
  }, [config, dispatch]);

  /** Option groups the server says are visible, plus the builder's own steps. */
  const steps: BuilderStep[] = useMemo(() => {
    if (!config) return [];

    const optionSteps: BuilderStep[] = config.groups
      .filter((group) => group.isVisible)
      .map((group) => ({ kind: 'option', group }));

    return [
      ...optionSteps,
      { kind: 'measurement' },
      { kind: 'instructions' },
      { kind: 'review' },
    ];
  }, [config]);

  /**
   * Clearing a parent selection must clear anything that depended on it,
   * otherwise a now-hidden group keeps a value the customer can't see.
   */
  useEffect(() => {
    if (!config) return;

    const orphaned = config.groups
      .filter((group) => !group.isVisible && selections[group._id])
      .map((group) => group._id);

    if (orphaned.length) dispatch(clearSelections(orphaned));
  }, [config, selections, dispatch]);

  /* Re-price whenever a selection changes. The backend is the source of truth. */
  useEffect(() => {
    if (!config) return;

    const payload = Object.entries(selections).map(([groupId, optionId]) => ({
      groupId,
      optionId,
    }));

    quotePrice({ garmentTypeId, productId, selections: payload })
      .unwrap()
      .then(setPricing)
      /* A partial selection can fail validation mid-flow; keep the last good price. */
      .catch(() => undefined);
  }, [selections, config, garmentTypeId, productId, quotePrice]);

  const isStepComplete = (index: number) => {
    const step = steps[index];
    if (!step) return false;
    if (step.kind === 'option') return Boolean(selections[step.group._id]);
    if (step.kind === 'measurement') return Boolean(measurementProfileId);
    if (step.kind === 'instructions') return true;
    return false;
  };

  /** A step is reachable once every required step before it is satisfied. */
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
        selections: Object.entries(selections).map(([groupId, optionId]) => ({
          groupId,
          optionId,
        })),
        measurementProfileId: measurementProfileId ?? undefined,
        instructions: instructions || undefined,
      }).unwrap();

      const result = await add(
        { kind: 'design', customDesignId: design._id, quantity: 1 },
        '/create-your-own-design'
      );

      /* null means we redirected to login; the design is saved either way. */
      if (result) router.push('/cart');
    } catch (err) {
      const message = (err as { data?: { message?: string } }).data?.message;
      setError(message ?? 'We could not add this design to your cart.');
    }
  };

  if (isLoading || !config) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-[1500px] animate-pulse space-y-6">
          <div className="h-8 w-64 rounded bg-black/5" />
          <div className="h-96 rounded-2xl bg-black/5" />
        </div>
      </main>
    );
  }

  const activeStep = steps[Math.min(stepIndex, steps.length - 1)];
  const selectedProfile = profiles.find((p) => p._id === measurementProfileId);
  const productImage = config.product?.images?.[0]?.url;

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-6 md:py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-dark md:text-3xl">
            {config.product ? `Customise ${config.product.name}` : config.garmentType.name}
          </h1>

          <p className="mt-1 text-sm text-[#6B6B6B]">
            Step {Math.min(stepIndex + 1, steps.length)} of {steps.length}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_320px] lg:gap-8">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <StepRail
              steps={steps}
              activeIndex={stepIndex}
              isComplete={isStepComplete}
              isReachable={isStepReachable}
              onSelect={(i) => dispatch(setStepIndex(i))}
            />
          </div>

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
                measurementName={selectedProfile?.profileName}
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

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl bg-white p-5">
              {productImage && (
                <div className="relative mb-4 aspect-[3/4] w-full overflow-hidden rounded-lg">
                  <Image
                    src={productImage}
                    alt={config.product?.name ?? ''}
                    fill
                    sizes="320px"
                    className="object-cover"
                  />
                </div>
              )}

              <p className="text-sm text-[#6B6B6B]">Your price</p>

              <p className="mt-1 text-3xl font-bold text-dark">
                {formatINR((pricing?.total ?? config.basePrice) / 100)}
              </p>

              {pricing && pricing.adjustments.length > 0 && (
                <ul className="mt-4 space-y-1.5 text-sm text-[#6B6B6B]">
                  {pricing.adjustments.map((adjustment) => (
                    <li key={adjustment.label} className="flex justify-between gap-3">
                      <span className="truncate">{adjustment.label}</span>
                      <span>+ {formatINR(adjustment.amount / 100)}</span>
                    </li>
                  ))}
                </ul>
              )}

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className={cn(
                  'mt-6 h-12 w-full rounded-md text-sm font-medium transition-colors',
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
                  className="mt-3 w-full text-center text-xs text-[#8B6E54] underline"
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
          </aside>
        </div>
      </div>
    </main>
  );
}
