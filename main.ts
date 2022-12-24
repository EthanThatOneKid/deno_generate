import { parseFlags, resolve, toFileUrl } from "./deps.ts";

import type { Imports, Options } from "./lib/graph/mod.ts";
import { DEFAULT_IMPORTS, graph, walk } from "./lib/graph/mod.ts";

// const DEFAULT_ENTRY_POINT = "main.ts";

export async function generate() {
  const flags = parseFlags(Deno.args, {
    boolean: ["help"],
    string: ["import-map"],
    alias: {
      help: "h",
      "import-map": "imports",
    },
  });

  if (flags.help) {
    console.log(
      `Usage: ${Deno.mainModule} [options] [entry_point]

Options:
  -h,       --help            Show this help message and exit.
  -imports, --import-map      Path to import map (e.g. import_map.json).
`,
    );
    Deno.exit(0);
  }

  const entryPoint: string = toFileUrl(resolve(flags._[0] as string))
    .toString();
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

  const app = new App({
    graph: { entryPoint, imports },
    timeout: 1e3 * 60, // 1 minute.
  });
  await app.action();
}

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
  constructor(private config: AppConfig) {}

  public async action() {
    const g = await graph(this.config.graph);
    for (const [specifier, { cmd, line, character }] of walk(g)) {
      console.log(
        `Running: ${specifier}:${line}:${character} $ ${cmd.join(" ")}`,
      );

      // const process = Deno.run({
      //   cmd,
      //   stdout: "piped",
      //   stderr: "piped",
      //   cwd: urlJoin(specifier, ".."),
      // });
      // const process = exec(cmd, {
      //   cwd: basename(file),
      //   timeout: this.config.timeout,
      // });
      // const stdout = readableStreamFromReader(process.stdout);
      // const stderr = readableStreamFromReader(process.stderr);
      // const joined = mergeReadableStreams(stdout, stderr);
      // const timeoutID = setTimeout(
      //   () => process.kill("SIGINT"),
      //   this.config.timeout,
      // );
      // await joined.pipeTo(Deno.stdout.writable, {
      //   preventAbort: true,
      //   preventCancel: true,
      //   preventClose: true,
      // });
      // clearTimeout(timeoutID);
      // const output = await process.output();
      // console.log({ output });
    }
  }
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
