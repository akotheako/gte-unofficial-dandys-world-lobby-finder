import { w as slot } from "../../chunks/index.js";
import { N as NavLink } from "../../chunks/NavLink.js";
function _layout($$payload, $$props) {
  $$payload.out.push(`<nav style="display:flex;width:100%;background:rgba(0,0,0,0.4)">`);
  NavLink($$payload, { href: "/home", text: "Home" });
  $$payload.out.push(`<!----> `);
  NavLink($$payload, { href: "/me", text: "Me" });
  $$payload.out.push(`<!----> `);
  NavLink($$payload, { href: "/search", text: "Search" });
  $$payload.out.push(`<!----> `);
  NavLink($$payload, { href: "/contact", text: "Contact" });
  $$payload.out.push(`<!----> `);
  NavLink($$payload, { href: "/tutorials", text: "Tutorials" });
  $$payload.out.push(`<!----> <a href="https://www.roblox.com/games/16116270224" target="_blank">Play</a></nav> <main id="app" style="padding:1rem;color:white"><!---->`);
  slot($$payload, $$props, "default", {});
  $$payload.out.push(`<!----></main>`);
}
export {
  _layout as default
};
