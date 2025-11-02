

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": true
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.Fh55x21b.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/BH6EWdqu.js","_app/immutable/chunks/DG-OJh56.js","_app/immutable/chunks/DbvfHml9.js","_app/immutable/chunks/Bml6PAJl.js"];
export const stylesheets = ["_app/immutable/assets/0.ufc8atiN.css"];
export const fonts = [];
