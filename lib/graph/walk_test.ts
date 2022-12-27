import { assertEquals } from "../../test_deps.ts";

import { graph } from "./graph.ts";
import { walk } from "./walk.ts";

const TEST_SPECIFIER_1 = import.meta.resolve("./testdata/main.ts");
const TEST_SPECIFIER_2 = import.meta.resolve("./testdata/path/to/mod.ts");
const TEST_SPECIFIER_3 = import.meta.resolve("./testdata/main2.ts");

const TEST_GRAPH_1 = await graph({ entryPoint: TEST_SPECIFIER_1 });
const TEST_GRAPH_2 = await graph({ entryPoint: TEST_SPECIFIER_2 });
const TEST_GRAPH_3 = await graph({
  entryPoint: TEST_SPECIFIER_3,
  imports: { "lib/": "./path/to/" },
});

const TEST_CMD_1: string[] = ["echo", "Hello World 1"];
const TEST_CMD_2: string[] = ["echo", "Hello World 2"];

Deno.test("walks a relative path to a relative file URL", () => {
  const actual = [...walk(TEST_GRAPH_2)];
  const expected = [
    [
      TEST_SPECIFIER_2,
      {
        cmd: TEST_CMD_2,
        line: 1,
        character: 1,
        original: 'echo "Hello World 2"',
      },
    ],
  ];
  assertEquals(actual, expected);
});

Deno.test("walks a relative path to a relative file URL (2)", () => {
  const actual = [...walk(TEST_GRAPH_1)];
  const expected = [
    [
      TEST_SPECIFIER_1,
      {
        cmd: TEST_CMD_1,
        line: 3,
        character: 1,
        original: 'echo "Hello World 1"',
      },
    ],
    [
      TEST_SPECIFIER_1,
      {
        cmd: ["deno", "run", "./hello_world.ts"],
        line: 7,
        character: 1,
        // Alias 'deno' to 'deno run' in the command.
        original: "deno ./hello_world.ts",
      },
    ],
    [
      TEST_SPECIFIER_2,
      {
        cmd: TEST_CMD_2,
        line: 1,
        character: 1,
        original: 'echo "Hello World 2"',
      },
    ],
  ];
  assertEquals(actual, expected);
});

Deno.test("walks a relative path via import map", () => {
  const actual = [...walk(TEST_GRAPH_3)];
  const expected = [
    [
      TEST_SPECIFIER_3,
      {
        cmd: TEST_CMD_1,
        line: 3,
        character: 1,
        original: 'echo "Hello World 1"',
      },
    ],
    [
      TEST_SPECIFIER_2,
      {
        cmd: TEST_CMD_2,
        line: 1,
        character: 1,
        original: 'echo "Hello World 2"',
      },
    ],
  ];
  assertEquals(actual, expected);
});
