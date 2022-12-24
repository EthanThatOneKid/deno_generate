import { walk } from "./walk.ts";
import { graph } from "./graph.ts";

const BIG_GRAPH = await graph({
  entryPoint: import.meta.resolve("../../../main.ts"),
  // TODO: Read from import_map.json from root once it's available.
});

const SMALL_GRAPH = await graph({
  entryPoint: import.meta.resolve("./testdata/main.ts"),
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
