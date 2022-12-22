import type { ModuleGraph } from "../../deps.ts";
import { createGraph, join } from "../../deps.ts";

// TODO: Support fallback imports (e.g. `Record<string, string[]>`).
export type Imports = Record<string, string>;

export const DEFAULT_IMPORTS: Imports = {};

export interface Options {
  entryPoint: string;
  imports?: Imports;
  cwd?: string;
}

/**
 * graph graphs the module graph for the given entry point.
 */
export function graph(o: Options): Promise<ModuleGraph> {
  const resolve = makeResolver(o.imports, o.cwd);
  return createGraph(o.entryPoint, { resolve });
}

function makeResolver(
  imports: Imports = {},
  cwd = Deno.cwd(),
): (specifier: string, referrer: string) => string {
  return (specifier, referrer) => {
    const known = findMapping(specifier, imports);
    if (known) {
      const [prefix, url] = known;
      specifier = specifier.replace(prefix, url);
    }
    if (!specifier.startsWith("http")) {
      specifier = join(cwd, specifier);
    }
    console.log({ specifier, referrer, known });
    return specifier;
  };
}

function findMapping(
  path: string,
  imports: Imports,
): [string, string] | undefined {
  for (const [prefix, url] of Object.entries(imports)) {
    if (path.startsWith(prefix)) {
      return [prefix, url];
    }
  }
}
