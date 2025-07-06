// src/features/facture/factureSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const fetchFactures = createAsyncThunk("facture/fetchFactures", async () => {
  const response = await axios.get(`${API_URL}/factures`);
  return response.data;
});

const factureSlice = createSlice({
  name: "facture",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFactures.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFactures.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchFactures.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default factureSlice.reducer;