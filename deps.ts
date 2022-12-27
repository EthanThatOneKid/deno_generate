//deno:generate udd deps.ts
export { expandGlob } from "https://deno.land/std@0.170.0/fs/expand_glob.ts";
export { parse as parseFlags } from "https://deno.land/std@0.170.0/flags/mod.ts";
// export { urlJoin } from "https://deno.land/x/url_join@1.0.0/mod.ts";
export { readableStreamFromReader } from "https://deno.land/std@0.170.0/streams/readable_stream_from_reader.ts";
export { writableStreamFromWriter } from "https://deno.land/std@0.170.0/streams/writable_stream_from_writer.ts";
export { mergeReadableStreams } from "https://deno.land/std@0.170.0/streams/merge_readable_streams.ts";

export {
  basename as posixBasename,
  dirname as posixDirname,
  fromFileUrl as posixFromFileUrl,
  join as posixJoin,
  normalize as posixNormalize,
  relative as posixRelative,
} from "https://deno.land/std@0.170.0/path/posix.ts";

export {
  basename,
  dirname,
  format,
  fromFileUrl,
  isAbsolute,
  join,
  normalize,
  relative,
  resolve,
  toFileUrl,
} from "https://deno.land/std@0.170.0/path/mod.ts";

export type {
  LoadResponse,
  ModuleGraph,
  ResolveResult,
} from "https://deno.land/x/deno_graph@0.40.0/mod.ts";
export {
  createGraph,
  load,
  MediaType,
} from "https://deno.land/x/deno_graph@0.40.0/mod.ts";

export { isWindows, osType } from "https://deno.land/std@0.170.0/_util/os.ts";

export { exec } from "https://deno.land/std@0.168.0/node/child_process.ts";

export { globToRegExp } from "https://deno.land/std@0.87.0/path/glob.ts";
