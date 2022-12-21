// Run:
// cd examples/hello-world
// deno run -A tasks/gen_ascii_art.ts

import { parse as parseFlags } from "https://deno.land/std@0.167.0/flags/mod.ts";

const flags = parseFlags(Deno.args);

if (import.meta.main) {
  main();
}

function main() {
  const art = genASCIIArt(flags.width || flags.w, flags.height || flags.h);
  Deno.mkdirSync("path/to/generated/art", { recursive: true });
  Deno.writeTextFileSync(
    "path/to/generated/art/mod.ts",
    `export const ART = \`art!! ${art}\`;`,
  );
  console.log(`Generated ASCII art at path/to/generated/art/mod.ts`);
}

function genASCIIArt(width = 80, height = 40) {
  const lines: string[] = [];

  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      line += Math.random() < 0.5 ? "/" : "\\";
    }
    lines.push(line);
  }

  const art = lines.join("\n");
  return art;
}
