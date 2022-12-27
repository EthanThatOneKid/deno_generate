import { assertEquals } from "../../../test_deps.ts";

import {
  makeResolver,
  resolveCurry,
  withImportMap,
  withRelativePath,
} from "./resolver.ts";

const tests = [
  {
    name: "Resolves fully-qualified URLs",
    specifier: "https://example.com/module.js",
    referrer: "https://example.com/index.html",
    expected: "https://example.com/module.js",
  },
  {
    name: "Resolves relative URLs",
    specifier: "./module.js",
    referrer: "https://example.com/index.html",
    expected: "https://example.com/module.js",
  },
  {
    name: "Resolves URLs with a different base URL",
    specifier: "/module.js",
    referrer: "https://example.com/subdir/index.html",
    expected: "https://example.com/module.js",
  },
  {
    name: "Resolves URLs in the import map",
    specifier: "foo",
    referrer: "https://example.com/index.html",
    importMap: {
      imports: {
        foo: "https://example.com/bar.js",
      },
    },
    expected: "https://example.com/bar.js",
  },
];

for (const test of tests) {
  Deno.test(test.name, async () => {
    const importMap = test.importMap || { imports: {} };
    const actual = await resolve(test.specifier, test.referrer, importMap);
    assertEquals(actual, test.expected);
  });
}
