export interface ImportMap {
  imports: Record<string, string>;
}

export const DEFAULT_IMPORT_MAP: ImportMap = { imports: {} };

export function findMapping(
  path: string,
  importMap: ImportMap,
): [string, string] | undefined {
  for (const [prefix, url] of Object.entries(importMap.imports)) {
    if (path.startsWith(prefix)) {
      return [prefix, url];
    }
  }
}
