//deno:generate deno run -A embedder.ts
import examplesDir from "../embedder_static/dir.ts";

const indexHTML = await examplesDir.load("with_embedder.ts");
console.log("You are currently reading:", await indexHTML.text());
