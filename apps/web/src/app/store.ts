import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../feature/auth/authSlice";
import submissionReducer from "../feature/submissions/submissionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    submissions: submissionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
