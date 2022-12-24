import { assertEquals } from "../../test_deps.ts";

import { parseComments } from "./parse.ts";

Deno.test("parses a file with a single import and a command", () => {
  const cmds = parseComments(
    `import { foo } from "./foo.ts"; //deno:generate echo "Hello World!"`,
  );
  assertEquals(cmds, [
    {
      args: ["echo", "Hello World!"],
      line: 1,
      character: 33,
    },
  ]);
});

Deno.test("parses a file with a multi-line command", () => {
  const cmds = parseComments(
    `//deno:generate echo \\
// "Hello World!"
console.log("Hello World!");`,
  );
  assertEquals(cmds, [
    {
      args: ["echo", "Hello World!"],
      line: 1,
      character: 1,
    },
  ]);
});

Deno.test("parses a file with a one-line command and multi-line command", () => {
  const cmds = parseComments(
    `//deno:generate echo \\
// "Hello World!"
console.log("Hello World!"); //deno:generate echo "Hello World!"`,
  );
  assertEquals(cmds, [
    {
      args: ["echo", "Hello World!"],
      line: 1,
      character: 1,
    },
    {
      args: ["echo", "Hello World!"],
      line: 3,
      character: 30,
    },
  ]);
});
