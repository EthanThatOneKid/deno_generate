import { assertEquals } from "../../test_deps.ts";

import type { ParsedCommand } from "../parse/mod.ts";

import { graph } from "./graph.ts";
import { walk } from "./walk.ts";

const TEST_CWD = import.meta.resolve("./testdata");

const TEST_SPECIFIER_1 = import.meta.resolve("./testdata/main.ts");
const TEST_SPECIFIER_2 = import.meta.resolve("./testdata/path/to/mod.ts");
const TEST_SPECIFIER_3 = import.meta.resolve("./testdata/main2.ts");

const TEST_GRAPH_1 = await graph({
  entryPoint: TEST_SPECIFIER_1,
  cwd: TEST_CWD,
});

const TEST_GRAPH_2 = await graph({
  entryPoint: TEST_SPECIFIER_2,
  cwd: TEST_CWD,
});

const TEST_GRAPH_3 = await graph({
  entryPoint: TEST_SPECIFIER_3,
  cwd: TEST_CWD,
  imports: { "lib/": "./path/to/" },
});

const TEST_CMD_1: ParsedCommand["cmd"] = ["echo", '"Hello World 1"'];
const TEST_CMD_2: ParsedCommand["cmd"] = ["echo", '"Hello World 2"'];

Deno.test("walks a relative path to a relative file URL", () => {
  const actual = [...walk(TEST_GRAPH_2)];
  const expected = [
    [
      TEST_SPECIFIER_2,
      { cmd: TEST_CMD_2, line: 1, column: 1 },
    ],
  ];
  assertEquals(actual, expected);
});

Deno.test("walks a relative path to a relative file URL (2)", () => {
  const actual = [...walk(TEST_GRAPH_1)];
  const expected = [
    [
      TEST_SPECIFIER_1,
      { cmd: TEST_CMD_1, line: 3, column: 1 },
    ],
    [
      TEST_SPECIFIER_2,
      { cmd: TEST_CMD_2, line: 1, column: 1 },
    ],
  ];
  assertEquals(actual, expected);
});

Deno.test("walks a relative path via import map", () => {
  const actual = [...walk(TEST_GRAPH_3)];
  const expected = [
    [
      TEST_SPECIFIER_3,
      { cmd: TEST_CMD_1, line: 3, column: 1 },
    ],
    [
      TEST_SPECIFIER_2,
      { cmd: TEST_CMD_2, line: 1, column: 1 },
    ],
  ];
  assertEquals(actual, expected);
});
