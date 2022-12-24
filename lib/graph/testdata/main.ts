import { foo } from "./path/to/mod.ts";

//deno:generate echo "Hello World 1"
console.log(foo);

//deno:generate -command deno deno run
//deno:generate deno ./hello_world.ts
