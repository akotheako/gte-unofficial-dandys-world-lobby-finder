import { y as bind_props } from "./index.js";
import { j as fallback } from "./utils2.js";
import { e as escape_html } from "./escaping.js";
import "clsx";
const replacements = {
  translate: /* @__PURE__ */ new Map([
    [true, "yes"],
    [false, "no"]
  ])
};
function attr(name, value, is_boolean = false) {
  if (value == null || !value && is_boolean) return "";
  const normalized = name in replacements && replacements[name].get(value) || value;
  const assignment = is_boolean ? "" : `="${escape_html(normalized, true)}"`;
  return ` ${name}${assignment}`;
}
function NavLink($$payload, $$props) {
  let href = fallback($$props["href"], "/");
  let text = fallback($$props["text"], href);
  $$payload.out.push(`<a${attr("href", href)}>${escape_html(text)}</a>`);
  bind_props($$props, { href, text });
}
export {
  NavLink as N
};
