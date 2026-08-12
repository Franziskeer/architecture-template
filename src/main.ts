import { startApi } from "./apps/api/server";
import { config } from "./shared/config";

startApi(config.port);
