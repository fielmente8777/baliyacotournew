'use client';

/**
 * Decides which screen the customer sees.
 *
 *   ?product=<id>      customizing a pre-designed product — straight into the
 *                      builder, garment type and presets come from the product
 *   ?garmentType=<id>  designing from scratch
 *   neither            the garment type picker
 */

import { useSearchParams } from 'next/navigation';

import CreateDesignShell from './CreateDesignShell';
import GarmentTypePicker from './GarmentTypePicker';

export default function CreateDesignEntry() {
  const searchParams = useSearchParams();

  const productId = searchParams.get('product') ?? undefined;
  const garmentTypeId = searchParams.get('garmentType') ?? undefined;

  if (!productId && !garmentTypeId) return <GarmentTypePicker />;

  return <CreateDesignShell productId={productId} garmentTypeId={garmentTypeId} />;
}
