import process from "node:process"
import { parseArgs, ParseArgsConfig } from "node:util"
import { dirname } from "node:path"
import { readFile } from "node:fs/promises"
import { findUp } from "npm:find-up@^7.0.0"
import { $ } from "npm:execa@^8.0.1"
import { glob } from "npm:glob@^10.3.10"

const version = import.meta.url.match(/\/deno_generate@(\d+\.\d+\.\d+)\//)?.[1]

const help = `\
deno_generate ${version ? `v${version}` : "<unknown version>"}

USAGE
  deno run -A https://deno.land/x/deno_generate@1/main.ts
  # OR
  deno install -A https://deno.land/x/deno_generate@1/main.ts
  deno_generate
`;

const options = {
  help: { type: 'boolean' },
  version: { type: "boolean" },
} satisfies ParseArgsConfig['options']
const { values, positionals } = parseArgs({ options, allowPositionals: true })

if (values.help) {
  console.log(help)
  process.exit(0)
}
if (values.version) {
  console.log(version)
  process.exit(0)
}

const sourcePath = dirname(await findUp(["deno.json", "deno.jsonc", "deno.lock"]))
const sourceFilePaths = await glob("**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}", {
  ignore: ["**/node_modules/**", "**/*.d.{ts,mts,cts,tsx}", "**/*.d.*.{ts,mts,cts,tsx}"],
  cwd: sourcePath,
  absolute: true,
})
for (const sourceFilePath of sourceFilePaths) {
  const text = await readFile(sourceFilePath, "utf8")
  if (/^(#!.*\r?\n)?((\/\/.*)?\r?\n)*\/\/ Code generated .* DO NOT EDIT\.\r?\n/.test(text)) {
    continue
  }
  for (const match of text.matchAll(/^\/\/go:generate\s+(\S+)\s+(.*)/gm)) {
    const cmd = match[1]
    const args = match[2].match(/("(\\(["\\\/bfnrt]|u[a-fA-F0-9]{4})|[^"\\\0-\x1F\x7F]+)*")|\S+/g).map(x => /^".*"$/.test(x) ? JSON.parse(x) : x)
    console.log(cmd, args)
  }
}
