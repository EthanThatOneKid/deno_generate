import { walk } from "./walk.ts";
import { graph } from "./graph.ts";

const BIG_GRAPH = await graph({
  entryPoint: import.meta.resolve("../../../main.ts"),
  cwd: import.meta.resolve("../../../"),
  // TODO: Read from import_map.json in root of repo.
});

const SMALL_GRAPH = await graph({
  entryPoint: import.meta.resolve("./testdata/main.ts"),
  cwd: import.meta.resolve("./testdata"),
});

Deno.bench("walk big graph", () => {
  // deno-lint-ignore no-empty
  for (const _ of walk(BIG_GRAPH)) {
  }
});

Deno.bench("walk small graph", () => {
  // deno-lint-ignore no-empty
  for (const _ of walk(SMALL_GRAPH)) {
  }
});
