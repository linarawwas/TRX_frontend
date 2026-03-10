// action.ts
// Backwards-compatible re-exports of the Redux Toolkit slice actions.

import { defaultsSlice } from "./reducer";

export const { setDefaultProduct, setDefaultLanguage } = defaultsSlice.actions;

