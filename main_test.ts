import test from "node:test";
import assert from "node:assert/strict";
import process from "node:process";
import { rmSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { $ } from "npm:execa@^8.0.1";
import { temporaryDirectory } from "npm:tempy@^3.1.0";

type Tree = { [path: string]: string | Tree };
async function temporaryTree(tree: Tree): Promise<string> {
  async function f(tree: Tree, root: string) {
    for (const [path, content] of Object.entries(tree)) {
      if (typeof content === "string") {
        await writeFile(join(root, path), content);
      } else {
        await mkdir(join(root, path));
        await f(content, join(root, path));
      }
    }
  }
  const root = temporaryDirectory();
  await f(tree, root);
  process.on("exit", () => {
    rmSync(root, { recursive: true, force: true });
  });
  return root;
}

const deno_generate = [
  "deno",
  "run",
  "-A",
  fileURLToPath(import.meta.resolve("./main.ts")),
];

test("echo info dry-run", async () => {
  const cwd = await temporaryTree({
    "main.ts": `//deno:generate echo $DENOFILE $DENOLINE $PWD`,
  });
  const $t = $({ cwd, all: true });
  const { all } = await $t`${deno_generate} -n`;
  assert.match(all!, /.echo main\.ts 1/);
});

test("echo info real", async () => {
  const cwd = await temporaryTree({
    "main.ts": `//deno:generate echo $DENOFILE $DENOLINE $PWD`,
  });
  const $t = $({ cwd, all: true });
  const { all } = await $t`${deno_generate} -O`;
  assert.match(all!, /^main\.ts 1/m);
});

// test("uses alias", async () => {
//   const cwd = await temporaryTree({
//     "main.ts": `\
// //deno:generate -command doit echo $DENOFILE $DENOLINE $PWD
// //deno:generate doit`,
//   });
//   const $t = $({ cwd, stdio: "inherit" });
//   await $t`${deno_generate} -vxnO`;
// });
