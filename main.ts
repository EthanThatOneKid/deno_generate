import process from "node:process";
import { parseArgs } from "node:util";
import { basename, delimiter, dirname, join, resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { $ } from "npm:execa@^8.0.1";
import { glob } from "npm:glob@^10.3.10";
import * as ShellQuote from "npm:shell-quote@^1.8.1";

const version = import.meta.url.match(/\/deno_generate@(\d+\.\d+\.\d+)\//)?.[1];

const help = `\
deno_generate ${version ? `v${version}` : "<unknown version>"}

USAGE
  deno install -A https://deno.land/x/deno_generate@1/main.ts
  deno_generate
  # OR
  deno run -A https://deno.land/x/deno_generate@1/main.ts
  # OR
  echo '{"tasks":{"generate":"deno run -A https://deno.land/x/deno_generate@1/main.ts"}}' > deno.json
  deno task generate

OPTIONS
  --help: print this help message
  --version: print the version
  --run <string>: only run generators whose command contains this substring
  --skip <string>: skip generators whose command contains this substring
  --verbose, -v: print the path of each file being processed
  --dry-run, -n: print the command without running it
  --xtrace, -x: print the command before running it
  --show-output, -O: show the output of the commands
`;

const options = {
  help: { type: "boolean" },
  version: { type: "boolean" },
  run: { type: "string" },
  skip: { type: "string" },
  verbose: { type: "boolean", short: "v" },
  "dry-run": { type: "boolean", short: "n" },
  xtrace: { type: "boolean", short: "x" },
  "show-output": { type: "boolean", short: "O" },
}; // satisfies ParseArgsConfig['options']
const { values, positionals } = parseArgs({ options, allowPositionals: true });

if (values.help) {
  console.log(help);
  process.exit(0);
}
if (values.version) {
  console.log(version);
  process.exit(0);
}

const globPatterns = positionals.length
  ? positionals
  : ["./*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"];
let sourceFilePaths = await glob(globPatterns, {
  ignore: ["**/node_modules/**"],
  absolute: true,
});
sourceFilePaths = sourceFilePaths.filter((x) =>
  /\.[cm]?[jt]sx?$/.test(x) && !/\.d\.[cm]?[jt]sx?$/.test(x) &&
  !/\.d\.[^\.]+\.[cm]?[jt]sx?$/.test(x)
);

if (values.run && values.skip) {
  throw new DOMException(
    "cannot specify both --run and --skip",
    "SyntaxError",
  );
}

const DENOROOT = process.env.DENO_DIR || resolve(process.execPath, "../..");
const PATH = join(DENOROOT, "bin") + delimiter + process.env.PATH;
const DOLLAR = "$";

for (const path of sourceFilePaths) {
  if (values.verbose) {
    console.log(path);
  }

  const code = await readFile(path, "utf8");

  if (
    /^(#!.*\r?\n)?((\/\/.*)?\r?\n)*\/\/ Code generated .* DO NOT EDIT\.\r?\n/
      .test(code)
  ) {
    continue;
  }

  // const generators = new Map<string, { cmd: string; args: string }>();

  for (
    const match of code.matchAll(/^\/\/deno:generate\s+(\S+)(?:\s+(.*))?/gm)
  ) {
    if (values.skip && match[0].includes(values.skip)) {
      continue;
    } else if (values.run && !match[0].includes(values.run)) {
      continue;
    }

    const DENOFILE = basename(path);
    const DENOLINE = code.slice(0, match.index!).match(/^/gm)!.length;
    const PWD = dirname(path);
    const env = {
      ...process.env,
      DENOFILE,
      DENOLINE,
      DENOROOT,
      DOLLAR,
      PWD,
      PATH,
    };

    // if (match[1] === "-command") {
    //   if (!match[2]) {
    //     throw new DOMException("missing command alias value", "SyntaxError");
    //   }
    //   const aliasMatch = match[2].match(/^(\S+)\s+(\S+)(?:\s+(.*))?$/);
    //   if (!aliasMatch) {
    //     throw new DOMException(
    //       "invalid command alias value",
    //       "SyntaxError",
    //     );
    //   }
    //   const key = aliasMatch[1];
    //   const cmd = aliasMatch[2];
    //   const args = aliasMatch[3] ?? null;
    //   generators.set(key, { cmd, args });
    //   continue;
    // }

    let cmd: string;
    let args: string;
    // const alias = generators.get(match[1]);
    // if (alias) {
    //   cmd = alias.cmd;
    //   args = [alias.args, match[2]].filter(x => x).join(" ");
    // } else {
    cmd = match[1];
    args = match[2] ?? "";
    // }
    const argv = ShellQuote.parse(args, env);
    argv.unshift(cmd);

    if (values["dry-run"]) {
      console.log(`${path}:${DENOLINE} ${ShellQuote.quote(argv)}`);
    } else {
      if (values.xtrace) {
        console.log(`${path}:${DENOLINE} ${ShellQuote.quote(argv)}`);
      }
      const { exitCode, signal, all } = await $({
        cwd: PWD,
        all: true,
        reject: false,
      })`${argv}`;
      if (signal) {
        console.error(`${path}:${DENOLINE} raised ${signal}`);
        all && console.error(all);
      } else if (exitCode) {
        console.error(`${path}:${DENOLINE} exited with code ${exitCode}`);
        console.error(all);
      } else if (values["show-output"]) {
        all && console.log(all);
      }
    }
  }
}
