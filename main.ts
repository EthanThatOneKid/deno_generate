import {
  basename,
  join,
  mergeReadableStreams,
  parseFlags,
  readableStreamFromReader,
} from "./deps.ts";

import { walk } from "./lib/fs/mod.ts";
import type { ImportMap } from "./lib/import_map/mod.ts";
import { DEFAULT_IMPORT_MAP } from "./lib/import_map/mod.ts";

class App {
  constructor(
    private entryPoint: string,
    private importMap = DEFAULT_IMPORT_MAP,
  ) {
    if (basename(entryPoint) === "") {
      this.entryPoint = join(entryPoint, "main.ts");
    }
  }

  public action() {
    for (const [file, cmd] of walk(this.entryPoint, this.importMap)) {
      try {
        spawn(cmd);
      } catch (err) {
        console.error(
          `Error running command ${cmd.join(" ")} from ${file}.`,
          err,
        );
      }
    }
  }
}

if (import.meta.main) {
  main();
}

function main() {
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
  const app = importMapPath
    ? new App(
      entryPoint,
      JSON.parse(Deno.readTextFileSync(importMapPath)) as ImportMap,
    )
    : new App(entryPoint);

  app.action();
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
