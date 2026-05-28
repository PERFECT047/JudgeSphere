import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { findByEmail, createUser } from "../repository/user.repository";
import { env } from "@repo/env/server";
import { ApiError } from "../../../common/errors/apiError";

import { CreateUserDto, LoginDto, AuthResponseDto } from "@repo/dto";


export const signup = async (data: CreateUserDto): Promise<AuthResponseDto> => { 
  const existing = await findByEmail(data.email);

  if (existing) {
    throw new ApiError("Email already in use", 400);
  }

  const hashed = await bcrypt.hash(data.password, 10);

  const user = {
    name: data.name,
    email: data.email,
    password: hashed,
    createdAt: new Date(),
  };

  const created = await createUser(user);

  const token = jwt.sign(
    { sub: created._id, email: created.email },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    user: { 
      _id: created._id?.toString(),
      name: created.name, 
      email: created.email 
    },
    token,
  };
};


export const signin = async (data: LoginDto): Promise<AuthResponseDto> => {
  const user = await findByEmail(data.email);

  if (!user) {
    throw new ApiError("Invalid credentials", 401);
  }

  const match = await bcrypt.compare(
    data.password,
    user.password
  );

  if (!match) {
    throw new ApiError("Invalid credentials", 401);
  }

  const token = jwt.sign(
    { sub: user._id.toString(), email: user.email },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    user: { 
      _id: user._id.toString(), 
      name: user.name, 
      email: user.email 
    },
    token,
  };
};