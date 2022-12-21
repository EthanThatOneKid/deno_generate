import { assertEquals } from "../../test_deps.ts";

import type { ImportMap } from "../import_map/mod.ts";
import { ParsedCommand } from "../parse/parse.ts";

import { walk } from "./walk.ts";

const TEST_ENTRY_POINT_STRING_1 = import.meta.resolve(
  "./testdata/main.ts",
);
const TEST_ENTRY_POINT_STRING_2 = import.meta.resolve(
  "./testdata/path/to/mod.ts",
);

const TEST_ENTRY_POINT_URL_1 = new URL(
  "./testdata/main.ts",
  import.meta.url,
);
const TEST_ENTRY_POINT_URL_2 = new URL(
  "./testdata/path/to/mod.ts",
  import.meta.url,
);

const TEST_CMD_1: ParsedCommand = ["echo", '"Hello World 1"'];
const TEST_CMD_2: ParsedCommand = ["echo", '"Hello World 2"'];

const TEST_CASES: [
  string,
  ImportMap | undefined,
  Array<[URL, ParsedCommand]>,
  string,
][] = [
  [
    "./lib/fs/testdata/path/to/mod.ts",
    undefined,
    [[TEST_ENTRY_POINT_URL_2, TEST_CMD_2]],
    "walks a relative path to a relative file URL",
  ],
  // [
  //   "./lib/fs/testdata/main.ts",
  //   undefined,
  //   [
  //     [TEST_ENTRY_POINT_RELATIVE_URL_1, TEST_CMD_1],
  //     [TEST_ENTRY_POINT_RELATIVE_URL_2, TEST_CMD_2],
  //   ],
  //   "walks a relative path to a relative file URL (2)",
  // ],
  // [
  //   TEST_ENTRY_POINT_RELATIVE_STRING,
  //   undefined,
  //   [
  //     [TEST_ENTRY_POINT_RELATIVE_URL_1, TEST_CMD_1],
  //     [TEST_ENTRY_POINT_RELATIVE_URL_2, TEST_CMD_2],
  //   ],
  //   "walks an absolute path to a relative file URL",
  // ],
];

Deno.test("walk", () => {
  for (const [path, importMap, expected] of TEST_CASES) {
    const actual = [...walk(path, importMap)];
    assertEquals(actual, expected);
  }
});
