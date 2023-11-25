# `deno generate` proof-of-concept

🦕 Userland implementation of [`go generate`] for Deno

<table align=center><td>

```ts
// main.ts
//deno:generate deno run -A npm:peggy@3 css.pegjs
import { parse as parseCSS } from "./css.js";
const ast = parseCSS(`a:hover { background: red; }`)
console.log(ast);
```

<tr><td>

```pegjs
// css.pegjs
start
  = stylesheet:stylesheet comment* { return stylesheet; }
stylesheet
  = charset:(CHARSET_SYM STRING ";")? (S / CDO / CDC)*
    imports:(import (CDO S* / CDC S*)*)*
    rules:((ruleset / media / page) (CDO S* / CDC S*)*)*
// ...
```

<tr><td>

```sh
deno_generate
ls
#=> main.ts css.pegjs css.js
deno run -A main.ts
#=> [Large AST]
```

</table>

🦕 Designed for Deno-based projects \
🏭 Works great for code generation \
🔒 Use `--allow-run=onlyme` to limit permissions \
⚠️ Unofficial `deno` subcommand

👀 Check out the [Feature request: Add `deno generate` subcommand · Issue #19176
· denoland/deno] discussion if you're interested in seeing a command like
`deno generate` included in the Deno CLI.

<sup>This is a _proof-of-concept_. Use `deno task` in any serious projects.</sup>

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

You can use `deno:generate` to run Deno scripts that generate data for your app
to consume. Here's an example that fetches data at generation time:

<table align=center><td>

```ts
// app.ts
//deno:generate deno run -A ./generate_data.ts
import data from "./data.js";
console.log(data);
```

<td>

```sh
deno_generate
ls
#=> app.ts generate_data.ts data.js
deno run -A app.ts
#=> { message: "Hello world!" }
```

<tr><td colspan=2>

```ts
// generate_data.ts
const response = await fetch("https://example.org/data.json");
const json = response.json();
const js = `export default ${JSON.stringify(json)}`;
await Deno.writeTextFile("data.js", js);
```

</table>

💡 Pro tip: Use the `--allow-run=mycommand` flag with `deno run` to limit which
commands `deno_generate` can spawn.

⚠️ It's recommended to commit any generated files to source control so that any
user of your package can import it directly from GitHub without needing to run
`deno_generate` themselves with a build step on their own machine.

Here's another example of a `//deno:generate` command to generate TypeScript types from a JSON schema:

<table align=center><td colspan=2>

```ts
// api.ts
//deno:generate deno run -A npm:json-schema-to-typescript@13 req.schema.json req.d.ts
import type RequestType from "./req.d.ts"
//deno:generate deno run -A npm:json-schema-to-typescript@13 res.schema.json res.d.ts
import type ResponseType from "./res.d.ts"
Deno.serve((request) => {
  const req = await request.json() as RequestType
  const res: ResponseType = {
    from: "server@example.com",
    to: "user@example.org",
    messageHTML: marked(req.messageMD),
  };
  return Response.json(res);
});
```

<tr><td>

```jsonc
// req.schema.json
{
  "type": "object",
  "properties": {
    "messageMD": { "type": "string" }
  },
  "required": ["messageMD"]
}
```

<td>

```jsonc
// res.schema.json
{
  "type": "object",
  "properties": {
    "from": { "type": "string" },
    "to": { "type": "string" },
    "messageHTML": { "type": "string" }
  },
  "required": ["from", "to", "messageHTML"]
}

```

<tr><td colspan=2>

```sh
deno_generate
ls
#=> api.ts req.schema.json res.schema.json req.d.ts res.d.ts
deno run -A api.ts
```

</table>

ℹ `deno_generate` only scans one level deep for `deno:generate` comments. If
you want to recursively scan for `deno:generate` comments, specify a glob
pattern like `deno_generate "./**"`

#### Why do I want to put `//deno:generate <command>` in source code instead of just in `deno task`?

Using `//deno:generate <command>` in a TypeScript file instead of solely relying
on `deno task` offers several advantages. Firstly, incorporating
`//deno:generate` directly into the source code allows for better integration
between the generators and the codebase. This approach enables developers to
easily understand and manage the generators as an integral part of the project.

Additionally, by utilizing `//deno:generate`, we can conveniently run multiple
generators that are closely tied to the specific TypeScript files. While it's
technically feasible to write a `deno task` that mimics the functionality of a
series of `//deno:generate` commands, this approach may not scale efficiently
when the project relies on numerous generators. By placing the `//deno:generate`
directives within the relevant TypeScript files, we achieve a more scalable and
flexible solution for managing generator-related tasks.

#### If I have two files that depend on some generated code, which file do does `//deno:generate` belong in?

In situations where multiple files depend on the same generated code, it's
highly recommended to create a shared module. This shared module serves as a
central location from which both files can import the generated code. By doing
so, we promote better code organization and encourage code reuse.

The shared module approach also simplifies future modifications and updates. If
the generated code needs to be modified or enhanced, we can make the changes in
a single place—the shared module—and have the updates reflect in both files that
depend on it. This not only reduces code duplication but also improves
maintainability by ensuring consistency throughout the project.

<!-- prettier-ignore-start -->
[Feature request: Add `deno generate` subcommand · Issue #19176 · denoland/deno]: https://github.com/denoland/deno/issues/19176
[`go generate`]: https://go.googlesource.com/proposal/+/refs/heads/master/design/go-generate.md
<!-- prettier-ignore-end -->
