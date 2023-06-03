// Create a child process using Deno.Command, running the "generate.ts" script.
const generatorChild = new Deno.Command(Deno.execPath(), {
  args: ["run", "generator.ts"],
  stdin: "piped",
  stdout: "piped",
}).spawn();

// Create another child process, running deno fmt.
const fmtChild = new Deno.Command(Deno.execPath(), {
  args: ["fmt", "-"],
  stdin: "piped",
  stdout: "piped",
}).spawn();

// Pipe the current process stdin to the child process stdin.
generatorChild.stdout.pipeTo(fmtChild.stdin);

// Close the child process stdin.
generatorChild.stdin.close();

// Pipe the child process stdout to a writable file named "generated.ts".
fmtChild.stdout.pipeTo(
  Deno.openSync("generated.ts", { write: true, create: true }).writable,
);
