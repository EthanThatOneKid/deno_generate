import { E } from "https://deno.land/x/embedder@v1.0.1/embed.ts";
import f0 from "./embedder.ts_.ts";
import f1 from "./with_embedder.ts_.ts";

export default E({
  "embedder.ts": f0,
  "with_embedder.ts": f1,
});
