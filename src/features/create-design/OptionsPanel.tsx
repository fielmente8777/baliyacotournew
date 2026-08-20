'use client';

/**
 * Right pane router. One switch over (step, subview) — the only place
 * that decides which panel is on screen.
 */

import { useAppSelector } from '@/store/hooks';
import EmbroideryPanel from './panels/EmbroideryPanel';
import FabricPanel from './panels/FabricPanel';
import MeasurementForm from './panels/MeasurementForm';
import MeasurementPanel from './panels/MeasurementPanel';

export default function OptionsPanel() {
  const { step, subview } = useAppSelector((s) => s.createDesign);

  if (step === 'fabric') return <FabricPanel />;
  if (step === 'embroidery') return <EmbroideryPanel />;

  return subview.kind === 'newMeasurement' || subview.kind === 'editMeasurement' ? (
    <MeasurementForm />
  ) : (
    <MeasurementPanel />
  );
}
