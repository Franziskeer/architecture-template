import { startApi } from "./apps/api/server";

startApi(Number(process.env.PORT ?? 3000));
