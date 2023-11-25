# `deno generate` proof-of-concept

🦕 Userland implementation of [`go generate`] for Deno

<table align=center><td>

```ts
// generate_data.ts
const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
const json = response.json();
await Deno.writeTextFile("data.js", `export default ${JSON.stringify(json)}`);
```

<tr><td>

```ts
// app.ts
//deno:generate deno run -A ./generate_data.ts
import data from "./data.js";
console.log(data);
// => { userId: 1, id: 1, title: 'delectus aut autem', completed: false }
```

<tr><td>

```sh
deno_generate
```

</table>

🦕 Designed for Deno-based projects \
🏭 Works great for code generation \
🔒 Use `--allow-run=onlyme` to limit permissions \
⚠️ Unofficial `deno` subcommand

👀 Check out the [Feature request: Add `deno generate` subcommand · Issue #19176
· denoland/deno] discussion if you're interested in seeing a command like
`deno generate` included in the Deno CLI.

## Install

![Deno](https://img.shields.io/static/v1?style=for-the-badge&message=Deno&color=000000&logo=Deno&logoColor=FFFFFF&label=)

```sh
deno install -A https://deno.land/x/deno_generate/main.ts
deno_generate
```

You can also just run it directly when needed:

```sh
deno run -A https://deno.land/x/deno_generate@1/main.ts
```

Or add a task to your `deno.json`:

```jsonc
// deno.json
{
  "tasks": {
    "generate": "deno run -A https://deno.land/x/deno_generate@1/main.ts"
  }
}
```

## Usage

![Deno](https://img.shields.io/static/v1?style=for-the-badge&message=Deno&color=000000&logo=Deno&logoColor=FFFFFF&label=)

```ts
// main.ts
//deno:generate deno eval "await Deno.writeTextFile('data.json', '1000'))"
const data = JSON.parse(await Deno.readTextFile("data.json"));
console.log(data);
//=> 1000
```

```sh
deno_generate
deno run -A main.ts
#=> 1000
```

You can use `deno:generate` to run Deno scripts that generate data for your app
to consume.

```ts
// generate_data.ts
const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
const json = await response.json();
await Deno.writeTextFile("data.json", JSON.stringify(json));
```

```ts
// main.ts
//deno:generate deno run -A ./generate_data.ts
const data = JSON.parse(await Deno.readTextFile("data.json"));
console.log(data);
//=> { userId: 1, id: 1, title: 'delectus aut autem', completed: false }
```

💡 Pro tip: Use the `--allow-run=mycommand` flag with `deno run` to limit which
commands `deno_generate` can spawn.

```sh
deno_generate
deno run -A main.ts
#=> { userId: 1, id: 1, title: 'delectus aut autem', completed: false }
```

⚠️ It's recommended to commit any generated files to source control so that any
user of your package can import it directly from GitHub without needing to run
`deno_generate` themselves with a build step on their own machine.

ℹ `deno_generate` only scans one level deep for `deno:generate` comments. If
you want to recursively scan for `deno:generate` comments, specify a glob
pattern like `deno_generate "./**"`

[Feature request: Add `deno generate` subcommand · Issue #19176 · denoland/deno]:
  https://github.com/denoland/deno/issues/19176
[`go generate`]:
  https://go.googlesource.com/proposal/+/refs/heads/master/design/go-generate.md
