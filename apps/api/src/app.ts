import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import cookieParser from "cookie-parser";

import { logger } from "./config/logger/index.js";
import userRoutes from "./modules/users/routes/user.routes.js";
import problemRoutes from "./modules/problems/routes/problem.routes.js";
import submissionRoutes from "./modules/submissions/routes/submission.routes.js";
import codeSnippetRoutes from "./modules/code-snippets/codeSnippet.routes.js";
import aiReviewRoutes from "./modules/ai-review/aiReview.routes.js";
import { errorHandler } from "./common/middleware/errorHandler.js";

const app = express();

app.use(
	cors({
		origin: true,
		credentials: true,
	})
);

app.use(helmet());

app.use(pinoHttp({logger}));

app.use(express.json());

app.use(cookieParser());

app.use("/api/v1/user", userRoutes);
app.use("/api/v1", problemRoutes);
app.use("/api/v1/submissions", submissionRoutes);
app.use("/api/v1/code-snippets", codeSnippetRoutes);
app.use("/api/v1/ai-review", aiReviewRoutes);

app.use(errorHandler);

export default app;