import { createSlice } from "@reduxjs/toolkit";

const blSlice = createSlice({
  name: "bl",
  initialState: {
    list: [],
  },
  reducers: {
    setBLs: (state, action) => {
      state.list = action.payload;
    },
  },
});

export const { setBLs } = blSlice.actions;
export default blSlice.reducer;
