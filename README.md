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

Now to generate your code you may either run the command directly from
`deno.land` or `github.com`:

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
deno install -rf -A main.ts --name=deno-generate
```

</details>

### Security

The `deno-generate` command will only run `//deno:generate` comments that are
running a command allowed by the `--allow-run` flag. This is to prevent
malicious code from being run.

For example, run the following command to only run `deno run` commands:

```sh
deno run -Ar https://deno.land/x/generate/main.ts <entrypoint file> --allow-run=deno
```

More information on the `--allow-run` flag can be found
<https://deno.land/manual@v1.28.3/basics/permissions#permissions-list>.

## Examples

See the examples in the [`examples` directory](examples).

## Develop

### Format and lint

```sh
deno fmt
deno lint
```

## License

[MIT](LICENSE)

## Acknowledgements

- Thank you to the [Deno](https://deno.land) team for creating such a great
  tool.

---

Created with <3 by [**@EthanThatOneKid**](https://etok.codes/).
