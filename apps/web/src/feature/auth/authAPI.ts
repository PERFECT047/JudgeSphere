import axios from "../../service/axios";
import type { LoginDto, CreateUserDto, AuthResponseDto, RefreshTokenResponseDto } from "@repo/dto";

export const loginAPI = async (data: LoginDto): Promise<AuthResponseDto> => {
  const response = await axios.post<AuthResponseDto>(
    "/user/login",
    data
  );
  return response.data;
};

export const signupAPI = async (data: CreateUserDto): Promise<AuthResponseDto> => {
  const response = await axios.post<AuthResponseDto>(
    "/user/signup",
    data
  );
  return response.data;
};

export const refreshTokenAPI = async (): Promise<RefreshTokenResponseDto> => {
  const response = await axios.post<RefreshTokenResponseDto>(
    "/user/refresh"
  );
  return response.data;
};

export const logoutAPI = async (): Promise<void> => {
  await axios.post("/user/logout");
};