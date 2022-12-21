import { bold, greet } from "./deps.ts";

if (import.meta.main) {
  main();
}

function main() {
  const greeting = greet(bold("World"));
  console.log(greeting);
}
