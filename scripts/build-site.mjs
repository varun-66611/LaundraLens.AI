import { cp, mkdir, rm } from "node:fs/promises";

const outputDirectory = new URL("../dist/", import.meta.url);
const clientBuild = new URL("../apps/client/dist/", import.meta.url);
const workerSource = new URL("../hosting/worker.js", import.meta.url);

await rm(outputDirectory, { force: true, recursive: true });
await mkdir(new URL("client/", outputDirectory), { recursive: true });
await mkdir(new URL("server/", outputDirectory), { recursive: true });
await cp(clientBuild, new URL("client/", outputDirectory), { recursive: true });
await cp(workerSource, new URL("server/index.js", outputDirectory));

console.log("Prepared the LaundraLens.ai Sites deployment bundle.");
