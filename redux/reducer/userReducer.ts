import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
interface CounterState {
  name: string;
  email: string;
  photoURL: string;
}

const initialState: CounterState | null = null;

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      return action.payload;
    },
    removeUser: (state) => {
      Cookies.remove("token");
      return null;
    },
  },
});

export const { setUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
