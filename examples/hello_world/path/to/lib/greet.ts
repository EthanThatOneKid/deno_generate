import { greet as thirdPartyGreet } from "third_party/greet/mod.ts";
import { ART } from "generated/art/mod.ts";

//deno:generate deno run tasks/gen_greet_deps.ts -w 20 -h 10
export function greet() {
  return thirdPartyGreet(ART);
}
