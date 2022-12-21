import {
  dirname,
  fromFileUrl,
  join,
  normalize,
  posixRelative,
  resolve,
  toFileUrl,
  urlJoin,
} from "../../deps.ts";

import type { ImportMap } from "../import_map/mod.ts";
import { findMapping } from "../import_map/mod.ts";

// Example path = "./path/to/mod.ts"
// Example parent = "C:\Users\ethan\Documents\GitHub\deno-generate\lib\fs\testdata\main.ts"
// Example output = "C:\Users\ethan\Documents\GitHub\deno-generate\lib\fs\testdata\path\to\mod.ts"

export function urlResolve(
  path: string | URL,
  importMap: ImportMap,
  parent?: string,
): URL;
export function urlResolve(
  path: string | URL,
  importMap: ImportMap,
  parent?: URL,
): URL;
export function urlResolve(
  path: string | URL,
  importMap: ImportMap,
  parent: string | URL = "",
): URL {
  const serializedPath = path.toString();
  const knownMapping = findMapping(serializedPath, importMap);
  if (!knownMapping) {
    console.log({
      shit: serializedPath.startsWith("http")
        ? new URL(serializedPath)
        : toFileUrl(resolve(urlJoin(parent.toString(), path.toString()))),
      parent,
      path,
      serializedPath,
      // file: toFileUrl(urlJoin(parent, path)),
    });
    return (serializedPath.startsWith("http"))
      ? new URL(serializedPath)
      : toFileUrl(resolve(urlJoin(parent.toString(), path.toString())));
  }

  const [prefix, base] = knownMapping;
  const nextPath = urlJoin(base, serializedPath.slice(prefix.length));
  if (parent instanceof URL) {
    return urlResolve(
      nextPath,
      importMap,
      parent,
    );
  }

  return urlResolve(
    nextPath,
    importMap,
    parent,
  );
}
