import {
  globToRegExp,
  isAbsolute,
  isGlob,
  join,
  parse,
  toFileUrl,
} from "../deps.ts";
import type { GenerateOptions } from "../mod.ts";

/**
 * toGenerateOptions converts CLI flags to GenerateOptions.
 */
export function toGenerateOptions(flags: GenerateFlags): GenerateOptions {
  return {
    rootSpecifiers: flags["_"]
      .map(String)
      .map((specifier) =>
        isAbsolute(specifier)
          ? specifier
          : toFileUrl(join(Deno.cwd(), specifier)).href
      ),
    dryRun: flags["dry-run"],
    trace: flags["trace"],
    verbose: flags["verbose"],
    run: flags["run"].map((pattern) => new RegExp(pattern)),
    skip: flags["skip"].map((pattern) => new RegExp(pattern)),
    include: flags["include"]
      .map((specifierOrGlob) =>
        isGlob(specifierOrGlob)
          ? globToRegExp(specifierOrGlob)
          : new RegExp(specifierOrGlob)
      ),
    exclude: flags["exclude"]
      .map((specifierOrGlob) =>
        isGlob(specifierOrGlob)
          ? globToRegExp(specifierOrGlob)
          : new RegExp(specifierOrGlob)
      ),
  };
}

/**
 * GenerateFlags is the CLI flags.
 */
export type GenerateFlags = ReturnType<typeof parseGenerateFlags>;

/**
 * parseGenerateFlags parses the program's CLI flags.
 */
export function parseGenerateFlags(args: string[]) {
  return parse(args, {
    "--": false,
    stopEarly: true,
    string: ["run", "skip", "include", "exclude"],
    collect: ["run", "skip", "include", "exclude"],
    boolean: ["help", "dry-run", "verbose", "trace"],
    alias: {
      "dry-run": ["n"],
      "verbose": ["v"],
      "trace": ["x"],
      "run": ["r"],
      "skip": ["s"],
      "help": ["h"],
    },
    default: {
      "dry-run": false,
      "verbose": false,
      "trace": false,
    },
  });
}
