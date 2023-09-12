import { embedder } from "../../dev_deps.ts";

const embedderOptions: embedder.DevOptions = {
  importMeta: import.meta,
  mappings: [
    { sourceDir: "./", destDir: "../embedder_static" },
  ],
};

if (import.meta.main) {
  await embedder.main({
    options: embedderOptions,
    args: ["build"],
  });
}
