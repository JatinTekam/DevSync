import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./shared/logger.js";

const app = createApp();
const { PORT } = env;

app.listen(PORT, () => {
  logger.info({ port: PORT }, "DevSync API listening");
});
