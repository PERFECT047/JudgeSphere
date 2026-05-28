import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";
import { CreateUserDtoSchema, LoginDtoSchema } from "@repo/dto"


export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = CreateUserDtoSchema.parse(req.body);

    const result = await userService.signup(payload);

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = LoginDtoSchema.parse(req.body);

    const result = await userService.signin(payload);

    res.json(result);
  } catch (err) {
    next(err);
  }
};