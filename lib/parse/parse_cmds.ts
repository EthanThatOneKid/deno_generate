import { parseFlags } from "../../deps.ts";
import { getMatches } from "./re.ts";

/**
 * ParsedCommand is a tuple of the command and its arguments.
 */
export interface ParsedCommand {
  cmd: [string | URL, ...string[]];
  line: number;
  column: number;
}

const MULTILINE_COMMAND_PATTERN =
  /\/\/deno:generate(.*?)(\\\s*(\r\n|[\r\n])\s*\/\/(.*?))*(\r\n|[\r\n]|$)/gm;

/**
 * This is a very simple parser that only looks for comments
 * because to run arbitrary code generation commands, we only
 * need to parse the file to determine the comments. With each
 * comment, we return the line and column of the comment so that
 * we can tell the user where errors are.
 *
 * Implements dynamic programming to get the line and column of the comment.
 */
export function parseCommands(content: string): ParsedCommand[] {
  const cmds: ParsedCommand[] = [];
  for (
    const { match, line, column } of getMatches(
      content,
      MULTILINE_COMMAND_PATTERN,
    )
  ) {
    const cmd = fromComment(match);
    cmds.push({ cmd, line, column });
  }
  return cmds;
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
function fromComment(comment: string): ParsedCommand["cmd"] {
  // Remove the leading // and trailing whitespace after line breaks.
  const joined = comment.replaceAll(/\\\s*(\r\n|[\r\n])\s*\/\//gm, "");
  // Split on spaces, but not spaces inside quotes.
  const split = joined.match(/(?:[^\s"]+|"[^"]*")+/g) ?? [];
  // Parse CLI arguments using the standard library.
  const flags = parseFlags(split);
  // Remove the first element, which is the annotation, //deno:generate.
  return flags["_"].slice(1) as ParsedCommand["cmd"];
}
