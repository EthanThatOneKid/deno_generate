import { assertEquals } from "../../test_deps.ts";

import { parseCommands } from "./parse_cmds.ts";

Deno.test("parse parses a file with a single import and a command", () => {
  const cmds = parseCommands(
    `import { foo } from "./foo.ts"; //deno:generate echo "Hello World!"`,
  );
  assertEquals(cmds, [
    {
      cmd: ["echo", '"Hello World!"'],
      line: 1,
      column: 33,
    },
  ]);
});

Deno.test("parse parses a file with a multi-line command", () => {
  const cmds = parseCommands(
    `//deno:generate echo \\
// "Hello World!"
console.log("Hello World!");`,
  );
  assertEquals(cmds, [
    {
      cmd: ["echo", '"Hello World!"'],
      line: 1,
      column: 1,
    },
  ]);
});

Deno.test("parse parses a file with a one-line command and multi-line command", () => {
  const cmds = parseCommands(
    `//deno:generate echo \\
// "Hello World!"
console.log("Hello World!"); //deno:generate echo "Hello World!"`,
  );
  assertEquals(cmds, [
    {
      cmd: ["echo", '"Hello World!"'],
      line: 1,
      column: 1,
    },
    {
      cmd: ["echo", '"Hello World!"'],
      line: 3,
      column: 30,
    },
  ]);
});
