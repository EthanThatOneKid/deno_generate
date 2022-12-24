import type { ModuleGraph } from "../../deps.ts";

import type { CharacterLocation } from "../parse/mod.ts";
import { parseComments } from "../parse/mod.ts";

export interface GenerateCommand extends CharacterLocation {
  cmd: string[];
  original: string;
}

export type Walk = Generator<[string, GenerateCommand], void, unknown>;

export function* walk({ modules }: ModuleGraph): Walk {
  for (const mod of modules) {
    const aliased = new Map<string, GenerateCommand>();
    for (const comment of parseComments(mod.source)) {
      if (comment.alias) {
        aliased.set(comment.alias, {
          cmd: comment.args,
          line: comment.line,
          character: comment.character,
          original: comment.original,
        });
        continue;
      }

      if (comment.args.length === 0) {
        continue;
      }

      const alias = aliased.get(comment.args[0]);
      if (alias) {
        yield [mod.specifier, {
          cmd: [...alias.cmd, ...comment.args.slice(1)],
          line: comment.line,
          character: comment.character,
          original: comment.original,
        }];
        continue;
      }

      yield [mod.specifier, {
        cmd: comment.args,
        line: comment.line,
        character: comment.character,
        original: comment.original,
      }];
    }
  }
}
