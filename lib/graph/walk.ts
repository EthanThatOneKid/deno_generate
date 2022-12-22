import type { ModuleGraph } from "../../deps.ts";

import type { ParsedCommand } from "../parse/mod.ts";
import { parseCommands } from "../parse/parse_cmds.ts";

export type Walk = Generator<[string, ParsedCommand], void, unknown>;

export function* walk({ modules }: ModuleGraph): Walk {
  for (const mod of modules) {
    for (const cmd of parseCommands(mod.source)) {
      yield [mod.specifier, cmd];
    }
  }
}
