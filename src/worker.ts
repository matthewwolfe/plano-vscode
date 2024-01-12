import * as url from "node:url";
import { Worker } from "node:worker_threads";
import * as path from "node:path";

export const worker = new Worker(
  url.pathToFileURL(path.join(__dirname, "/worker/worker.js"))
);
