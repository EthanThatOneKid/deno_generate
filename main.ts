import {
  mergeReadableStreams,
  parseFlags,
  readableStreamFromReader,
  resolve,
  toFileUrl,
  urlJoin,
} from "./deps.ts";

import type { Imports, Options } from "./lib/graph/mod.ts";
import { DEFAULT_IMPORTS, graph, walk } from "./lib/graph/mod.ts";

const DEFAULT_ENTRY_POINT_STRING = "./main.ts";

// TODO: Change to "deno generate" once it's available.
const USAGE_STRING = "deno run -A https://deno.land/x/generate/main.ts";

const STATIC_ENV = {
  ...Deno.env.toObject(),
  DENO_OS: Deno.build.os,
  DOLLAR: "$",
};

export const HELP_STRING = `
deno-generate
Automate common code generation tasks by running procedures described by directives
within JavaScript/TypeScript source code.

USAGE:
    ${USAGE_STRING} [OPTIONS] [file]

ARGS:
    <file>

OPTIONS:
    -h, --help
            Prints help information

    -i, --imports <IMPORTS>
            Path to an import map file. This file will be used to resolve imports
            in the source code.

    -r, --run <REGEX>
            Run only generators whose name matches the given regular expression.

    -s, --skip <REGEX>
            Skip generators whose name matches the given regular expression.

    -v, --verbose
            Prints the module specifier and directive text of each directive when
            running the corresponding generator.

    -n, --dry-run
            Do not run any generators. Useful for testing.

    -t, --trace
            Prints a detailed trace of the execution of each generator.

Deno generate scans a module graph for directives, which are lines of comments of the
form:

  //deno:generate <command> [arguments...]

where command is the generator corresponding to an executable file that can be run locally.
To run and arguments are passed to the generator. The generator is run from the directory
containing the directive. The generator is run via the Deno.run() API, so it can be a
Deno script or an executable binary.

Note: No space in between "//" and "deno:generate".

The deno generate command does not parse the file, so lines that look like directives
in comments or strings will be treated as directives.

The arguments to the directive are space-separated tokens or double-quoted strings passed
to the generator as arguments. Quoted strings are evaluated before execution.

To convey to humans and tools that code is generated, generated source files should have a
comment of the form:

    ^// Code generated .* DO NOT EDIT\.$

The line must appear before the first non-comment, non-blank line of the file.

Deno generate sets several variables when running generators:

  $DENO_OS
    The operating system of the host running deno generate.
  $DENO_MODULE
    The module specifier of the module containing the directive.
  $DENO_LINE
    The line number of the directive within the file.
  $DENO_CHARACTER
    The character number of the directive within the file.
  $DENO_DIR
    The directory containing the file containing the directive.
  $DOLLAR
    A dollar sign ($). This is useful for escaping the $ in shell commands.
    Literature: https://go-review.googlesource.com/c/go/+/8091
  
A directive may contain a comment of the form:

  //deno:generate -command <command> [arguments...]

where, for the remainder of this source file, the command <command> is replaced by the
arguments. This can be used to create aliases for long commands or to define arguments
that are common to multiple directives. For example:

  //deno:generate -command cat deno run --allow-read https://deno.land/std/examples/cat.ts

  (...)
  
  //deno:generate cat LICENSE

The -command directive may appear anywhere in the file, but it is usually placed at the
top of the file, before any directives that use it.

The -run flag specifies a regular expression to select directives to run by matching
against the directive text as-is. The regular expression does not need to match the entire
text of the directive, but it must match at least one character. The default is to run
all directives.

The -skip flag specifies a regular expression to select directives to skip by matching
against the directive text as-is. The regular expression does not need to match the entire
text of the directive, but it must match at least one character. The default is to not
skip any directives.

The -imports flag specifies a file containing an import map to use when resolving imports
in the module graph. The file must contain a JSON object with an "imports" field that
maps module specifiers to local paths if any such mappings are in use.

The -dry-run flag (-n) prints the commands that would be run without actually running them.

The -verbose flag (-v) prints the module specifier and directive text of each directive when
running the corresponding generator.

The -trace flag (-x) prints the commands as they are run.

You can also combine these flags to modify go generate's behavior in different ways. For
example, ${USAGE_STRING} -n -v will run generate in dry run mode and
print more detailed information about the commands that it would run, while
${USAGE_STRING} -v -x will run generate in verbose mode and print the commands that it
is running as it runs them.

The -help flag prints a help message and exits.

Providing no flags or arguments is equivalent to providing an entry point of ${DEFAULT_ENTRY_POINT_STRING}.

Example:

  ${USAGE_STRING}

For more about directive comments, see /* TODO: Add link to proposal. */.

`;

