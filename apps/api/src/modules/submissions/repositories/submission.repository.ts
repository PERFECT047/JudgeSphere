import { db } from "../../../config/database/mongodb";
import { ISubmission } from "../interfaces/submission.interface";

const submissions = db.collection<ISubmission>("submissions");

// Create indexes for efficient querying
submissions.createIndex({ userId: 1, problemSlug: 1, createdAt: -1 });
submissions.createIndex({ userId: 1, createdAt: -1 });

export const createSubmission = async (submission: Omit<ISubmission, "_id">) => {
  const result = await submissions.insertOne(submission);
  return { _id: result.insertedId, ...submission };
};

export const getSubmissionsByUserAndProblem = async (userId: string, problemSlug: string) => {
  return submissions
    .find({ userId, problemSlug })
    .sort({ createdAt: -1 })
    .toArray();
};

export const getSubmissionCount = async (userId: string, problemSlug: string) => {
  return submissions.countDocuments({ userId, problemSlug });
};