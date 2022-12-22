import { assertEquals } from "../../test_deps.ts";
import { MediaType } from "../../deps.ts";

import { graph } from "./graph.ts";

const TEST_CWD = import.meta.resolve("./testdata");

const TEST_SPECIFIER_1 = import.meta.resolve("./testdata/main.ts");
const TEST_SPECIFIER_2 = import.meta.resolve("./testdata/path/to/mod.ts");
const TEST_SPECIFIER_3 = import.meta.resolve("./testdata/main2.ts");

Deno.test("graph creates a graph with 1 module", async () => {
  const actual = await graph({
    entryPoint: TEST_SPECIFIER_2,
    cwd: TEST_CWD,
  });
  assertEquals(actual.toJSON(), {
    roots: [TEST_SPECIFIER_2],
    modules: [
      {
        kind: "esm",
        mediaType: MediaType.TypeScript,
        size: 63,
        specifier: TEST_SPECIFIER_2,
      },
    ],
    redirects: {},
  });
});

Deno.test("graph creates a graph with 2 modules", async () => {
  const actual = await graph({
    entryPoint: TEST_SPECIFIER_1,
    cwd: TEST_CWD,
  });
  assertEquals(actual.toJSON(), {
    roots: [TEST_SPECIFIER_1],
    modules: [
      {
        dependencies: [
          {
            specifier: "./path/to/mod.ts",
            code: {
              specifier: TEST_SPECIFIER_2,
              span: {
                start: { line: 0, character: 20 },
                end: { line: 0, character: 38 },
              },
            },
          },
        ],
        kind: "esm",
        size: 96,
        mediaType: MediaType.TypeScript,
        specifier: TEST_SPECIFIER_1,
      },
      {
        kind: "esm",
        size: 63,
        mediaType: MediaType.TypeScript,
        specifier: TEST_SPECIFIER_2,
      },
    ],
    redirects: {},
  });
});

Deno.test("graph creates a graph with 2 modules via import map", async () => {
  const actual = await graph({
    entryPoint: TEST_SPECIFIER_3,
    cwd: TEST_CWD,
    imports: { "lib/": "./path/to/" },
  });
  assertEquals(actual.toJSON(), {
    roots: [TEST_SPECIFIER_3],
    modules: [
      {
        dependencies: [
          {
            specifier: "lib/mod.ts",
            code: {
              specifier: TEST_SPECIFIER_2,
              span: {
                start: { line: 0, character: 20 },
                end: { line: 0, character: 32 },
              },
            },
          },
        ],
        kind: "esm",
        size: 94,
        mediaType: MediaType.TypeScript,
        specifier: TEST_SPECIFIER_3,
      },
      {
        kind: "esm",
        size: 63,
        mediaType: MediaType.TypeScript,
        specifier: TEST_SPECIFIER_2,
      },
    ],
    redirects: {},
  });
});
