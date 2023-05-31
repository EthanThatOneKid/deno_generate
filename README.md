# `deno generate` Proof-of-Concept ![thunder_deno](https://cdn.discordapp.com/emojis/811013541846319105.gif?size=24&quality=lossless)

[![deno doc](https://doc.deno.land/badge.svg)](https://deno.land/x/generate)

Automate code generation by running procedures defined in comment annotations.

This repository is a proof-of-concept for the `deno generate` subcommand as
proposed in <https://github.com/denoland/deno/issues/19176>.

## Usage

To use this tool, you need to add a `//deno:generate` comment in your program
with the command you want to run. For example:

```ts
//deno:generate deno run https://deno.land/std/examples/cat.ts README.md
```

### Running the Tool

To generate your code using the CLI tool, you can run the following command:

```sh
deno-generate <entrypoint file>
```

If you are not interested in installing the script, you can still run it
directly from `deno.land` or `github.com`:

```sh
deno run -Ar https://deno.land/x/generate/main.ts <entrypoint file>
```

```sh
deno run -Ar https://github.com/ethanthatonekid/deno_generate/raw/main/main.ts <entrypoint file>
```

You can also define a task in your `deno.jsonc` file to run the CLI tool in your
project:

```jsonc
{
  "scripts": {
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
Install from script source
(Expand for more information)
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

## Examples

You can find more examples in the [`examples` directory](examples).

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

### Formatting and Linting

To format your code and check for lint errors, use the following command:

This process cleans your code and identifies common errors.

```bash
deno task all
```

The `all` task is defined in [`deno.jsonc`](deno.jsonc) and combines all of the
development tasks into one command.

### Contributing

If you would like to contribute to this project, please read the
[contributing guidelines](CONTRIBUTING.md).

## Inspiration

- [Go Generate Proposal](https://go.googlesource.com/proposal/+/refs/heads/master/design/go-generate.md)

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

Special thanks to the [Deno](https://deno.land) team for creating this excellent
tool.

---

Programmed with 🦕 by [**@EthanThatOneKid**](https://etok.codes/)
