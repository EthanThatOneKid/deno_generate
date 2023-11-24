import test from "node:test"
import assert from "node:assert/strict"
import { $ } from "npm:execa@^8.0.1"

const $t = $({ cwd: import.meta.resolve("./"), stdio: "inherit" })

test("testing123", async () => {
    await $t`deno run -A ./main.ts`
})
