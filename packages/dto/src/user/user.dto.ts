import { z } from "zod";


export const UserDtoSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
}).strict();
export type UserDto = z.infer<typeof UserDtoSchema>;


export const CreateUserDtoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
}).strict();
export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;


export const LoginDtoSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Invalid password")
    .regex(/[A-Z]/, "Invalid password")
    .regex(/[a-z]/, "Invalid password")
    .regex(/[^A-Za-z0-9]/, "Invalid password"),
}).strict();
export type LoginDto = z.infer<typeof LoginDtoSchema>;


export const AuthResponseDtoSchema = z.object({
  user: UserDtoSchema,
  token: z.string(),
  refreshToken: z.string(),
}).strict();
export type AuthResponseDto = z.infer<typeof AuthResponseDtoSchema>;


export const RefreshTokenDtoSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
}).strict();
export type RefreshTokenDto = z.infer<typeof RefreshTokenDtoSchema>;


export const RefreshTokenResponseDtoSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
}).strict();
export type RefreshTokenResponseDto = z.infer<typeof RefreshTokenResponseDtoSchema>;


export const UpdateProfileDtoSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email format").optional(),
}).strict();
export type UpdateProfileDto = z.infer<typeof UpdateProfileDtoSchema>;


export const ChangePasswordDtoSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
}).strict();
export type ChangePasswordDto = z.infer<typeof ChangePasswordDtoSchema>;