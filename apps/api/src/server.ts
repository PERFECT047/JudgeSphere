import app from "./app";
import { connectDB } from "./config/database/mongodb";
import { appConfig } from "./config/app";


const startServer = async () => {
  await connectDB();

  app.listen(appConfig, () => {
    console.log(
      `Server running on ${appConfig.port}`,
    );
  });
};

startServer();