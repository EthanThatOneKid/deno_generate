import type { ParsedCommand } from "../parse/mod.ts";
import { parse } from "../parse/mod.ts";
import { urlResolve } from "../url_resolve/mod.ts";
import { DEFAULT_IMPORT_MAP } from "../import_map/mod.ts";

export function* walk(
  entryPoint: string,
  importMap = DEFAULT_IMPORT_MAP,
): Generator<[URL, ParsedCommand], void, unknown> {
  const stack = [urlResolve(entryPoint, importMap)];
  const seen = new Set<URL>();
  while (stack.length > 0) {
    const file = stack.shift()!;
    if (seen.has(file)) {
      continue;
    }

    seen.add(file);
    console.log({ file });
    const fileContent = Deno.readTextFileSync(file);
    const { imports, commands } = parse(fileContent, importMap, file);
    console.log(JSON.stringify({ imports: [...imports], commands }, null, 2));
    for (const path of imports) {
      switch (path.protocol) {
        case "http:":
        case "https:": {
          // TODO: support external imports.
          continue;
        }

        case "file:": {
          const resolvedPath = urlResolve(path, importMap, file);
          stack.push(resolvedPath);
          break;
        }

        default: {
          throw new Error(`Unsupported protocol: ${path.protocol}`);
        }
      }
    }

    for (const cmd of commands) {
      yield [file, cmd];
    }
  }
}
