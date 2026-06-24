import { Request, Response, NextFunction } from "express";
import { reviewCode } from "./aiReview.service.js";
import { ApiError } from "../../common/errors/apiError.js";
import { HttpStatus } from "@repo/dto";
import { findBySlug } from "../problems/repositories/problem.repository.js";

interface ReviewRequestBody {
  code: string;
  language: string;
  problemSlug: string;
}

export const reviewCodeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, language, problemSlug } = req.body as ReviewRequestBody;

    if (!code || !language || !problemSlug) {
      throw new ApiError("code, language, and problemSlug are required", HttpStatus.BAD_REQUEST);
    }

    const problem = await findBySlug(problemSlug);

    if (!problem) {
      throw new ApiError("Problem not found", HttpStatus.NOT_FOUND);
    }

    const result = await reviewCode({
      code,
      language,
      problemTitle: `${problem.problemNumber}. ${problem.title}`,
      problemDescription: problem.description,
      problemConstraints: problem.constraints,
      problemExamples: problem.examples,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};