class App {
  constructor(private config?: AppConfig) {}

  public async action() {
    if (!this.config) {
      console.log(HELP_STRING);
      return;
    }

    const failed = new Set<string>();
    const g = await graph(this.config.graph);
    for (const [specifier, { cmd, original, line, character }] of walk(g)) {
      // When a command fails or times out, we want to print the error and skip the rest
      // of the commands in the file, but continue processing the rest of the files.
      if (failed.has(specifier)) {
        continue;
      }

      const willRun =
        (this.config.skip?.test(original) || !this.config.run?.test(original));
      if (!willRun) {
        failed.add(specifier);
        continue;
      }

      if (this.config.verbose && !this.config.trace) {
        console.log(`${specifier}:${line}:${character} ${cmd}`);
      }

      if (this.config.dryRun) {
        continue;
      }

      const env = envOf(specifier, line, character);
      const process = Deno.run({
        cmd,
        stdout: "piped",
        stderr: "piped",
        cwd: env.DENO_DIR,
        env,
      });

      const stdout = readableStreamFromReader(process.stdout);
      const stderr = readableStreamFromReader(process.stderr);
      const joined = mergeReadableStreams(stdout, stderr);

      await joined.pipeTo(Deno.stdout.writable)
        .then(() => {
          if (this.config?.trace) {
            console.log(
              this.config.verbose
                ? `${specifier}:${line}:${character} ${cmd}`
                : cmd,
            );
          }
        })
        .catch((err: Error) => {
          if (this.config?.verbose) {
            console.error(err);
          }

          failed.add(specifier);
        });
    }
  }
}

function envOf(
  specifier: string,
  line: number,
  character: number,
): Record<string, string> {
  // Run the command in the directory of the file containing the directive.
  const gwd = urlJoin(specifier, "..");
  return {
    ...STATIC_ENV,
    DENO_MODULE: specifier,
    DENO_LINE: `${line}`,
    DENO_CHARACTER: `${character}`,
    DENO_DIR: gwd,
  };
}

interface AppConfig {
  /**
   * The entry point for the application.
   */
  graph: Required<Options>;

  /**
   * Flag to print the commands that would be run without actually running them.
   */
  dryRun?: boolean;

  /**
   * Flag to print the module specifier and directive text of each directive when
   * running the corresponding generator.
   */
  verbose?: boolean;

  /**
   * Flag to print the commands as they are run.
   */
  trace?: boolean;

  /**
   * A regular expression to select directives to run by matching against the
   * directive text as-is. The regular expression does not need to match the entire
   * text of the directive, but it must match at least one character. The default is
   * to run all directives.
   */
  run?: RegExp;

  /**
   * A regular expression to select directives to skip by matching against the
   * directive text as-is. The regular expression does not need to match the entire
   * text of the directive, but it must match at least one character. The default is
   * to not skip any directives.
   */
  skip?: RegExp;
}

/**
 * Gets the configuration from the command line arguments.
 */
function fromArgs(args: string[]): AppConfig | undefined {
  const flags = parseFlags(args, {
    boolean: ["help", "dry-run", "verbose", "trace"],
    string: ["import-map", "run", "skip"],
    alias: {
      help: "h",
      "import-map": "imports",
      "dry-run": "n",
      verbose: "v",
      trace: "x",
      run: "r",
      skip: "s",
    },
  });

  if (flags.help) {
    return;
  }

  // TODO: Support multiple entry points.
  const entryPoint = toFileUrl(
    resolve(flags._[0] as string || DEFAULT_ENTRY_POINT_STRING),
  ).toString();

  const importMapPath = flags["import-map"];
  let imports = DEFAULT_IMPORTS;
  if (importMapPath) {
    imports = JSON.parse(
      Deno.readTextFileSync(importMapPath),
    )["imports"] as Imports;
  }

  const dryRun = Boolean(flags["dry-run"]);
  const verbose = Boolean(flags.verbose);
  const trace = Boolean(flags.trace);
  const run = flags.run ? new RegExp(flags.run) : undefined;
  const skip = flags.skip ? new RegExp(flags.skip) : undefined;

  return { graph: { entryPoint, imports }, dryRun, verbose, trace, run, skip };
}

export async function generate() {
  const app = new App(fromArgs(Deno.args));
  await app.action();
}

if (import.meta.main) {
  await generate();
  Deno.exit(0);
}
