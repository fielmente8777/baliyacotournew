/**
 * Builder state for Create Your Own Design.
 *
 * Holds only what the customer has chosen and where they are in the flow. The
 * steps themselves, the options inside them and the price all come from the
 * API — this slice never knows what "fabric" or "neck" means.
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SelectionInput } from '@/@types/design';

interface CreateDesignState {
  /** One of these is set; the other stays null. */
  garmentTypeId: string | null;
  productId: string | null;

  /** groupId → optionId. A map, because groups are data, not a fixed list. */
  selections: Record<string, string>;

  /** Index into the resolved step list, option groups first. */
  stepIndex: number;

  measurementProfileId: string | null;
  instructions: string;
  designName: string;
}

const initialState: CreateDesignState = {
  garmentTypeId: null,
  productId: null,
  selections: {},
  stepIndex: 0,
  measurementProfileId: null,
  instructions: '',
  designName: '',
};

const createDesignSlice = createSlice({
  name: 'createDesign',
  initialState,
  reducers: {
    /** Entering the builder from the garment picker or a product page. */
    startDesign(
      state,
      action: PayloadAction<{ garmentTypeId?: string; productId?: string }>
    ) {
      const isSameContext =
        state.garmentTypeId === (action.payload.garmentTypeId ?? null) &&
        state.productId === (action.payload.productId ?? null);

      /* Re-entering the same design keeps progress; a different one resets. */
      if (isSameContext) return;

      return {
        ...initialState,
        garmentTypeId: action.payload.garmentTypeId ?? null,
        productId: action.payload.productId ?? null,
      };
    },

    /** Seeds the map from a product's preset selections, without clobbering
     *  anything the customer has already changed. */
    applyPresets(state, action: PayloadAction<SelectionInput[]>) {
      for (const preset of action.payload) {
        if (!state.selections[preset.groupId]) {
          state.selections[preset.groupId] = preset.optionId;
        }
      }
    },

    selectOption(state, action: PayloadAction<{ groupId: string; optionId: string }>) {
      state.selections[action.payload.groupId] = action.payload.optionId;
    },

    /** Clearing a parent must clear its dependants, or a hidden group keeps a
     *  value the customer can no longer see or change. */
    clearSelections(state, action: PayloadAction<string[]>) {
      for (const groupId of action.payload) delete state.selections[groupId];
    },

    setStepIndex(state, action: PayloadAction<number>) {
      state.stepIndex = Math.max(0, action.payload);
    },

    setMeasurementProfile(state, action: PayloadAction<string | null>) {
      state.measurementProfileId = action.payload;
    },

    setInstructions(state, action: PayloadAction<string>) {
      state.instructions = action.payload;
    },

    setDesignName(state, action: PayloadAction<string>) {
      state.designName = action.payload;
    },

    resetDesign: () => initialState,
  },
});

export const {
  startDesign,
  applyPresets,
  selectOption,
  clearSelections,
  setStepIndex,
  setMeasurementProfile,
  setInstructions,
  setDesignName,
  resetDesign,
} = createDesignSlice.actions;

export default createDesignSlice.reducer;
