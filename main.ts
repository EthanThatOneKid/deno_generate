import {
  isWindows,
  mergeReadableStreams,
  parseFlags,
  readableStreamFromReader,
  resolve,
  toFileUrl,
} from "./deps.ts";

import type { Imports, Options } from "./lib/graph/mod.ts";
import { DEFAULT_IMPORTS, graph, walk } from "./lib/graph/mod.ts";

// const DEFAULT_ENTRY_POINT = "main.ts";

interface AppConfig {
  /**
   * The entry point for the application.
   */
  graph: Required<Options>;

  /**
   * The maximum timeout for each command.
   */
  timeout: number; // in milliseconds
}

class App {
  constructor(
    private config: AppConfig,
  ) {
    if (!this.config.graph.entryPoint.startsWith("http")) {
      this.config.graph.entryPoint = toFileUrl(
        resolve(this.config.graph.cwd, this.config.graph.entryPoint),
      ).toString();
    }
  }

  public async action() {
    const g = await graph(this.config.graph);

    for (const [file, { cmd, line, column }] of walk(g)) {
      //deno:generate cat \
      // LICENSE
      // THe following if-statement is a Windows workaround. Motivation:
      // https://github.com/denoland/deno/issues/5921
      if (isWindows) {
        cmd.unshift("cmd", "/c");
      }

      console.log(`Running: ${file}:${line}:${column} $ ${cmd.join(" ")}`);
      const process = Deno.run({
        cmd,
        stdout: "piped",
        stderr: "piped",
        cwd: this.config.graph.cwd,
      });
      const stdout = readableStreamFromReader(process.stdout);
      const stderr = readableStreamFromReader(process.stderr);
      const joined = mergeReadableStreams(stdout, stderr);
      const timeoutID = setTimeout(
        () => process.kill("SIGINT"),
        this.config.timeout,
      );
      await joined.pipeTo(Deno.stdout.writable, {
        preventAbort: true,
        preventCancel: true,
        preventClose: true,
      });
      clearTimeout(timeoutID);
      const output = await process.output();
      console.log({ output });
    }
  }
}

export async function generate() {
  const flags = parseFlags(Deno.args, {
    boolean: ["help"],
    string: ["import-map", "cwd"],
    alias: {
      help: "h",
      "import-map": "i",
      cwd: "c",
    },
  });

  if (flags.help) {
    console.log(
      `Usage: ${Deno.mainModule} [options] [entry_point]

Options:
  -h, --help            Show this help message and exit.
  -i, --import-map      Path to import map.
  -c, --cwd             Overwrite working directory.
`,
    );
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

  const cwd = flags["cwd"] || Deno.cwd();
  const app = new App({
    graph: { entryPoint, imports, cwd },
    timeout: 1e3 * 60, // 1 minute.
  });
  await app.action();
}

// function spawn(
//   cmd: [string | URL, ...string[]],
//   timeout = 1e3 * 60, /* 1 minute */
// ) {
//   console.log("Running:", cmd.join(" "));
// }

if (import.meta.main) {
  await generate();
  Deno.exit(0);
}
