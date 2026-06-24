import { db } from "../../../config/database/mongodb.js";
import { ObjectId, Filter, Document } from "mongodb";
import { IProblem, IProblemFilter, IProblemSummary, IProblemDetail } from "../interfaces/problem.interface.js";

const problems = db.collection<IProblem>("problems");

// Create indexes for efficient querying
problems.createIndex({ slug: 1 }, { unique: true });
problems.createIndex({ problemNumber: 1 }, { unique: true });
problems.createIndex({ tags: 1 });
problems.createIndex({ topics: 1 });

export const findBySlug = async (slug: string) => {
  return problems.findOne({ slug });
};

export const findByProblemNumber = async (problemNumber: number) => {
  return problems.findOne({ problemNumber });
};

export const findById = async (id: string) => {
  return problems.findOne({ _id: new ObjectId(id) });
};

export const createProblem = async (problem: Omit<IProblem, "_id">) => {
  const result = await problems.insertOne(problem);
  return { _id: result.insertedId, ...problem };
};

export const createManyProblems = async (problemList: Omit<IProblem, "_id">[]) => {
  if (problemList.length === 0) return { insertedCount: 0 };

  // Use ordered: false to continue on duplicate key errors
  const result = await problems.insertMany(problemList as any[], { ordered: false }).catch(err => {
    // Handle bulk write errors (duplicates)
    if (err.insertedCount !== undefined) {
      return err;
    }
    throw err;
  });

  return { insertedCount: result.insertedCount || 0 };
};

export const findProblemsWithFilter = async (
  filter: IProblemFilter
) => {
  const query: Filter<Document> = {};

  // Tags filter
  if (filter.tags && filter.tags.length > 0) {
    query.tags = { $in: filter.tags };
  }

  // Topics filter
  if (filter.topics && filter.topics.length > 0) {
    query.topics = { $in: filter.topics };
  }

  const page = filter.page || 1;
  const limit = filter.limit || 20;
  const skip = (page - 1) * limit;

  // Always sort by problemNumber ascending
  const sort: Document = { problemNumber: 1 };

  // Return lightweight summaries (no description, examples, testCases)
  const [results, total] = await Promise.all([
    problems
      .find(query, {
        projection: {
          _id: 1,
          problemNumber: 1,
          title: 1,
          slug: 1,
          tags: 1,
          topics: 1,
        },
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray(),
    problems.countDocuments(query),
  ]);

  const summaries: IProblemSummary[] = results.map((p) => ({
    _id: p._id?.toString(),
    problemNumber: p.problemNumber,
    title: p.title,
    slug: p.slug,
    tags: p.tags,
    topics: p.topics,
  }));

  return {
    problems: summaries,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

export const findProblemDetail = async (slug: string): Promise<IProblemDetail | null> => {
  const problem = await problems.findOne({ slug }, {
    projection: {
      _id: 1,
      problemNumber: 1,
      title: 1,
      slug: 1,
      description: 1,
      constraints: 1,
      examples: 1,
      tags: 1,
      topics: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  });

  if (!problem) return null;

  return {
    _id: problem._id?.toString(),
    problemNumber: problem.problemNumber,
    title: problem.title,
    slug: problem.slug,
    description: problem.description,
    constraints: problem.constraints,
    examples: problem.examples,
    tags: problem.tags,
    topics: problem.topics,
  };
};

export const getProblemStats = async () => {
  const stats = await problems
    .aggregate([
      {
        $facet: {
          byTopic: [
            { $unwind: "$topics" },
            { $group: { _id: "$topics", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          byTag: [
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          total: [{ $count: "count" }],
        },
      },
    ])
    .toArray();

  return {
    byTopic: stats[0]?.byTopic || [],
    byTag: stats[0]?.byTag || [],
    total: stats[0]?.total[0]?.count || 0,
  };
};

export const getMaxProblemNumber = async () => {
  const result = await problems
    .find()
    .sort({ problemNumber: -1 })
    .limit(1)
    .toArray();
  return result[0]?.problemNumber || 0;
};

export const getAllTags = async () => {
  const result = await problems.distinct("tags");
  return result.sort();
};

export const getAllTopics = async () => {
  const result = await problems.distinct("topics");
  return result.sort();
};

export const deleteAllProblems = async () => {
  return problems.deleteMany({});
};

export const getProblemCount = async () => {
  return problems.countDocuments({});
};