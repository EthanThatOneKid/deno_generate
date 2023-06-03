//deno:generate deno run -A generate.ts
for (let i = 0; i < 10; i++) {
  console.log(`export const example${i} = ${i};`);
}
