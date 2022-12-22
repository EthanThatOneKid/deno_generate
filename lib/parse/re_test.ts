import { assertEquals } from "../../test_deps.ts";

import { getMatches } from "./re.ts";

Deno.test("getMatches gets the matches of a regex", () => {
  const matches = getMatches(
    `This is a
multiline string.
It has multiple
lines.`,
    /\b\w+\b/g,
  );
  assertEquals(matches, [
    { match: "This", line: 1, column: 1 },
    { match: "is", line: 1, column: 6 },
    { match: "a", line: 1, column: 9 },
    { match: "multiline", line: 2, column: 1 },
    { match: "string", line: 2, column: 11 },
    { match: "It", line: 3, column: 1 },
    { match: "has", line: 3, column: 4 },
    { match: "multiple", line: 3, column: 8 },
    { match: "lines", line: 4, column: 1 },
  ]);
});
