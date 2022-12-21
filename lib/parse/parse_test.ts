import { assertEquals, isLinux } from "../../test_deps.ts";

import { resolve, toFileUrl } from "../../deps.ts";
import { DEFAULT_IMPORT_MAP } from "../import_map/mod.ts";

import { parse } from "./parse.ts";

const TEST_IMPORT_FOO = toFileUrl(resolve("foo.ts"));
const TEST_IMPORT_FOOBAR = toFileUrl(resolve("foo/bar/foobar.ts"));

Deno.test("parse parses a file with no imports or commands", () => {
  const { imports, commands } = parse(
    `console.log("Hello World!");`,
    DEFAULT_IMPORT_MAP,
    "mod.ts",
  );
  assertEquals(imports, new Set());
  assertEquals(commands, []);
});

Deno.test("parse parses a file with a single import", () => {
  const { imports, commands } = parse(
    `import { foo } from "./foo.ts";`,
    DEFAULT_IMPORT_MAP,
    "mod.ts",
  );
  assertEquals(imports, new Set([TEST_IMPORT_FOO]));
  assertEquals(commands, []);
});

Deno.test("parse parses a file with a single import in a parent directory", () => {
  const { imports, commands } = parse(
    `export { foobar } from "./foobar.ts";`,
    DEFAULT_IMPORT_MAP,
    "foo/bar/mod.ts",
  );
  assertEquals(imports, new Set([TEST_IMPORT_FOOBAR]));
  assertEquals(commands, []);
});

Deno.test("parse parses a file with a single import and a command", () => {
  const { imports, commands } = parse(
    `import { foo } from "./foo.ts"; //deno:generate echo "Hello World!"`,
    DEFAULT_IMPORT_MAP,
    "mod.ts",
  );
  assertEquals(imports, new Set([TEST_IMPORT_FOO]));
  assertEquals(commands, [["echo", '"Hello World!"']]);
});

Deno.test("parse parses a file with a multi-line command", () => {
  const { imports, commands } = parse(
    `//deno:generate echo \\
// "Hello World!"
console.log("Hello World!");`,
    DEFAULT_IMPORT_MAP,
    "mod.ts",
  );
  assertEquals(imports, new Set());
  assertEquals(commands, [["echo", '"Hello World!"']]);
});

Deno.test("parse parses a file with a one-line command and multi-line command", () => {
  const { imports, commands } = parse(
    `//deno:generate echo \\
// "Hello World!"
console.log("Hello World!"); //deno:generate echo "Hello World!"`,
    DEFAULT_IMPORT_MAP,
    "mod.ts",
  );
  assertEquals(imports, new Set());
  assertEquals(commands, [
    ["echo", '"Hello World!"'],
    ["echo", '"Hello World!"'],
  ]);
});
