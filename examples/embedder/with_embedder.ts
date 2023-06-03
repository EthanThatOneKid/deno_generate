//deno:generate deno run -A embedder.ts
import examplesDir from "../embedder_static/dir.ts";

const exampleFile = await examplesDir.load("with_embedder.ts");
console.log("You are currently reading:", await exampleFile.text());
