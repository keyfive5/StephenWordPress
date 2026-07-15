"use client";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  email: null,
  role: null,
  name: null,
  image: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const { token, email, role, name, image } = action.payload;
      state.token = token;
      state.email = email;
      state.role = role;
      state.image = image;
      state.name = name;
    },
    logout: (state) => {
      state.token = null;
      state.email = null;
      state.role = null;
      state.image = null;
      state.name = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
