import { MongoClient } from "mongodb";

import { env } from "@repo/env/server";

const client = new MongoClient(
  env.MONGO_URI!,
);

export const connectDB = async () => {
  await client.connect();

  console.log("MongoDB connected");
};

export const db = client.db("judgesphere");