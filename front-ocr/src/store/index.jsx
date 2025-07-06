import { configureStore } from '@reduxjs/toolkit';
import factureReducer from '../features/facture/factureSlice';
import blReducer from '../features/bl/BLlist';

const store = configureStore({
  reducer: {
    facture: factureReducer,
    bl: blReducer,
  },
});

export default store;
