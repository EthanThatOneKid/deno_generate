# `deno generate` in user-land

<table align=center><td>

```ts
//deno:generate deno run -A ./generate_data.ts
const data = JSON.parse(await Deno.readTextFile("data.json"));
```

</table>

## Install

```sh
deno install -A https://deno.land/x/deno_generate@1/main.ts
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
//=> { userId: 1, id: 1, title: "delectus aut autem", completed: false }
```

```sh
deno_generate
deno run -A main.ts
#=> { userId: 1, id: 1, title: "delectus aut autem", completed: false }
```

⚠️ It's recommended to commit any generated files to source control so that any
user of your package can import it directly from GitHub without needing to run
`deno_generate` themselves with a build step on their own machine.

ℹ `deno_generate` only scans one level deep for `deno:generate` comments. If you
want to recursively scan for `deno:generate` comments, specify a glob pattern
like `deno_generate "./**"`


