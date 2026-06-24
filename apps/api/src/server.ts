import app from "./app.js";
import { connectDB } from "./config/database/mongodb.js";
import { appConfig } from "./config/app/index.js";


const startServer = async () => {
  await connectDB();

  app.listen(appConfig, () => {
    console.log(
      `Server running on ${appConfig.port}`,
    );
  });
};

startServer();