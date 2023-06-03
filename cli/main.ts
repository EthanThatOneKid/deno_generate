import { handlers, setup } from "../deps.ts";
import { GENERATE, generate } from "../mod.ts";
import { parseGenerateFlags, toGenerateOptions } from "./flags.ts";
import { HELP } from "./help.ts";

if (import.meta.main) {
  await main();
}

/**
 * main is the entrypoint of the program.
 */
async function main() {
  // Parse flags.
  const flags = parseGenerateFlags(Deno.args);
  if (flags.help || flags._.length === 0) {
    console.log(HELP);
    Deno.exit(0);
  }

  // Convert flags to options.
  const options = toGenerateOptions(flags);

  // Setup logging.
  await setup({
    loggers: {
      [GENERATE]: {
        // Suppress log messages if not verbose.
        level: options.verbose ? "DEBUG" : "WARNING",
        handlers: ["console"],
      },
    },
    handlers: {
      console: new handlers.ConsoleHandler("DEBUG"),
    },
  });

  // Run the generators.
  await generate(options);
}
