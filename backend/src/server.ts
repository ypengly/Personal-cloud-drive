import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

app.listen(env.port, () => {
  console.log(`Personal Cloud Drive API listening on http://localhost:${env.port}`);
  console.log(`Storage driver: ${env.storageDriver}`);
});
