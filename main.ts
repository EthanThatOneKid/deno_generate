import {
  basename,
  join,
  mergeReadableStreams,
  parseFlags,
  readableStreamFromReader,
  resolve,
} from "./deps.ts";

import type { Imports } from "./lib/graph/mod.ts";
import { DEFAULT_IMPORTS, graph, walk } from "./lib/graph/mod.ts";

const DEFAULT_ENTRY_POINT = "main.ts";

class App {
  constructor(
    private entryPoint: string,
    private imports: Imports,
  ) {
    if (!basename(entryPoint)) {
      this.entryPoint = join(entryPoint, DEFAULT_ENTRY_POINT);
    }

    if (!this.entryPoint.startsWith("http")) {
      this.entryPoint = resolve(this.entryPoint);
    }
  }

  public async action() {
    const g = await graph({
      entryPoint: this.entryPoint,
      imports: this.imports,
    });
    for (const [file, { cmd, line, column }] of walk(g)) {
      try {
        spawn(cmd);
      } catch (err) {
        console.error(
          `Error running command at ${file}:${line}:${column}: ${err.message}`,
        );
      }
    }
  }
}

if (import.meta.main) {
  await main();
  Deno.exit(0);
}

async function main() {
  const flags = parseFlags(Deno.args, {
    boolean: ["help"],
    string: ["import-map"],
    alias: { help: "h" },
  });

  if (flags.help) {
    console.log(`Usage: deno run -A main.ts [entry point]`);
    Deno.exit(0);
  }

  const entryPoint: string = flags._[0] as string;
  if (!entryPoint) {
    throw new Error("Please provide an entry point.");
  }

  const importMapPath = flags["import-map"];
  let imports = DEFAULT_IMPORTS;
  if (importMapPath) {
    imports = JSON.parse(
      Deno.readTextFileSync(importMapPath),
    )["imports"] as Imports;
  }

  const app = new App(entryPoint, imports);
  await app.action();
}

function spawn(
  cmd: [string | URL, ...string[]],
  timeout = 1e3 * 60, /* 1 minute */
) {
  const process = Deno.run({ cmd, stdout: "piped", stderr: "piped" });
  const stdout = readableStreamFromReader(process.stdout);
  const stderr = readableStreamFromReader(process.stderr);
  const joined = mergeReadableStreams(stdout, stderr);
  const timeoutID = setTimeout(
    () => process.kill("SIGINT"),
    timeout,
  );

  joined.pipeTo(Deno.stdout.writable).then(() => clearTimeout(timeoutID));
}
