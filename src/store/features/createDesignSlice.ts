/**
 * UI state for the Create Your Own Design flow.
 *
 * Server data (fabrics, embroidery, measurement profiles) lives in RTK
 * Query. This slice holds only what the user has chosen and which screen
 * is open — the two things RTK Query cannot know.
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { StepSubview, StylingStep } from '@/@types/design';

interface CreateDesignState {
  step: StylingStep;
  subview: StepSubview;
  /** Preview toggle in the top-right of the stage (Stensil-5). */
  showMannequin: boolean;

  selectedFabricId: string | null;
  selectedColourId: string | null;
  selectedEmbroideryId: string | null;
  selectedProfileId: string | null;
}

const initialState: CreateDesignState = {
  step: 'fabric',
  subview: { kind: 'list' },
  showMannequin: false,
  selectedFabricId: null,
  selectedColourId: null,
  selectedEmbroideryId: null,
  selectedProfileId: null,
};

const createDesignSlice = createSlice({
  name: 'createDesign',
  initialState,
  reducers: {
    /** Rail click. Always resets the sub-screen so you can't land inside
     *  "New Measurement" by switching tabs. */
    setStep(state, action: PayloadAction<StylingStep>) {
      state.step = action.payload;
      state.subview = { kind: 'list' };
      if (action.payload !== 'option') state.showMannequin = false;
    },

    setSubview(state, action: PayloadAction<StepSubview>) {
      state.subview = action.payload;
      /** The mannequin only makes sense while entering measurements. */
      if (action.payload.kind === 'list') state.showMannequin = false;
    },

    toggleMannequin(state, action: PayloadAction<boolean | undefined>) {
      state.showMannequin = action.payload ?? !state.showMannequin;
    },

    /** Selecting a fabric expands it into the detail card (Stensil-1). */
    selectFabric(state, action: PayloadAction<string>) {
      const isSame = state.selectedFabricId === action.payload;
      state.selectedFabricId = action.payload;
      if (!isSame) state.selectedColourId = null;
      state.subview = { kind: 'fabricDetail', fabricId: action.payload };
    },

    selectColour(state, action: PayloadAction<string>) {
      state.selectedColourId = action.payload;
    },

    selectEmbroidery(state, action: PayloadAction<string>) {
      state.selectedEmbroideryId = action.payload;
    },

    selectProfile(state, action: PayloadAction<string>) {
      state.selectedProfileId = action.payload;
    },

    resetDesign: () => initialState,
  },
});

export const {
  setStep,
  setSubview,
  toggleMannequin,
  selectFabric,
  selectColour,
  selectEmbroidery,
  selectProfile,
  resetDesign,
} = createDesignSlice.actions;

export default createDesignSlice.reducer;
