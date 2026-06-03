import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { loginAPI, signupAPI, refreshTokenAPI } from "./authAPI";
import type { LoginDto, CreateUserDto, AuthResponseDto, RefreshTokenResponseDto } from "@repo/dto";

export const loginUser = createAsyncThunk<
  AuthResponseDto,
  LoginDto,
  { rejectValue: string }
>(
  "auth/loginUser",
  async (credentials: LoginDto, thunkAPI) => {
    try {
      const response = await loginAPI(credentials);
      return response;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.message;
        return thunkAPI.rejectWithValue(
          typeof serverMessage === "string" ? serverMessage : "Login failed"
        );
      }
      
      const fallbackMessage = error instanceof Error ? error.message : "Login failed";
      return thunkAPI.rejectWithValue(fallbackMessage);
    }
  }
);

export const signupUser = createAsyncThunk<
  AuthResponseDto,
  CreateUserDto,
  { rejectValue: string }
>(
  "auth/signupUser",
  async (credentials: CreateUserDto, thunkAPI) => {
    try {
      const response = await signupAPI(credentials);
      return response;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.message;
        return thunkAPI.rejectWithValue(
          typeof serverMessage === "string" ? serverMessage : "Signup failed"
        );
      }
      
      const fallbackMessage = error instanceof Error ? error.message : "Signup failed";
      return thunkAPI.rejectWithValue(fallbackMessage);
    }
  }
);

export const refreshToken = createAsyncThunk<
  RefreshTokenResponseDto,
  void,
  { rejectValue: string }
>(
  "auth/refreshToken",
  async (_, thunkAPI) => {
    try {
      const response = await refreshTokenAPI();
      return response;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.message;
        return thunkAPI.rejectWithValue(
          typeof serverMessage === "string" ? serverMessage : "Token refresh failed"
        );
      }
      
      const fallbackMessage = error instanceof Error ? error.message : "Token refresh failed";
      return thunkAPI.rejectWithValue(fallbackMessage);
    }
  }
);