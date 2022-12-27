import { isWindows, join, normalize, toFileUrl } from "../../../deps.ts";

type Imports = Record<string, string>;
type Resolve = (specifier: string, referrer: string) => string;

export function makeResolver(imports: Imports): Resolve {
  return (specifier, referrer) =>
    resolveCurry(
      specifier,
      referrer,
      withImportMap(imports),
      withRelativePath(),
    );
}

/**
 * resolveCurry resolves the given specifier using the given referrer and the
 * given list of resolvers.
 */
export function resolveCurry(
  specifier: string,
  referrer: string,
  ...fns: (typeof resolveCurry)[]
): string {
  return fns.reduce((result, fn) => fn(result, referrer), specifier);
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

export function withImportMap(imports: Imports): typeof resolveCurry {
  return (specifier: string, _: string): string => {
    const result = findMapping(specifier, imports);
    if (result) {
      const [prefix, url] = result;
      return specifier.replace(prefix, url);
    }

    return specifier;
  };
}

export function withRelativePath(): typeof resolveCurry {
  return (specifier: string, referrer: string): string => {
    if (!hasRelativePrefix(specifier)) {
      return specifier;
    }

    if (hasFilePrefix(referrer)) {
      return toFileUrl(join(normalize(referrer), "..", specifier)).toString();
    }

    if (hasExternalPrefix(referrer)) {
      const u = new URL(referrer);
      return new URL(specifier, u.origin + u.pathname).toString();
    }

    return join(normalize(referrer), "..", specifier);
  };
}

export function hasExternalPrefix(path: string): boolean {
  return path.startsWith("http:") || path.startsWith("https:");
}

export function hasFilePrefix(path: string): boolean {
  return path.startsWith("file:");
}

export function hasRelativePrefix(path: string): boolean {
  return !hasExternalPrefix(path) && !hasFilePrefix(path);
}
