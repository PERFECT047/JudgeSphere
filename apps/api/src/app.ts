import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";

import { logger } from "./config/logger";
import userRoutes from "./modules/users/routes/user.routes";
import problemRoutes from "./modules/problems/routes/problem.routes";
import submissionRoutes from "./modules/submissions/routes/submission.routes";
import codeSnippetRoutes from "./modules/code-snippets/codeSnippet.routes";
import { errorHandler } from "./common/middleware/errorHandler";

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

app.use(errorHandler);

export default app;