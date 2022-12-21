import { assertEquals } from "../../test_deps.ts";

import { resolve, toFileUrl } from "../../deps.ts";
import type { ImportMap } from "../import_map/mod.ts";
import { DEFAULT_IMPORT_MAP } from "../import_map/mod.ts";

import { urlResolve } from "./resolve.ts";

const TEST_IMPORT_STRING_FOO = "./foo.ts";
// const TEST_IMPORT_URL_FOO = toFileUrl(resolve(TEST_IMPORT_STRING_FOO));
const TEST_IMPORT_URL_FOO = new URL(TEST_IMPORT_STRING_FOO, import.meta.url);
// const TEST_IMPORT_URL_FOO = new URL(import.meta.resolve(TEST_IMPORT_STRING_FOO));

const TEST_IMPORT_STRING_FOOBAR = "./foo/bar/foobar.ts";
const TEST_IMPORT_URL_FOOBAR = new URL(
  TEST_IMPORT_STRING_FOOBAR,
  import.meta.url,
);

Deno.test("resolves a relative path to a relative file URL", () => {
  const actual = urlResolve(TEST_IMPORT_STRING_FOO, DEFAULT_IMPORT_MAP);
  assertEquals(actual, TEST_IMPORT_URL_FOO);
});

Deno.test("resolves mappped path to a relative file URL", () => {
  const actual = urlResolve("lib/hello_world/mod.ts", {
    imports: {
      "lib/": "path/to/lib/",
    },
  });
  const expected = new URL("./path/to/hello_world/mod.ts", import.meta.url);
  assertEquals(actual, expected);
});

const TEST_CASES_PARENT_UNDEFINED: [
  string | URL,
  ImportMap,
  URL,
  string,
][] = [[
  "std/path/mod.ts",
  {
    imports: {
      "std/": "https://deno.land/std/",
    },
  },
  new URL("https://deno.land/std/path/mod.ts"),
  "resolves a URL against an import map",
]];

Deno.test("resolves a URL relative to an absolute parent URL", () => {
  const actual = urlResolve(
    "./path/to/mod.ts",
    DEFAULT_IMPORT_MAP,
    new URL("./testdata/main.ts", import.meta.url),
  );
  const expected = new URL("./testdata/path/to/mod.ts", import.meta.url);
  assertEquals(actual, expected);
});

const TEST_CASES_PARENT_STRING: [
  string | URL,
  ImportMap,
  string,
  URL,
  string,
][] = [
  [
    "./mod.ts",
    DEFAULT_IMPORT_MAP,
    "foo/bar",
    new URL("file://foo/mod.ts"),
    "resolves a relative path to a relative file URL",
  ],
  [
    "./path/to/mod.ts",
    DEFAULT_IMPORT_MAP,
    import.meta.resolve("./testdata"),
    new URL("./testdata/path/to/mod.ts", import.meta.url),
    "resolves a URL relative to an absolute parent string",
  ],
  [
    "./path/to/mod.ts",
    DEFAULT_IMPORT_MAP,
    "./lib/fs/testdata",
    new URL("file://lib/fs/testdata/path/to/mod.ts"),
    "resolves a URL relative to a relative parent string",
  ],
  [
    "https://deno.land/std/path/mod.ts",
    DEFAULT_IMPORT_MAP,
    "foo/bar",
    new URL("https://deno.land/std/path/mod.ts"),
    "resolves a URL ignoring a parent directory",
  ],
  [
    "std/path/mod.ts",
    {
      imports: {
        "std/": "https://deno.land/std/",
      },
    },
    "foo/bar",
    new URL("https://deno.land/std/path/mod.ts"),
    "resolves a URL ignoring a parent directory with an import map",
  ],
];

for (
  const [path, importMap, parent, expected, message] of TEST_CASES_PARENT_URL
) {
  Deno.test({
    name: message,
    fn() {
      const actual = urlResolve(path, importMap, parent);
      assertEquals(actual, expected, message);
    },
  });
}

for (
  const [path, importMap, parent, expected, message] of TEST_CASES_PARENT_STRING
) {
  Deno.test({
    name: message,
    fn() {
      const actual = urlResolve(path, importMap, parent);
      assertEquals(actual, expected, message);
    },
  });
}

for (
  const [path, importMap, expected, message] of TEST_CASES_PARENT_UNDEFINED
) {
  Deno.test({
    name: message,
    fn() {
      const actual = urlResolve(path, importMap);
      assertEquals(actual, expected, message);
    },
  });
}
