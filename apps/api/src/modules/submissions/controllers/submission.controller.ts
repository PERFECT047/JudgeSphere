import { Request, Response, NextFunction } from "express";
import { RunCodeDtoSchema, SubmitCodeDtoSchema } from "@repo/dto";
import * as submissionService from "../services/submission.service";

export const run = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const payload = RunCodeDtoSchema.parse(req.body);
    const result = await submissionService.runCode(userId, payload);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const submit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const payload = SubmitCodeDtoSchema.parse(req.body);
    const result = await submissionService.submitCode(userId, payload);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getSubmissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const problemSlug = req.params.problemSlug as string;
    const result = await submissionService.getSubmissions(userId, problemSlug);
    res.json(result);
  } catch (err) {
    next(err);
  }
};