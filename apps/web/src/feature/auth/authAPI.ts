import axios from "../../service/axios";
import type { LoginDto, CreateUserDto, AuthResponseDto } from "@repo/dto";

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