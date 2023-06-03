import * as embedder from "https://deno.land/x/embedder@v1.0.1/mod.ts";

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
