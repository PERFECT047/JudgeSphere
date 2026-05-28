import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"; // 👈 Required for the type guard
import { loginAPI, signupAPI } from "./authAPI";
import type { LoginDto, CreateUserDto, AuthResponseDto } from "@repo/dto";

export const loginUser = createAsyncThunk<
  AuthResponseDto,
  LoginDto,
  { rejectValue: string }
>(
  "auth/loginUser",
  async (credentials: LoginDto, thunkAPI) => {
    try {
      const response = await loginAPI(credentials);
      localStorage.setItem("token", response.token);
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
      localStorage.setItem("token", response.token);
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