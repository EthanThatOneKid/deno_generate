# `deno generate` Proof-of-Concept ![thunder_deno](https://cdn.discordapp.com/emojis/811013541846319105.gif?size=24&quality=lossless)

[![deno doc](https://doc.deno.land/badge.svg)](https://deno.land/x/generate)

Automate code generation by running procedures defined in comment annotations.

This repository is a proof-of-concept for the `deno generate` subcommand as
proposed in [Deno issue #19176](https://github.com/denoland/deno/issues/19176).

## Usage

To use this tool, you need to add a `//deno:generate` comment in your program
with the command you want to run. For example:

```ts
//deno:generate deno run https://deno.land/std/examples/cat.ts README.md
```

### Running the CLI tool

To generate your code using the CLI tool, you can run the tool from
`deno.land/x` with the command:

```sh
deno run -Ar https://deno.land/x/generate/main.ts <entrypoint file>
```

If you are interested in installing the script, refer to the
[Installation](#installation) section.

```sh
deno-generate <entrypoint file>
```

You can also define a task in your `deno.jsonc` file to run the CLI tool in your
project:

```jsonc
{
  "tasks": {
    "generate": "deno run -Ar https://deno.land/x/generate/main.ts <entrypoint file>"
  }
}
```

### Installation

Alternatively, you can install the script as a command and run it locally:

```sh
deno install -rf -A https://deno.land/x/generate/main.ts --name=deno-generate
deno-generate <entrypoint file>
```

<details>
<summary>
Install from script source (Expand for more information)
</summary>

```sh
git clone https://github.com/ethanthatonekid/deno_generate.git
cd deno_generate
deno install -rf -A main.ts --name=deno-generate
```

</details>

### Security

The CLI tool only executes `//deno:generate` comments that run commands allowed
by the `--allow-run` flag. This security measure is in place to prevent the
execution of malicious code. You can set this flag during installation or each
time you run the script.

For example, to only allow `deno run` commands, use the following command:

```sh
deno run -Ar https://deno.land/x/generate/main.ts <entrypoint file> --allow-run=deno
```

You can find more information about the `--allow-run` flag in the
[Deno permissions documentation](https://deno.land/manual/basics/permissions#permissions-list).

### Use cases

Code generation is an important programming technique because generated files
can automate repetitive or complex tasks, improve code consistency and
maintainability, and save developers time and effort.

As for use cases, your imagination is the limit. Here are a few:

1. Generating code from templates: Developers can define templates for commonly
   used code patterns and use the CLI tool to automatically generate code that
   follows those patterns.
2. Generating code from schemas: If a project uses a schema to define data
   models or API specifications, developers can create generators that generate
   code based on that schema.
3. Generating tests: Developers can define test templates that cover common
   testing scenarios and use the CLI tool to automatically generate tests for
   their code.
4. Generating code from annotations: Developers can add annotations to their
   code that define which generators to run and how to run them.

### Conventions

To ensure a consistent developer experience, we recommend following these
conventions when using the CLI tool:

#### Pre-commit

To enhance your development workflow, we recommend implementing a pre-commit
hook in your project's Git repository. Follow these steps to set it up:

1. Create a file named "pre-commit" (without any file extension) within your
   project's ".git/hooks" directory.
2. Ensure that the file is executable by running the following command in your
   terminal:

```bash
chmod +x .git/hooks/pre-commit
```

3. Open the "pre-commit" file in a text editor and add the following code:

```bash
#!/bin/bash

# Run generators before committing.
deno task generate

# Check if any files have changed.
git diff --exit-code
```

#### Linguist generated

When dealing with code generation, there are situations where generated files
should not be visible to developers during a pull request. To address this, a
setting can be used to differentiate their changes, ensuring a cleaner and more
focused code review. On GitHub, you can achieve this by marking specific files
with the "linguist-generated" attribute in a ".gitattributes" file[^1]. This
attribute allows you to hide these files by default in diffs and exclude them
from contributing to the repository language statistics.

To implement this, follow these steps:

1. Create a ".gitattributes" file in your project's root directory if it doesn't
   already exist.
2. Open the ".gitattributes" file in a text editor and include the relevant file
   patterns along with the "linguist-generated" attribute. For example:

```bash
# Marking generated files
*.generated.extension linguist-generated
```

3. Save the file and commit it to your repository.

Now, when viewing pull requests or generating diffs on GitHub, the marked files
will be hidden by default, providing a more streamlined code review process and
excluding them from language statistics calculations.

## Examples

The `deno generate` subcommand is capable of facilitating the generation of code
in the Deno ecosystem. Developers use code generation to generate code for all
kinds of use cases.

You can find more examples in the [`examples` directory](examples).

### Run a script

Deno scripts should be able to invoke another Deno in its `//deno:generate`
statement:

#### `generator.ts`

The provided code generates basic TypeScript code using a for loop to export
constants.

```ts
//deno:generate deno run -A generate.ts
for (let i = 0; i < 10; i++) {
  console.log(`export const example${i} = ${i};`);
}
```

> **Note** While this example works for simple cases, it is advisable to utilize
> a widely-used library such as [ts-morph](https://github.com/dsherret/ts-morph)
> for more comprehensive and complete examples. `ts-morph` is a TypeScript
> Compiler API wrapper for static analysis and programmatic code changes. This
> module provides an extensive set of features and utilities, simplifying the
> handling of complex code generation scenarios. By leveraging ts-morph,
> developers can ensure a more robust, maintainable code generation process.

##### `generate.ts`

```ts
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
```

### Generate OpenAPI types

OpenAPI is a JSON-based specification that represents comprehensive API details,
providing a formal and professional representation of the API specifications.
One of the most common use cases of OpenAPI is to generate API clients,
simplifying the development process by automatically generating code based on
the defined API specifications. OpenAPI schemas offer versatile applications and
integrations, enabling a wide range of possibilities for API design and
development.

```ts
//deno:generate deno run -A npm:openapi-typescript@6.2.4 ./examples/github_api.json -o ./examples/github_api.ts
```

### Generate static website with Lume

Lume is a website framework for the Deno ecosystem. Entire static websites are
generated by Lume with a single command.
[See more](https://github.com/lumeland/lume).

```ts
//deno:generate deno run -A https://deno.land/x/lume@v1.17.3/cli.ts --src ./examples/lume --dest ./examples/lume/_site
```

### Generate `deno_bindgen` bindings

This tool aims to simplify glue code generation for Deno FFI libraries written
in Rust. [See more](https://github.com/denoland/deno_bindgen).

```ts
//deno:generate deno run -A https://deno.land/x/deno_bindgen@0.8.0/cli.ts
```

### Generate deno-embedder file

deno-embedder is a tool that simplifies the development and distribution of Deno
applications, particularly when access to static files (.txt, .png, etc.) is
required at runtime. It allows you to create an embedder.ts file that
encompasses both configuration and the main function call, providing benefits
such as IDE-based type-checking.
[See more](https://github.com/NfNitLoop/deno-embedder).

#### [`examples/embedder/with_embedder.ts`](examples/embedder/with_embedder.ts)

```ts
//deno:generate deno run -A embedder.ts
import examplesDir from "../embedder_static/dir.ts";

const exampleFile = await examplesDir.load("with_embedder.ts");
console.log("You are currently reading:", await exampleFile.text());
```

Bundlee is a deno-embedder alternative.

```ts
import { Bundlee } from "https://deno.land/x/bundlee/mod.ts";

//deno:generate deno run -A https://deno.land/x/bundlee@0.9.4/bundlee.ts --bundle static/ bundle.json
const staticFiles = await Bundlee.load("bundle.json");
```

### Generate `deno doc` JSON

#### [`examples/docs/with_generate_docs.ts`](examples/docs/with_generate_docs.ts)

```ts
//deno:generate deno run -A generate_docs.ts
import doc from "./doc.json" assert { type: "json" };
```

#### [`examples/docs/generate_docs.ts`](examples/docs/generate_docs.ts)

```ts
// Create a child process running `deno doc --json`.
const child = new Deno.Command(Deno.execPath(), {
  args: ["doc", "--json"],
  stdin: "piped",
  stdout: "piped",
}).spawn();

// Pipe the child process stdout to a writable file named "doc.json".
child.stdout.pipeTo(
  Deno.openSync("doc.json", { write: true, create: true }).writable,
);
```

## Development

To run the tool from source, use the following command:

```sh
deno run -A cli/main.ts --verbose ./examples/with_generate_docs.ts
```

### Testing

To run the existing unit tests, use the following command:

```bash
deno test
```

### Formatting and linting

To format your code and check for lint errors, use the following command:

This process cleans your code and identifies common errors.

```bash
deno task all
```

The `all` task is defined in [`deno.jsonc`](deno.jsonc) and executes the
following tasks:

- `fmt`: Formats the code using
  [Deno fmt](https://deno.land/manual/tools/formatter)
- `lint`: Runs [Deno lint](https://deno.land/manual/tools/linter) to identify
  linting errors

You can run each task individually using the following commands:

```bash
deno task fmt
```

```bash
deno task lint
```

### Contributing

Contributions are welcome! Read the [contributing guide](CONTRIBUTING.md) for
more information.

### FAQ

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

### License

[MIT](LICENSE)

---

Programmed with 🦕 by [**@EthanThatOneKid**](https://etok.codes/)

[^1]: https://docs.github.com/en/repositories/working-with-files/managing-files/customizing-how-changed-files-appear-on-github
