import type { LoadResponse, ModuleGraph } from "../../deps.ts";
import {
  createGraph,
  globToRegExp,
  isAbsolute,
  join,
  load as defaultLoad,
  resolve,
  toFileUrl,
} from "../../deps.ts";

// TODO: Support fallback imports (e.g. `Record<string, string[]>`).
// export type Imports = Record<string, string>;

type ImportsJSON = Record<string, string | string[]>;

type Imports = Record<string, string[]>;

export const DEFAULT_IMPORTS: Imports = {};

export interface Options {
  /**
   * The entry point for the application in question.
   */
  entryPoint: string;

  /**
   * The import map.
   */
  imports?: ImportsJSON;

  /**
   * List of files or directories that will be generated from.
   */
  include?: string[];

  /**
   * List of files or directories that will be excluded from the generated files.
   */
  exclude?: string[];
}

/**
 * graph graphs the module graph for the given entry point.
 */
export function graph(o: Options): Promise<ModuleGraph> {
  const imports = fromJSON(o.imports);
  // const resolver = makeResolver(o.imports);

  // function resolve(specifier: string, referrer: string): string {
  //   const resolved = resolver(specifier, referrer);
  //   console.log(JSON.stringify({ resolved, specifier, referrer }, null, 2));
  //   return resolved;
  // }

  const loader = makeLoader(
    o.include?.map((s) => globToRegExp(s)),
    o.exclude?.map((s) => globToRegExp(s)),
  );

  async function load(specifier: string): Promise<LoadResponse | undefined> {
    return await loader(specifier);
  }

  return createGraph(o.entryPoint, { imports, load });
}

function makeLoader(
  include?: RegExp[],
  exclude?: RegExp[],
): (s: string) => Promise<LoadResponse | undefined> {
  return async (specifier) => {
    if (include) {
      const matches = include.some((r) => r.test(specifier));
      if (!matches) {
        return;
      }
    }

    if (exclude) {
      const matches = exclude.some((r) => r.test(specifier));
      if (matches) {
        return;
      }
    }

    return await defaultLoad(specifier);
  };
}

// function makeResolver(imports: Imports = {}): (s: string, r: string) => string {
//   return (specifier, referrer) => {
//     const known = findMapping(specifier, imports);
//     if (known) {
//       const [prefix, url] = known;
//       specifier = urlJoin(url, specifier.slice(prefix.length));
//     }

//     // TODO: Figure out how to take the referrer into account to make a resolution.
//     // return f(specifier, referrer);

//     return resolveSpecifier(specifier, referrer);
//   };
// }

// function findMapping(
//   path: string,
//   imports: Imports,
// ): [string, string] | undefined {
//   for (const [prefix, url] of Object.entries(imports)) {
//     if (path.startsWith(prefix)) {
//       return [prefix, url];
//     }
//   }
// }

function resolveSpecifier(specifier: string, referrer: string): string {
  // if (hasFilePrefix(specifier) || hasRelativePrefix(specifier)) {
  //   return toFileUrl(resolve(referrer, "..", specifier)).toString();
  // }

  let result = specifier;
  if (hasExternalPrefix(specifier)) {
    result = specifier;
  } else if (hasFilePrefix(specifier) || hasRelativePrefix(specifier)) {
    result = toFileUrl(resolve(referrer, "..", specifier)).toString();
  } else {
    // result = resolve(referrer, "..", specifier);
  }

  // console.log(JSON.stringify({ result, specifier, referrer }, null, 2));
  return result;
}

export function hasExternalPrefix(path: string): boolean {
  return path.startsWith("http:") || path.startsWith("https:");
}

function hasFilePrefix(path: string): boolean {
  return path.startsWith("file:");
}

function hasRelativePrefix(path: string): boolean {
  return path.startsWith("./") || path.startsWith("../");
}

function fromJSON(data?: ImportsJSON): Imports {
  if (!data) {
    return DEFAULT_IMPORTS;
  }

  const result: Imports = {};
  for (const [prefix, url] of Object.entries(data)) {
    result[toFileUrl(prefix).toString()] = (Array.isArray(url) ? url : [url])
      .map((u) => !hasExternalPrefix(u) ? toFileUrl(resolve(u)).toString() : u);
  }

  console.log({ result });
  return result;
}
