import { assertEquals } from "../../test_deps.ts";
import { MediaType } from "../../deps.ts";

import { graph } from "./graph.ts";

Deno.test({
  name: "graph() - imports",
  async fn() {
    const g = await graph({
      entryPoint: import.meta.resolve("./a/foo.ts"), // "file:///a/foo.ts",
      imports: {
        "file:///a/deno.json": ["https://esm.sh/preact/jsx-runtime"],
        "bar/": "./a/path/to/bar/lib/",
      },
    });
    assertEquals(g.toJSON(), {
      "roots": [
        "file:///C:/Users/ethan/Documents/GitHub/deno-generate/lib/graph/a/foo.ts",
      ],
      "modules": [
        {
          "kind": "asserted",
          "size": 2,
          "mediaType": MediaType.Json,
          "specifier":
            "file:///C:/Users/ethan/Documents/GitHub/deno-generate/lib/graph/a/deno.json",
        },
        {
          "dependencies": [
            {
              "specifier": "./deno.json",
              "code": {
                "specifier":
                  "file:///C:/Users/ethan/Documents/GitHub/deno-generate/lib/graph/a/deno.json",
                "span": {
                  "start": {
                    "line": 0,
                    "character": 19,
                  },
                  "end": {
                    "line": 0,
                    "character": 32,
                  },
                },
              },
              "assertionType": "json",
            },
          ],
          "kind": "esm",
          "size": 59,
          "mediaType": MediaType.TypeScript,
          "specifier":
            "file:///C:/Users/ethan/Documents/GitHub/deno-generate/lib/graph/a/foo.ts",
        },
        {
          "dependencies": [
            {
              "specifier":
                "https://esm.sh/stable/preact@10.11.3/deno/jsx-runtime.js",
              "code": {
                "specifier":
                  "https://esm.sh/stable/preact@10.11.3/deno/jsx-runtime.js",
                "span": {
                  "start": {
                    "line": 1,
                    "character": 14,
                  },
                  "end": {
                    "line": 1,
                    "character": 72,
                  },
                },
              },
            },
          ],
          "kind": "esm",
          "size": 116,
          "typesDependency": {
            "specifier":
              "https://esm.sh/v102/preact@10.11.3/jsx-runtime/src/index.d.ts",
            "dependency": {
              "specifier":
                "https://esm.sh/v102/preact@10.11.3/jsx-runtime/src/index.d.ts",
              "span": {
                "start": {
                  "line": 0,
                  "character": 0,
                },
                "end": {
                  "line": 0,
                  "character": 0,
                },
              },
            },
          },
          "mediaType": MediaType.JavaScript,
          "specifier": "https://esm.sh/preact@10.11.3/jsx-runtime",
        },
        {
          "dependencies": [
            {
              "specifier": "/stable/preact@10.11.3/deno/preact.js",
              "code": {
                "specifier":
                  "https://esm.sh/stable/preact@10.11.3/deno/preact.js",
                "span": {
                  "start": {
                    "line": 1,
                    "character": 89,
                  },
                  "end": {
                    "line": 1,
                    "character": 128,
                  },
                },
              },
            },
          ],
          "kind": "esm",
          "size": 591,
          "mediaType": MediaType.JavaScript,
          "specifier":
            "https://esm.sh/stable/preact@10.11.3/deno/jsx-runtime.js",
        },
        {
          "kind": "esm",
          "size": 10201,
          "mediaType": MediaType.JavaScript,
          "specifier": "https://esm.sh/stable/preact@10.11.3/deno/preact.js",
        },
        {
          "dependencies": [
            {
              "specifier": "../../src/index.d.ts",
              "code": {
                "specifier":
                  "https://esm.sh/v102/preact@10.11.3/src/index.d.ts",
                "span": {
                  "start": {
                    "line": 7,
                    "character": 7,
                  },
                  "end": {
                    "line": 7,
                    "character": 29,
                  },
                },
              },
            },
            {
              "specifier": "../../src/jsx.d.ts",
              "code": {
                "specifier": "https://esm.sh/v102/preact@10.11.3/src/jsx.d.ts",
                "span": {
                  "start": {
                    "line": 8,
                    "character": 28,
                  },
                  "end": {
                    "line": 8,
                    "character": 48,
                  },
                },
              },
            },
          ],
          "kind": "esm",
          "size": 1228,
          "mediaType": MediaType.Dts,
          "specifier":
            "https://esm.sh/v102/preact@10.11.3/jsx-runtime/src/index.d.ts",
        },
        {
          "dependencies": [
            {
              "specifier": "./jsx.d.ts",
              "code": {
                "specifier": "https://esm.sh/v102/preact@10.11.3/src/jsx.d.ts",
                "span": {
                  "start": {
                    "line": 2,
                    "character": 28,
                  },
                  "end": {
                    "line": 2,
                    "character": 40,
                  },
                },
              },
            },
          ],
          "kind": "esm",
          "size": 10159,
          "mediaType": MediaType.Dts,
          "specifier": "https://esm.sh/v102/preact@10.11.3/src/index.d.ts",
        },
        {
          "dependencies": [
            {
              "specifier": "./index.d.ts",
              "code": {
                "specifier":
                  "https://esm.sh/v102/preact@10.11.3/src/index.d.ts",
                "span": {
                  "start": {
                    "line": 11,
                    "character": 7,
                  },
                  "end": {
                    "line": 11,
                    "character": 21,
                  },
                },
              },
            },
          ],
          "kind": "esm",
          "size": 44795,
          "mediaType": MediaType.Dts,
          "specifier": "https://esm.sh/v102/preact@10.11.3/src/jsx.d.ts",
        },
      ],
      "imports": [
        {
          "referrer": "file:///a/deno.json",
          "dependencies": [
            {
              "specifier": "https://esm.sh/preact/jsx-runtime",
              "type": {
                "specifier": "https://esm.sh/preact/jsx-runtime",
                "span": {
                  "start": {
                    "line": 0,
                    "character": 0,
                  },
                  "end": {
                    "line": 0,
                    "character": 0,
                  },
                },
              },
            },
          ],
        },
      ],
      "redirects": {
        "https://esm.sh/preact/jsx-runtime":
          "https://esm.sh/preact@10.11.3/jsx-runtime",
      },
    });
  },
});
