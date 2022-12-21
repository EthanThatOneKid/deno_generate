import { dirname, parseFlags } from "../../deps.ts";

import type { ImportMap } from "../import_map/mod.ts";
import { urlResolve } from "../url_resolve/resolve.ts";

export interface ParsedFile {
  imports: Set<URL>;
  commands: ParsedCommand[];
}

export type ParsedCommand = [string | URL, ...string[]];

const RELATIVE_IMPORT_PATTERN =
  /(import|export)(?:[\s.*]([\w*{}\n\r\t, ]+)[\s*]from)?[ \n\t]*(['"])([^'"\n]+)(?:['"])?/gm;
const INLINE_RELATIVE_IMPORT_PATTERN =
  /import\([ \n\t]*(['"])(([^'"\n]+))(?:['"])\)/gm;
const MULTILINE_COMMAND_PATTERN =
  /\/\/deno:generate(.*?)(\\\s*(\r\n|[\r\n])\s*\/\/(.*?))*(\r\n|[\r\n]|$)/gm;

/**
 * This is a very simple parser that only looks for imports and
 * comments because to run arbitrary code generation commands,
 * we only need to parse the file to determine the imports and comments.
 */
export function parse(
  content: string,
  importMap: ImportMap,
  file: string | URL,
): ParsedFile {
  const parent = dirname(file.toString());
  const urls = parseImports(content);
  const imports = new Set<URL>();
  for (const url of urls) {
    imports.add(urlResolve(url, importMap, parent));
  }

  const commands = parseCommands(content);
  return { imports, commands };
}

function parseCommands(content: string) {
  return [...content.matchAll(MULTILINE_COMMAND_PATTERN)]
    .map(([match]) => fromComment(match));
}

/**
 * Example commands all parse to the same thing:
 * //deno:generate echo "Hello World!"
 *
 * //deno:generate echo \
 * //  "Hello World!"
 *
 * //deno:generate echo "Hello \
 * //World!"
 */
function fromComment(comment: string): ParsedCommand {
  // Remove the leading // and trailing whitespace after line breaks.
  const joined = comment.replaceAll(/\\\s*(\r\n|[\r\n])\s*\/\//gm, "");
  // Split on spaces, but not spaces inside quotes.
  const split = joined.match(/(?:[^\s"]+|"[^"]*")+/g) ?? [];
  // Parse CLI arguments using the standard library.
  const flags = parseFlags(split);
  // Remove the first element, which is the annotation, //deno:generate.
  return flags["_"].slice(1) as ParsedCommand;
}

function parseImports(content: string) {
  const relativeImportPaths = [
    ...content.matchAll(RELATIVE_IMPORT_PATTERN),
  ].map((m) => m[4]);
  const inlineRelativeImportPaths = [
    ...content.matchAll(INLINE_RELATIVE_IMPORT_PATTERN),
  ].map((m) => m[2]);
  const urls = relativeImportPaths.concat(inlineRelativeImportPaths);
  return urls;
}
