/**
 * HELP is the help text for the generate command.
 */
export const HELP =
  `Automate code generation by running procedures defined in comment annotations.

Usage:
  deno https://deno.land/x/generate/main.ts [<file>...] [options]

Options:
  -n, --dry-run            Print the commands that would be run without 
                           actually running them.
  -r, --run <regexp>       Select directives to run by matching against the
                           directive text as-is.
  -s, --skip <regexp>      Select directives to skip by matching against the
                           directive text as-is.
  -v, --verbose            Print the module specifier and directive text of
                           each directive when running the corresponding
                           generator.
  -x, --trace              Print the commands as they are run.

Examples:
  deno-generate
  deno-generate myfile1.ts
  deno-generate myfile1.ts myfile2.ts
  deno-generate myfile1.ts --dry-run

Deno generate scans a module graph for directives, which are lines starting
with the comment:

  //deno:generate <command> [arguments...]

where command is the generator corresponding to an executable file that can be
run locally. To run, arguments are passed to the generator. The generator is run
from the directory containing the directive.

Note: No space in between "//" and "deno:generate".

The deno generate command does not parse the file, so lines that look like
directives in comments or strings will be treated as directives.

The arguments to the directive are space-separated tokens or double-quoted
strings passed to the generator as arguments. Quoted strings are evaluated
before execution.

To convey to humans and tools that code is generated, generated source files
should have a comment of the form:

  ^// Code generated .* DO NOT EDIT\.$

The line must appear before the first non-comment, non-blank line of the file.

Deno generate sets several variables when running generators:

  $DENO_OS           The operating system of the host running deno generate.
  $DENO_MODULE       The module specifier of the module containing the directive.
  $DENO_LINE         The line number of the directive within the file.
  $DENO_CHARACTER    The character number of the directive within the file.
  $DENO_DIR          The directory containing the file containing the directive.
  $DOLLAR            A dollar sign ($). This is useful for escaping the $ in shell commands.
                     Literature: https://go-review.googlesource.com/c/go/+/8091

A directive may define a command alias for the file:

  //deno:generate -command <command> [arguments...]

where, for the remainder of this source file, the command <command> is replaced
by the arguments. This can be used to create aliases for long commands or to
define arguments that are common to multiple directives. For example:

  //deno:generate -command cat deno run --allow-read https://deno.land/std/examples/cat.ts
  (...)
  //deno:generate deno run ./generate_code.ts

The -command directive may appear anywhere in the file, but it is usually placed
at the top of the file, before any directives that use it.

The --run flag specifies a regular expression to select directives to run by
matching against the directive text as-is. The regular expression does not need
to match the entire text of the directive, but it must match at least one
character. The default is to run all directives.

The --skip flag specifies a regular expression to select directives to skip by
matching against the directive text as-is. The regular expression does not need
to match the entire text of the directive, but it must match at least one
character. The default is to not skip any directives.

The --dry-run flag (-n) prints the commands that would be run without actually
running them.

The --verbose flag (-v) prints the module specifier and directive
text of each directive when running the corresponding generator.

The --trace flag (-x) prints the commands as they are run.

You can also combine these flags to modify deno generate's behavior in different
ways. For example, deno generate -n -v mod.ts will run generate in dry run mode
and print more detailed information about the commands that it would run, while
deno generate -v -x will run generate in verbose mode and print the commands
that it is running as it runs them.`;
