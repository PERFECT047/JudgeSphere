import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction, Action, SerializedError } from "@reduxjs/toolkit"
import type { UserDto, AuthResponseDto, RefreshTokenResponseDto } from "@repo/dto";

interface AuthState {
  user: UserDto | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
};

interface RejectedAction extends Action {
  payload?: string;
  error?: SerializedError;
}

const isActionType = (action: Action, type: string) => action.type === type;

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // --- loginUser ---
      .addMatcher((action) => isActionType(action, "auth/loginUser/pending"), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(
        (action) => isActionType(action, "auth/loginUser/fulfilled"), 
        (state, action: PayloadAction<AuthResponseDto>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          localStorage.setItem("token", action.payload.token);
        }
      )
      .addMatcher(
        (action) => isActionType(action, "auth/loginUser/rejected"), 
        (state, action: RejectedAction) => {
          state.loading = false;
          state.error = action.payload ?? action.error?.message ?? "Login failed";
        }
      )

      // --- signupUser ---
      .addMatcher((action) => isActionType(action, "auth/signupUser/pending"), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(
        (action) => isActionType(action, "auth/signupUser/fulfilled"), 
        (state, action: PayloadAction<AuthResponseDto>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          localStorage.setItem("token", action.payload.token);
        }
      )
      .addMatcher(
        (action) => isActionType(action, "auth/signupUser/rejected"), 
        (state, action: RejectedAction) => {
          state.loading = false;
          state.error = action.payload ?? action.error?.message ?? "Signup failed";
        }
      )

      // --- refreshToken ---
      .addMatcher((action) => isActionType(action, "auth/refreshToken/pending"), (state) => {
        state.error = null;
      })
      .addMatcher(
        (action) => isActionType(action, "auth/refreshToken/fulfilled"), 
        (state, action: PayloadAction<RefreshTokenResponseDto>) => {
          state.token = action.payload.token;
        }
      )
      .addMatcher(
        (action) => isActionType(action, "auth/refreshToken/rejected"), 
        (state, action: RejectedAction) => {
          state.user = null;
          state.token = null;
          localStorage.removeItem("token");
          state.error = action.payload ?? action.error?.message ?? "Session expired";
        }
      );
  },
});

export const { logout, updateToken } = authSlice.actions;
export default authSlice.reducer;