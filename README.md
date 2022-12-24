# `deno.land/x/generate`

//deno:generate comment useful for generating code within the Deno tool
ecosystem.

## Usage

In your program add a `//deno:generate` comment with the command you want to
run.

For example:

```ts
//deno:generate deno run https://deno.land/std/examples/cat.ts README.md
```

### Run

Now you may generate your code using the `deno-generate` tool. Optionally, you
may provide an import map to resolve imports.

TODO(@EthanThatOneKid): Update this to use the `deno generate` subcommand once
it is in Deno. See proposal: _Coming soon_.

```sh
deno-generate <entrypoint file> --import-map=import_map.json
```

If you do not have `deno-generate` [installed](#install), run the tool directly
from `deno.land` or `github.com`:

```sh
deno run -Ar https://deno.land/x/generate/main.ts <entrypoint file> --import-map=import_map.json
```

```sh
deno run -Ar https://github.com/ethanthatonekid/deno-generate/raw/main/main.ts <entrypoint file> --import-map=import_map.json
```

### Install

Or you may install the `deno-generate` command and run it:

```sh
deno install -rf -A https://deno.land/x/generate/main.ts --name=deno-generate
deno-generate <entrypoint file>
```

<details>
<summary>
Install from source
(Expand for more information)
</summary>

```sh
git clone https://github.com/ethanthatonekid/deno-generate.git
cd deno-generate
deno install -rf -A main.ts --name=deno-generate
```

</details>

### Security

The `deno-generate` tool will only run `//deno:generate` comments that are
running a command allowed by the `--allow-run` flag. This is to prevent
malicious code from being run. You may set this flag on installation or each
time your run the script.

For example, run the following command to only run `deno run` commands:

```sh
deno run -Ar https://deno.land/x/generate/main.ts <entrypoint file> --allow-run=deno
```

More information on the `--allow-run` flag can be found
<https://deno.land/manual@v1.28.3/basics/permissions#permissions-list>.

## Examples

See the examples in the [`examples` directory](examples).

## Development

### Testing

Pass all existing unit tests.

```bash
deno test -A
```

Cover code completely.

```bash
deno test -A --coverage="cov" && deno coverage cov/
```

### Formatting

Properly format.

```bash
deno fmt
```

### Linting

Check for lint errors.

```bash
deno lint
```

### Run

A simple example:

```sh
deno run -Ar main.ts main.ts
```

## Inspiration

- <https://go.googlesource.com/proposal/+/refs/heads/master/design/go-generate.md>

## License

[MIT](LICENSE)

## Acknowledgements

- Thank you to the [Deno](https://deno.land) team for creating such a great
  tool.

---

Created with <3 by [**@EthanThatOneKid**](https://etok.codes/).
