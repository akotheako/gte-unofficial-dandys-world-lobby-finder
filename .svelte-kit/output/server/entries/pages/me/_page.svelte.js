import "clsx";
import { v as pop, t as push } from "../../../chunks/index.js";
import { initializeApp } from "firebase/app";
import { getFunctions } from "firebase/functions";
import { getFirestore } from "firebase/firestore";
const app = initializeApp({
  apiKey: "AIzaSyAzv2yATCAmAOVJgoOMS_56vDUv8Mb8gX8",
  authDomain: "storytect-e77d1.firebaseapp.com",
  projectId: "storytect-e77d1",
  storageBucket: "storytect-e77d1.firebasestorage.app",
  messagingSenderId: "178947771962",
  appId: "1:178947771962:web:6b76776633435433b56f03",
  measurementId: "G-X4HHEM6BEF"
});
getFunctions(app);
getFirestore(app);
const ssr = false;
function _page($$payload, $$props) {
  push();
  const genCode = () => Math.random().toString(36).slice(2, 12);
  genCode();
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  pop();
}
export {
  _page as default,
  ssr
};
