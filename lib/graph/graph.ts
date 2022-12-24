import type { ModuleGraph } from "../../deps.ts";
import { createGraph, join, urlJoin } from "../../deps.ts";

// TODO: Support fallback imports (e.g. `Record<string, string[]>`).
export type Imports = Record<string, string>;

export const DEFAULT_IMPORTS: Imports = {};

export interface Options {
  /**
   * The entry point for the application in question.
   */
  entryPoint: string;

  /**
   * The import map.
   */
  imports?: Imports;
}

/**
 * graph graphs the module graph for the given entry point.
 */
export function graph(o: Options): Promise<ModuleGraph> {
  const _resolve = makeResolver(o.imports);

  function resolve(specifier: string, referrer: string): string {
    const resolved = _resolve(specifier, referrer);
    console.log({ specifier, referrer, resolved });
    return resolved;
  }

  return createGraph(o.entryPoint, { resolve });
}

function makeResolver(imports: Imports = {}): (s: string, r: string) => string {
  return (specifier, referrer) => {
    if (hasExternalPrefix(referrer)) {
      return urlJoin(referrer, "..", specifier);
    }

    const known = findMapping(specifier, imports);
    if (known) {
      const [prefix, url] = known;
      specifier = urlJoin(url, specifier.slice(prefix.length));
    }

    if (!hasExternalPrefix(specifier) || !hasFilePrefix(specifier)) {
      return join(referrer, "..", specifier);
    }

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

export function hasExternalPrefix(path: string): boolean {
  return path.startsWith("http://") || path.startsWith("https://");
}

function hasFilePrefix(path: string): boolean {
  return path.startsWith("file://");
}
