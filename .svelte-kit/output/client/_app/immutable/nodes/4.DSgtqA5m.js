import"../chunks/DsnmJJEf.js";import"../chunks/BH6EWdqu.js";import{m as Ii,a5 as ns,W as Ti,aj as is,f as yr,c as _r,r as vr,t as wr,i as cn,q as Er,a as ss,a7 as rs,al as Ar,a6 as Ir}from"../chunks/DG-OJh56.js";import{i as Tr}from"../chunks/D-EumPD_.js";import{i as os}from"../chunks/PUWXyPGz.js";import{o as Sr}from"../chunks/BaSbAj9Z.js";import{p as br}from"../chunks/Bml6PAJl.js";function Si(s,e=!1){var i=e?" !important;":";",o="";for(var a in s){var p=s[a];p!=null&&p!==""&&(o+=" "+a+": "+p+i)}return o}function tn(s){return s[0]!=="-"||s[1]!=="-"?s.toLowerCase():s}function Cr(s,e){if(e){var i="",o,a;if(Array.isArray(e)?(o=e[0],a=e[1]):o=e,s){s=String(s).replaceAll(/\s*\/\*.*?\*\/\s*/g,"").trim();var p=!1,m=0,w=!1,A=[];o&&A.push(...Object.keys(o).map(tn)),a&&A.push(...Object.keys(a).map(tn));var T=0,N=-1;const V=s.length;for(var S=0;S<V;S++){var I=s[S];if(w?I==="/"&&s[S-1]==="*"&&(w=!1):p?p===I&&(p=!1):I==="/"&&s[S+1]==="*"?w=!0:I==='"'||I==="'"?p=I:I==="("?m++:I===")"&&m--,!w&&p===!1&&m===0){if(I===":"&&N===-1)N=S;else if(I===";"||S===V-1){if(N!==-1){var x=tn(s.substring(T,N).trim());if(!A.includes(x)){I!==";"&&S++;var L=s.substring(T,S).trim();i+=" "+L+";"}}T=S+1,N=-1}}}}return o&&(i+=Si(o)),a&&(i+=Si(a,!0)),i=i.trim(),i===""?null:i}return s==null?null:String(s)}function en(s,e={},i,o){for(var a in i){var p=i[a];e[a]!==p&&(i[a]==null?s.style.removeProperty(a):s.style.setProperty(a,p,o))}}function Dr(s,e,i,o){var a=s.__style;if(Ii||a!==e){var p=Cr(e,o);(!Ii||p!==s.getAttribute("style"))&&(p==null?s.removeAttribute("style"):s.style.cssText=p),s.__style=e}else o&&(Array.isArray(o)?(en(s,i?.[0],o[0]),en(s,i?.[1],o[1],"important")):en(s,i,o));return o}var Pr=yr("<div> </div>");function Rr(s,e){ns(e,!1);let i=br(e,"msg",8,""),o=is(!1);Sr(()=>{requestAnimationFrame(()=>Ti(o,!0));const w=setTimeout(()=>Ti(o,!1),1500);return()=>clearTimeout(w)}),os();var a=Pr();let p;var m=_r(a,!0);vr(a),wr(w=>{p=Dr(a,"position:fixed;bottom:1rem;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.8);color:white;padding:.5rem 1rem;border-radius:.5rem;font-size:.9rem;z-index:9999;transition:opacity .3s",p,w),Er(m,i())},[()=>({opacity:cn(o)?1:0})]),ss(s,a),rs()}const Nr=()=>{};var bi={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hs=function(s){const e=[];let i=0;for(let o=0;o<s.length;o++){let a=s.charCodeAt(o);a<128?e[i++]=a:a<2048?(e[i++]=a>>6|192,e[i++]=a&63|128):(a&64512)===55296&&o+1<s.length&&(s.charCodeAt(o+1)&64512)===56320?(a=65536+((a&1023)<<10)+(s.charCodeAt(++o)&1023),e[i++]=a>>18|240,e[i++]=a>>12&63|128,e[i++]=a>>6&63|128,e[i++]=a&63|128):(e[i++]=a>>12|224,e[i++]=a>>6&63|128,e[i++]=a&63|128)}return e},Or=function(s){const e=[];let i=0,o=0;for(;i<s.length;){const a=s[i++];if(a<128)e[o++]=String.fromCharCode(a);else if(a>191&&a<224){const p=s[i++];e[o++]=String.fromCharCode((a&31)<<6|p&63)}else if(a>239&&a<365){const p=s[i++],m=s[i++],w=s[i++],A=((a&7)<<18|(p&63)<<12|(m&63)<<6|w&63)-65536;e[o++]=String.fromCharCode(55296+(A>>10)),e[o++]=String.fromCharCode(56320+(A&1023))}else{const p=s[i++],m=s[i++];e[o++]=String.fromCharCode((a&15)<<12|(p&63)<<6|m&63)}}return e.join("")},as={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(s,e){if(!Array.isArray(s))throw Error("encodeByteArray takes an array as a parameter");this.init_();const i=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,o=[];for(let a=0;a<s.length;a+=3){const p=s[a],m=a+1<s.length,w=m?s[a+1]:0,A=a+2<s.length,T=A?s[a+2]:0,N=p>>2,S=(p&3)<<4|w>>4;let I=(w&15)<<2|T>>6,x=T&63;A||(x=64,m||(I=64)),o.push(i[N],i[S],i[I],i[x])}return o.join("")},encodeString(s,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(s):this.encodeByteArray(hs(s),e)},decodeString(s,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(s):Or(this.decodeStringToByteArray(s,e))},decodeStringToByteArray(s,e){this.init_();const i=e?this.charToByteMapWebSafe_:this.charToByteMap_,o=[];for(let a=0;a<s.length;){const p=i[s.charAt(a++)],w=a<s.length?i[s.charAt(a)]:0;++a;const T=a<s.length?i[s.charAt(a)]:64;++a;const S=a<s.length?i[s.charAt(a)]:64;if(++a,p==null||w==null||T==null||S==null)throw new kr;const I=p<<2|w>>4;if(o.push(I),T!==64){const x=w<<4&240|T>>2;if(o.push(x),S!==64){const L=T<<6&192|S;o.push(L)}}}return o},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let s=0;s<this.ENCODED_VALS.length;s++)this.byteToCharMap_[s]=this.ENCODED_VALS.charAt(s),this.charToByteMap_[this.byteToCharMap_[s]]=s,this.byteToCharMapWebSafe_[s]=this.ENCODED_VALS_WEBSAFE.charAt(s),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[s]]=s,s>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(s)]=s,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(s)]=s)}}};class kr extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Mr=function(s){const e=hs(s);return as.encodeByteArray(e,!0)},Te=function(s){return Mr(s).replace(/\./g,"")},Lr=function(s){try{return as.decodeString(s,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jr(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xr=()=>jr().__FIREBASE_DEFAULTS__,Vr=()=>{if(typeof process>"u"||typeof bi>"u")return;const s=bi.__FIREBASE_DEFAULTS__;if(s)return JSON.parse(s)},Br=()=>{if(typeof document>"u")return;let s;try{s=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=s&&Lr(s[1]);return e&&JSON.parse(e)},cs=()=>{try{return Nr()||xr()||Vr()||Br()}catch(s){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${s}`);return}},Fr=s=>cs()?.emulatorHosts?.[s],ls=s=>{const e=Fr(s);if(!e)return;const i=e.lastIndexOf(":");if(i<=0||i+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const o=parseInt(e.substring(i+1),10);return e[0]==="["?[e.substring(1,i-1),o]:[e.substring(0,i),o]},us=()=>cs()?.config;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ur{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,i)=>{this.resolve=e,this.reject=i})}wrapCallback(e){return(i,o)=>{i?this.reject(i):this.resolve(o),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(i):e(i,o))}}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yn(s){try{return(s.startsWith("http://")||s.startsWith("https://")?new URL(s).hostname:s).endsWith(".cloudworkstations.dev")}catch{return!1}}async function fs(s){return(await fetch(s,{credentials:"include"})).ok}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $r(s,e){if(s.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const i={alg:"none",type:"JWT"},o=e||"demo-project",a=s.iat||0,p=s.sub||s.user_id;if(!p)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const m={iss:`https://securetoken.google.com/${o}`,aud:o,iat:a,exp:a+3600,auth_time:a,sub:p,user_id:p,firebase:{sign_in_provider:"custom",identities:{}},...s};return[Te(JSON.stringify(i)),Te(JSON.stringify(m)),""].join(".")}const te={};function Hr(){const s={prod:[],emulator:[]};for(const e of Object.keys(te))te[e]?s.emulator.push(e):s.prod.push(e);return s}function zr(s){let e=document.getElementById(s),i=!1;return e||(e=document.createElement("div"),e.setAttribute("id",s),i=!0),{created:i,element:e}}let Ci=!1;function ps(s,e){if(typeof window>"u"||typeof document>"u"||!yn(window.location.host)||te[s]===e||te[s]||Ci)return;te[s]=e;function i(I){return`__firebase__banner__${I}`}const o="__firebase__banner",p=Hr().prod.length>0;function m(){const I=document.getElementById(o);I&&I.remove()}function w(I){I.style.display="flex",I.style.background="#7faaf0",I.style.position="fixed",I.style.bottom="5px",I.style.left="5px",I.style.padding=".5em",I.style.borderRadius="5px",I.style.alignItems="center"}function A(I,x){I.setAttribute("width","24"),I.setAttribute("id",x),I.setAttribute("height","24"),I.setAttribute("viewBox","0 0 24 24"),I.setAttribute("fill","none"),I.style.marginLeft="-6px"}function T(){const I=document.createElement("span");return I.style.cursor="pointer",I.style.marginLeft="16px",I.style.fontSize="24px",I.innerHTML=" &times;",I.onclick=()=>{Ci=!0,m()},I}function N(I,x){I.setAttribute("id",x),I.innerText="Learn more",I.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",I.setAttribute("target","__blank"),I.style.paddingLeft="5px",I.style.textDecoration="underline"}function S(){const I=zr(o),x=i("text"),L=document.getElementById(x)||document.createElement("span"),V=i("learnmore"),M=document.getElementById(V)||document.createElement("a"),st=i("preprendIcon"),K=document.getElementById(st)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(I.created){const q=I.element;w(q),N(M,V);const ht=T();A(K,st),q.append(K,L,M,ht),document.body.appendChild(q)}p?(L.innerText="Preview backend disconnected.",K.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(K.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,L.innerText="Preview backend running in this workspace."),L.setAttribute("id",x)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",S):S()}function Gr(){try{return typeof indexedDB=="object"}catch{return!1}}function Wr(){return new Promise((s,e)=>{try{let i=!0;const o="validate-browser-context-for-indexeddb-analytics-module",a=self.indexedDB.open(o);a.onsuccess=()=>{a.result.close(),i||self.indexedDB.deleteDatabase(o),s(!0)},a.onupgradeneeded=()=>{i=!1},a.onerror=()=>{e(a.error?.message||"")}}catch(i){e(i)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qr="FirebaseError";class xt extends Error{constructor(e,i,o){super(i),this.code=e,this.customData=o,this.name=qr,Object.setPrototypeOf(this,xt.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,gs.prototype.create)}}class gs{constructor(e,i,o){this.service=e,this.serviceName=i,this.errors=o}create(e,...i){const o=i[0]||{},a=`${this.service}/${e}`,p=this.errors[e],m=p?Xr(p,o):"Error",w=`${this.serviceName}: ${m} (${a}).`;return new xt(a,w,o)}}function Xr(s,e){return s.replace(Jr,(i,o)=>{const a=e[o];return a!=null?String(a):`<${o}?>`})}const Jr=/\{\$([^}]+)}/g;function Se(s,e){if(s===e)return!0;const i=Object.keys(s),o=Object.keys(e);for(const a of i){if(!o.includes(a))return!1;const p=s[a],m=e[a];if(Di(p)&&Di(m)){if(!Se(p,m))return!1}else if(p!==m)return!1}for(const a of o)if(!i.includes(a))return!1;return!0}function Di(s){return s!==null&&typeof s=="object"}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ds(s){return s&&s._delegate?s._delegate:s}class Lt{constructor(e,i,o){this.name=e,this.instanceFactory=i,this.type=o,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Tt="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kr{constructor(e,i){this.name=e,this.container=i,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const i=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(i)){const o=new Ur;if(this.instancesDeferred.set(i,o),this.isInitialized(i)||this.shouldAutoInitialize())try{const a=this.getOrInitializeService({instanceIdentifier:i});a&&o.resolve(a)}catch{}}return this.instancesDeferred.get(i).promise}getImmediate(e){const i=this.normalizeInstanceIdentifier(e?.identifier),o=e?.optional??!1;if(this.isInitialized(i)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:i})}catch(a){if(o)return null;throw a}else{if(o)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Zr(e))try{this.getOrInitializeService({instanceIdentifier:Tt})}catch{}for(const[i,o]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(i);try{const p=this.getOrInitializeService({instanceIdentifier:a});o.resolve(p)}catch{}}}}clearInstance(e=Tt){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(i=>"INTERNAL"in i).map(i=>i.INTERNAL.delete()),...e.filter(i=>"_delete"in i).map(i=>i._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Tt){return this.instances.has(e)}getOptions(e=Tt){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:i={}}=e,o=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(o))throw Error(`${this.name}(${o}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const a=this.getOrInitializeService({instanceIdentifier:o,options:i});for(const[p,m]of this.instancesDeferred.entries()){const w=this.normalizeInstanceIdentifier(p);o===w&&m.resolve(a)}return a}onInit(e,i){const o=this.normalizeInstanceIdentifier(i),a=this.onInitCallbacks.get(o)??new Set;a.add(e),this.onInitCallbacks.set(o,a);const p=this.instances.get(o);return p&&e(p,o),()=>{a.delete(e)}}invokeOnInitCallbacks(e,i){const o=this.onInitCallbacks.get(i);if(o)for(const a of o)try{a(e,i)}catch{}}getOrInitializeService({instanceIdentifier:e,options:i={}}){let o=this.instances.get(e);if(!o&&this.component&&(o=this.component.instanceFactory(this.container,{instanceIdentifier:Yr(e),options:i}),this.instances.set(e,o),this.instancesOptions.set(e,i),this.invokeOnInitCallbacks(o,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,o)}catch{}return o||null}normalizeInstanceIdentifier(e=Tt){return this.component?this.component.multipleInstances?e:Tt:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Yr(s){return s===Tt?void 0:s}function Zr(s){return s.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qr{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const i=this.getProvider(e.name);if(i.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);i.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const i=new Kr(e,this);return this.providers.set(e,i),i}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var R;(function(s){s[s.DEBUG=0]="DEBUG",s[s.VERBOSE=1]="VERBOSE",s[s.INFO=2]="INFO",s[s.WARN=3]="WARN",s[s.ERROR=4]="ERROR",s[s.SILENT=5]="SILENT"})(R||(R={}));const to={debug:R.DEBUG,verbose:R.VERBOSE,info:R.INFO,warn:R.WARN,error:R.ERROR,silent:R.SILENT},eo=R.INFO,no={[R.DEBUG]:"log",[R.VERBOSE]:"log",[R.INFO]:"info",[R.WARN]:"warn",[R.ERROR]:"error"},io=(s,e,...i)=>{if(e<s.logLevel)return;const o=new Date().toISOString(),a=no[e];if(a)console[a](`[${o}]  ${s.name}:`,...i);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class ms{constructor(e){this.name=e,this._logLevel=eo,this._logHandler=io,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in R))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?to[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,R.DEBUG,...e),this._logHandler(this,R.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,R.VERBOSE,...e),this._logHandler(this,R.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,R.INFO,...e),this._logHandler(this,R.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,R.WARN,...e),this._logHandler(this,R.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,R.ERROR,...e),this._logHandler(this,R.ERROR,...e)}}const so=(s,e)=>e.some(i=>s instanceof i);let Pi,Ri;function ro(){return Pi||(Pi=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function oo(){return Ri||(Ri=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const ys=new WeakMap,ln=new WeakMap,_s=new WeakMap,nn=new WeakMap,_n=new WeakMap;function ho(s){const e=new Promise((i,o)=>{const a=()=>{s.removeEventListener("success",p),s.removeEventListener("error",m)},p=()=>{i(dt(s.result)),a()},m=()=>{o(s.error),a()};s.addEventListener("success",p),s.addEventListener("error",m)});return e.then(i=>{i instanceof IDBCursor&&ys.set(i,s)}).catch(()=>{}),_n.set(e,s),e}function ao(s){if(ln.has(s))return;const e=new Promise((i,o)=>{const a=()=>{s.removeEventListener("complete",p),s.removeEventListener("error",m),s.removeEventListener("abort",m)},p=()=>{i(),a()},m=()=>{o(s.error||new DOMException("AbortError","AbortError")),a()};s.addEventListener("complete",p),s.addEventListener("error",m),s.addEventListener("abort",m)});ln.set(s,e)}let un={get(s,e,i){if(s instanceof IDBTransaction){if(e==="done")return ln.get(s);if(e==="objectStoreNames")return s.objectStoreNames||_s.get(s);if(e==="store")return i.objectStoreNames[1]?void 0:i.objectStore(i.objectStoreNames[0])}return dt(s[e])},set(s,e,i){return s[e]=i,!0},has(s,e){return s instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in s}};function co(s){un=s(un)}function lo(s){return s===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...i){const o=s.call(sn(this),e,...i);return _s.set(o,e.sort?e.sort():[e]),dt(o)}:oo().includes(s)?function(...e){return s.apply(sn(this),e),dt(ys.get(this))}:function(...e){return dt(s.apply(sn(this),e))}}function uo(s){return typeof s=="function"?lo(s):(s instanceof IDBTransaction&&ao(s),so(s,ro())?new Proxy(s,un):s)}function dt(s){if(s instanceof IDBRequest)return ho(s);if(nn.has(s))return nn.get(s);const e=uo(s);return e!==s&&(nn.set(s,e),_n.set(e,s)),e}const sn=s=>_n.get(s);function fo(s,e,{blocked:i,upgrade:o,blocking:a,terminated:p}={}){const m=indexedDB.open(s,e),w=dt(m);return o&&m.addEventListener("upgradeneeded",A=>{o(dt(m.result),A.oldVersion,A.newVersion,dt(m.transaction),A)}),i&&m.addEventListener("blocked",A=>i(A.oldVersion,A.newVersion,A)),w.then(A=>{p&&A.addEventListener("close",()=>p()),a&&A.addEventListener("versionchange",T=>a(T.oldVersion,T.newVersion,T))}).catch(()=>{}),w}const po=["get","getKey","getAll","getAllKeys","count"],go=["put","add","delete","clear"],rn=new Map;function Ni(s,e){if(!(s instanceof IDBDatabase&&!(e in s)&&typeof e=="string"))return;if(rn.get(e))return rn.get(e);const i=e.replace(/FromIndex$/,""),o=e!==i,a=go.includes(i);if(!(i in(o?IDBIndex:IDBObjectStore).prototype)||!(a||po.includes(i)))return;const p=async function(m,...w){const A=this.transaction(m,a?"readwrite":"readonly");let T=A.store;return o&&(T=T.index(w.shift())),(await Promise.all([T[i](...w),a&&A.done]))[0]};return rn.set(e,p),p}co(s=>({...s,get:(e,i,o)=>Ni(e,i)||s.get(e,i,o),has:(e,i)=>!!Ni(e,i)||s.has(e,i)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mo{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(i=>{if(yo(i)){const o=i.getImmediate();return`${o.library}/${o.version}`}else return null}).filter(i=>i).join(" ")}}function yo(s){return s.getComponent()?.type==="VERSION"}const fn="@firebase/app",Oi="0.14.3";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ot=new ms("@firebase/app"),_o="@firebase/app-compat",vo="@firebase/analytics-compat",wo="@firebase/analytics",Eo="@firebase/app-check-compat",Ao="@firebase/app-check",Io="@firebase/auth",To="@firebase/auth-compat",So="@firebase/database",bo="@firebase/data-connect",Co="@firebase/database-compat",Do="@firebase/functions",Po="@firebase/functions-compat",Ro="@firebase/installations",No="@firebase/installations-compat",Oo="@firebase/messaging",ko="@firebase/messaging-compat",Mo="@firebase/performance",Lo="@firebase/performance-compat",jo="@firebase/remote-config",xo="@firebase/remote-config-compat",Vo="@firebase/storage",Bo="@firebase/storage-compat",Fo="@firebase/firestore",Uo="@firebase/ai",$o="@firebase/firestore-compat",Ho="firebase",zo="12.3.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pn="[DEFAULT]",Go={[fn]:"fire-core",[_o]:"fire-core-compat",[wo]:"fire-analytics",[vo]:"fire-analytics-compat",[Ao]:"fire-app-check",[Eo]:"fire-app-check-compat",[Io]:"fire-auth",[To]:"fire-auth-compat",[So]:"fire-rtdb",[bo]:"fire-data-connect",[Co]:"fire-rtdb-compat",[Do]:"fire-fn",[Po]:"fire-fn-compat",[Ro]:"fire-iid",[No]:"fire-iid-compat",[Oo]:"fire-fcm",[ko]:"fire-fcm-compat",[Mo]:"fire-perf",[Lo]:"fire-perf-compat",[jo]:"fire-rc",[xo]:"fire-rc-compat",[Vo]:"fire-gcs",[Bo]:"fire-gcs-compat",[Fo]:"fire-fst",[$o]:"fire-fst-compat",[Uo]:"fire-vertex","fire-js":"fire-js",[Ho]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const be=new Map,Wo=new Map,gn=new Map;function ki(s,e){try{s.container.addComponent(e)}catch(i){ot.debug(`Component ${e.name} failed to register with FirebaseApp ${s.name}`,i)}}function se(s){const e=s.name;if(gn.has(e))return ot.debug(`There were multiple attempts to register component ${e}.`),!1;gn.set(e,s);for(const i of be.values())ki(i,s);for(const i of Wo.values())ki(i,s);return!0}function vs(s,e){const i=s.container.getProvider("heartbeat").getImmediate({optional:!0});return i&&i.triggerHeartbeat(),s.container.getProvider(e)}function ws(s){return s==null?!1:s.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qo={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},mt=new gs("app","Firebase",qo);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xo{constructor(e,i,o){this._isDeleted=!1,this._options={...e},this._config={...i},this._name=i.name,this._automaticDataCollectionEnabled=i.automaticDataCollectionEnabled,this._container=o,this.container.addComponent(new Lt("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw mt.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jo=zo;function Es(s,e={}){let i=s;typeof e!="object"&&(e={name:e});const o={name:pn,automaticDataCollectionEnabled:!0,...e},a=o.name;if(typeof a!="string"||!a)throw mt.create("bad-app-name",{appName:String(a)});if(i||(i=us()),!i)throw mt.create("no-options");const p=be.get(a);if(p){if(Se(i,p.options)&&Se(o,p.config))return p;throw mt.create("duplicate-app",{appName:a})}const m=new Qr(a);for(const A of gn.values())m.addComponent(A);const w=new Xo(i,o,m);return be.set(a,w),w}function As(s=pn){const e=be.get(s);if(!e&&s===pn&&us())return Es();if(!e)throw mt.create("no-app",{appName:s});return e}function yt(s,e,i){let o=Go[s]??s;i&&(o+=`-${i}`);const a=o.match(/\s|\//),p=e.match(/\s|\//);if(a||p){const m=[`Unable to register library "${o}" with version "${e}":`];a&&m.push(`library name "${o}" contains illegal characters (whitespace or "/")`),a&&p&&m.push("and"),p&&m.push(`version name "${e}" contains illegal characters (whitespace or "/")`),ot.warn(m.join(" "));return}se(new Lt(`${o}-version`,()=>({library:o,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ko="firebase-heartbeat-database",Yo=1,re="firebase-heartbeat-store";let on=null;function Is(){return on||(on=fo(Ko,Yo,{upgrade:(s,e)=>{switch(e){case 0:try{s.createObjectStore(re)}catch(i){console.warn(i)}}}}).catch(s=>{throw mt.create("idb-open",{originalErrorMessage:s.message})})),on}async function Zo(s){try{const i=(await Is()).transaction(re),o=await i.objectStore(re).get(Ts(s));return await i.done,o}catch(e){if(e instanceof xt)ot.warn(e.message);else{const i=mt.create("idb-get",{originalErrorMessage:e?.message});ot.warn(i.message)}}}async function Mi(s,e){try{const o=(await Is()).transaction(re,"readwrite");await o.objectStore(re).put(e,Ts(s)),await o.done}catch(i){if(i instanceof xt)ot.warn(i.message);else{const o=mt.create("idb-set",{originalErrorMessage:i?.message});ot.warn(o.message)}}}function Ts(s){return`${s.name}!${s.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qo=1024,th=30;class eh{constructor(e){this.container=e,this._heartbeatsCache=null;const i=this.container.getProvider("app").getImmediate();this._storage=new ih(i),this._heartbeatsCachePromise=this._storage.read().then(o=>(this._heartbeatsCache=o,o))}async triggerHeartbeat(){try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),o=Li();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===o||this._heartbeatsCache.heartbeats.some(a=>a.date===o))return;if(this._heartbeatsCache.heartbeats.push({date:o,agent:i}),this._heartbeatsCache.heartbeats.length>th){const a=sh(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(a,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(e){ot.warn(e)}}async getHeartbeatsHeader(){try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||this._heartbeatsCache.heartbeats.length===0)return"";const e=Li(),{heartbeatsToSend:i,unsentEntries:o}=nh(this._heartbeatsCache.heartbeats),a=Te(JSON.stringify({version:2,heartbeats:i}));return this._heartbeatsCache.lastSentHeartbeatDate=e,o.length>0?(this._heartbeatsCache.heartbeats=o,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),a}catch(e){return ot.warn(e),""}}}function Li(){return new Date().toISOString().substring(0,10)}function nh(s,e=Qo){const i=[];let o=s.slice();for(const a of s){const p=i.find(m=>m.agent===a.agent);if(p){if(p.dates.push(a.date),ji(i)>e){p.dates.pop();break}}else if(i.push({agent:a.agent,dates:[a.date]}),ji(i)>e){i.pop();break}o=o.slice(1)}return{heartbeatsToSend:i,unsentEntries:o}}class ih{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Gr()?Wr().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const i=await Zo(this.app);return i?.heartbeats?i:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const o=await this.read();return Mi(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??o.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const o=await this.read();return Mi(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??o.lastSentHeartbeatDate,heartbeats:[...o.heartbeats,...e.heartbeats]})}else return}}function ji(s){return Te(JSON.stringify({version:2,heartbeats:s})).length}function sh(s){if(s.length===0)return-1;let e=0,i=s[0].date;for(let o=1;o<s.length;o++)s[o].date<i&&(i=s[o].date,e=o);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rh(s){se(new Lt("platform-logger",e=>new mo(e),"PRIVATE")),se(new Lt("heartbeat",e=>new eh(e),"PRIVATE")),yt(fn,Oi,s),yt(fn,Oi,"esm2020"),yt("fire-js","")}rh("");var oh="firebase",hh="12.3.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */yt(oh,hh,"app");/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ss="functions";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ah{constructor(e,i,o,a){this.app=e,this.auth=null,this.messaging=null,this.appCheck=null,this.serverAppAppCheckToken=null,ws(e)&&e.settings.appCheckToken&&(this.serverAppAppCheckToken=e.settings.appCheckToken),this.auth=i.getImmediate({optional:!0}),this.messaging=o.getImmediate({optional:!0}),this.auth||i.get().then(p=>this.auth=p,()=>{}),this.messaging||o.get().then(p=>this.messaging=p,()=>{}),this.appCheck||a?.get().then(p=>this.appCheck=p,()=>{})}async getAuthToken(){if(this.auth)try{return(await this.auth.getToken())?.accessToken}catch{return}}async getMessagingToken(){if(!(!this.messaging||!("Notification"in self)||Notification.permission!=="granted"))try{return await this.messaging.getToken()}catch{return}}async getAppCheckToken(e){if(this.serverAppAppCheckToken)return this.serverAppAppCheckToken;if(this.appCheck){const i=e?await this.appCheck.getLimitedUseToken():await this.appCheck.getToken();return i.error?null:i.token}return null}async getContext(e){const i=await this.getAuthToken(),o=await this.getMessagingToken(),a=await this.getAppCheckToken(e);return{authToken:i,messagingToken:o,appCheckToken:a}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dn="us-central1";class ch{constructor(e,i,o,a,p=dn,m=(...w)=>fetch(...w)){this.app=e,this.fetchImpl=m,this.emulatorOrigin=null,this.contextProvider=new ah(e,i,o,a),this.cancelAllRequests=new Promise(w=>{this.deleteService=()=>Promise.resolve(w())});try{const w=new URL(p);this.customDomain=w.origin+(w.pathname==="/"?"":w.pathname),this.region=dn}catch{this.customDomain=null,this.region=p}}_delete(){return this.deleteService()}_url(e){const i=this.app.options.projectId;return this.emulatorOrigin!==null?`${this.emulatorOrigin}/${i}/${this.region}/${e}`:this.customDomain!==null?`${this.customDomain}/${e}`:`https://${this.region}-${i}.cloudfunctions.net/${e}`}}function lh(s,e,i){const o=yn(e);s.emulatorOrigin=`http${o?"s":""}://${e}:${i}`,o&&(fs(s.emulatorOrigin+"/backends"),ps("Functions",!0))}const xi="@firebase/functions",Vi="0.13.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uh="auth-internal",fh="app-check-internal",ph="messaging-internal";function gh(s){const e=(i,{instanceIdentifier:o})=>{const a=i.getProvider("app").getImmediate(),p=i.getProvider(uh),m=i.getProvider(ph),w=i.getProvider(fh);return new ch(a,p,m,w,o)};se(new Lt(Ss,e,"PUBLIC").setMultipleInstances(!0)),yt(xi,Vi,s),yt(xi,Vi,"esm2020")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dh(s=As(),e=dn){const o=vs(ds(s),Ss).getImmediate({identifier:e}),a=ls("functions");return a&&bs(o,...a),o}function bs(s,e,i){lh(ds(s),e,i)}gh();var Bi=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var vn;(function(){var s;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(g,c){function u(){}u.prototype=c.prototype,g.F=c.prototype,g.prototype=new u,g.prototype.constructor=g,g.D=function(d,f,_){for(var l=Array(arguments.length-2),W=2;W<arguments.length;W++)l[W-2]=arguments[W];return c.prototype[f].apply(d,l)}}function i(){this.blockSize=-1}function o(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(o,i),o.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function a(g,c,u){u||(u=0);const d=Array(16);if(typeof c=="string")for(var f=0;f<16;++f)d[f]=c.charCodeAt(u++)|c.charCodeAt(u++)<<8|c.charCodeAt(u++)<<16|c.charCodeAt(u++)<<24;else for(f=0;f<16;++f)d[f]=c[u++]|c[u++]<<8|c[u++]<<16|c[u++]<<24;c=g.g[0],u=g.g[1],f=g.g[2];let _=g.g[3],l;l=c+(_^u&(f^_))+d[0]+3614090360&4294967295,c=u+(l<<7&4294967295|l>>>25),l=_+(f^c&(u^f))+d[1]+3905402710&4294967295,_=c+(l<<12&4294967295|l>>>20),l=f+(u^_&(c^u))+d[2]+606105819&4294967295,f=_+(l<<17&4294967295|l>>>15),l=u+(c^f&(_^c))+d[3]+3250441966&4294967295,u=f+(l<<22&4294967295|l>>>10),l=c+(_^u&(f^_))+d[4]+4118548399&4294967295,c=u+(l<<7&4294967295|l>>>25),l=_+(f^c&(u^f))+d[5]+1200080426&4294967295,_=c+(l<<12&4294967295|l>>>20),l=f+(u^_&(c^u))+d[6]+2821735955&4294967295,f=_+(l<<17&4294967295|l>>>15),l=u+(c^f&(_^c))+d[7]+4249261313&4294967295,u=f+(l<<22&4294967295|l>>>10),l=c+(_^u&(f^_))+d[8]+1770035416&4294967295,c=u+(l<<7&4294967295|l>>>25),l=_+(f^c&(u^f))+d[9]+2336552879&4294967295,_=c+(l<<12&4294967295|l>>>20),l=f+(u^_&(c^u))+d[10]+4294925233&4294967295,f=_+(l<<17&4294967295|l>>>15),l=u+(c^f&(_^c))+d[11]+2304563134&4294967295,u=f+(l<<22&4294967295|l>>>10),l=c+(_^u&(f^_))+d[12]+1804603682&4294967295,c=u+(l<<7&4294967295|l>>>25),l=_+(f^c&(u^f))+d[13]+4254626195&4294967295,_=c+(l<<12&4294967295|l>>>20),l=f+(u^_&(c^u))+d[14]+2792965006&4294967295,f=_+(l<<17&4294967295|l>>>15),l=u+(c^f&(_^c))+d[15]+1236535329&4294967295,u=f+(l<<22&4294967295|l>>>10),l=c+(f^_&(u^f))+d[1]+4129170786&4294967295,c=u+(l<<5&4294967295|l>>>27),l=_+(u^f&(c^u))+d[6]+3225465664&4294967295,_=c+(l<<9&4294967295|l>>>23),l=f+(c^u&(_^c))+d[11]+643717713&4294967295,f=_+(l<<14&4294967295|l>>>18),l=u+(_^c&(f^_))+d[0]+3921069994&4294967295,u=f+(l<<20&4294967295|l>>>12),l=c+(f^_&(u^f))+d[5]+3593408605&4294967295,c=u+(l<<5&4294967295|l>>>27),l=_+(u^f&(c^u))+d[10]+38016083&4294967295,_=c+(l<<9&4294967295|l>>>23),l=f+(c^u&(_^c))+d[15]+3634488961&4294967295,f=_+(l<<14&4294967295|l>>>18),l=u+(_^c&(f^_))+d[4]+3889429448&4294967295,u=f+(l<<20&4294967295|l>>>12),l=c+(f^_&(u^f))+d[9]+568446438&4294967295,c=u+(l<<5&4294967295|l>>>27),l=_+(u^f&(c^u))+d[14]+3275163606&4294967295,_=c+(l<<9&4294967295|l>>>23),l=f+(c^u&(_^c))+d[3]+4107603335&4294967295,f=_+(l<<14&4294967295|l>>>18),l=u+(_^c&(f^_))+d[8]+1163531501&4294967295,u=f+(l<<20&4294967295|l>>>12),l=c+(f^_&(u^f))+d[13]+2850285829&4294967295,c=u+(l<<5&4294967295|l>>>27),l=_+(u^f&(c^u))+d[2]+4243563512&4294967295,_=c+(l<<9&4294967295|l>>>23),l=f+(c^u&(_^c))+d[7]+1735328473&4294967295,f=_+(l<<14&4294967295|l>>>18),l=u+(_^c&(f^_))+d[12]+2368359562&4294967295,u=f+(l<<20&4294967295|l>>>12),l=c+(u^f^_)+d[5]+4294588738&4294967295,c=u+(l<<4&4294967295|l>>>28),l=_+(c^u^f)+d[8]+2272392833&4294967295,_=c+(l<<11&4294967295|l>>>21),l=f+(_^c^u)+d[11]+1839030562&4294967295,f=_+(l<<16&4294967295|l>>>16),l=u+(f^_^c)+d[14]+4259657740&4294967295,u=f+(l<<23&4294967295|l>>>9),l=c+(u^f^_)+d[1]+2763975236&4294967295,c=u+(l<<4&4294967295|l>>>28),l=_+(c^u^f)+d[4]+1272893353&4294967295,_=c+(l<<11&4294967295|l>>>21),l=f+(_^c^u)+d[7]+4139469664&4294967295,f=_+(l<<16&4294967295|l>>>16),l=u+(f^_^c)+d[10]+3200236656&4294967295,u=f+(l<<23&4294967295|l>>>9),l=c+(u^f^_)+d[13]+681279174&4294967295,c=u+(l<<4&4294967295|l>>>28),l=_+(c^u^f)+d[0]+3936430074&4294967295,_=c+(l<<11&4294967295|l>>>21),l=f+(_^c^u)+d[3]+3572445317&4294967295,f=_+(l<<16&4294967295|l>>>16),l=u+(f^_^c)+d[6]+76029189&4294967295,u=f+(l<<23&4294967295|l>>>9),l=c+(u^f^_)+d[9]+3654602809&4294967295,c=u+(l<<4&4294967295|l>>>28),l=_+(c^u^f)+d[12]+3873151461&4294967295,_=c+(l<<11&4294967295|l>>>21),l=f+(_^c^u)+d[15]+530742520&4294967295,f=_+(l<<16&4294967295|l>>>16),l=u+(f^_^c)+d[2]+3299628645&4294967295,u=f+(l<<23&4294967295|l>>>9),l=c+(f^(u|~_))+d[0]+4096336452&4294967295,c=u+(l<<6&4294967295|l>>>26),l=_+(u^(c|~f))+d[7]+1126891415&4294967295,_=c+(l<<10&4294967295|l>>>22),l=f+(c^(_|~u))+d[14]+2878612391&4294967295,f=_+(l<<15&4294967295|l>>>17),l=u+(_^(f|~c))+d[5]+4237533241&4294967295,u=f+(l<<21&4294967295|l>>>11),l=c+(f^(u|~_))+d[12]+1700485571&4294967295,c=u+(l<<6&4294967295|l>>>26),l=_+(u^(c|~f))+d[3]+2399980690&4294967295,_=c+(l<<10&4294967295|l>>>22),l=f+(c^(_|~u))+d[10]+4293915773&4294967295,f=_+(l<<15&4294967295|l>>>17),l=u+(_^(f|~c))+d[1]+2240044497&4294967295,u=f+(l<<21&4294967295|l>>>11),l=c+(f^(u|~_))+d[8]+1873313359&4294967295,c=u+(l<<6&4294967295|l>>>26),l=_+(u^(c|~f))+d[15]+4264355552&4294967295,_=c+(l<<10&4294967295|l>>>22),l=f+(c^(_|~u))+d[6]+2734768916&4294967295,f=_+(l<<15&4294967295|l>>>17),l=u+(_^(f|~c))+d[13]+1309151649&4294967295,u=f+(l<<21&4294967295|l>>>11),l=c+(f^(u|~_))+d[4]+4149444226&4294967295,c=u+(l<<6&4294967295|l>>>26),l=_+(u^(c|~f))+d[11]+3174756917&4294967295,_=c+(l<<10&4294967295|l>>>22),l=f+(c^(_|~u))+d[2]+718787259&4294967295,f=_+(l<<15&4294967295|l>>>17),l=u+(_^(f|~c))+d[9]+3951481745&4294967295,g.g[0]=g.g[0]+c&4294967295,g.g[1]=g.g[1]+(f+(l<<21&4294967295|l>>>11))&4294967295,g.g[2]=g.g[2]+f&4294967295,g.g[3]=g.g[3]+_&4294967295}o.prototype.v=function(g,c){c===void 0&&(c=g.length);const u=c-this.blockSize,d=this.C;let f=this.h,_=0;for(;_<c;){if(f==0)for(;_<=u;)a(this,g,_),_+=this.blockSize;if(typeof g=="string"){for(;_<c;)if(d[f++]=g.charCodeAt(_++),f==this.blockSize){a(this,d),f=0;break}}else for(;_<c;)if(d[f++]=g[_++],f==this.blockSize){a(this,d),f=0;break}}this.h=f,this.o+=c},o.prototype.A=function(){var g=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);g[0]=128;for(var c=1;c<g.length-8;++c)g[c]=0;c=this.o*8;for(var u=g.length-8;u<g.length;++u)g[u]=c&255,c/=256;for(this.v(g),g=Array(16),c=0,u=0;u<4;++u)for(let d=0;d<32;d+=8)g[c++]=this.g[u]>>>d&255;return g};function p(g,c){var u=w;return Object.prototype.hasOwnProperty.call(u,g)?u[g]:u[g]=c(g)}function m(g,c){this.h=c;const u=[];let d=!0;for(let f=g.length-1;f>=0;f--){const _=g[f]|0;d&&_==c||(u[f]=_,d=!1)}this.g=u}var w={};function A(g){return-128<=g&&g<128?p(g,function(c){return new m([c|0],c<0?-1:0)}):new m([g|0],g<0?-1:0)}function T(g){if(isNaN(g)||!isFinite(g))return S;if(g<0)return M(T(-g));const c=[];let u=1;for(let d=0;g>=u;d++)c[d]=g/u|0,u*=4294967296;return new m(c,0)}function N(g,c){if(g.length==0)throw Error("number format error: empty string");if(c=c||10,c<2||36<c)throw Error("radix out of range: "+c);if(g.charAt(0)=="-")return M(N(g.substring(1),c));if(g.indexOf("-")>=0)throw Error('number format error: interior "-" character');const u=T(Math.pow(c,8));let d=S;for(let _=0;_<g.length;_+=8){var f=Math.min(8,g.length-_);const l=parseInt(g.substring(_,_+f),c);f<8?(f=T(Math.pow(c,f)),d=d.j(f).add(T(l))):(d=d.j(u),d=d.add(T(l)))}return d}var S=A(0),I=A(1),x=A(16777216);s=m.prototype,s.m=function(){if(V(this))return-M(this).m();let g=0,c=1;for(let u=0;u<this.g.length;u++){const d=this.i(u);g+=(d>=0?d:4294967296+d)*c,c*=4294967296}return g},s.toString=function(g){if(g=g||10,g<2||36<g)throw Error("radix out of range: "+g);if(L(this))return"0";if(V(this))return"-"+M(this).toString(g);const c=T(Math.pow(g,6));var u=this;let d="";for(;;){const f=ht(u,c).g;u=st(u,f.j(c));let _=((u.g.length>0?u.g[0]:u.h)>>>0).toString(g);if(u=f,L(u))return _+d;for(;_.length<6;)_="0"+_;d=_+d}},s.i=function(g){return g<0?0:g<this.g.length?this.g[g]:this.h};function L(g){if(g.h!=0)return!1;for(let c=0;c<g.g.length;c++)if(g.g[c]!=0)return!1;return!0}function V(g){return g.h==-1}s.l=function(g){return g=st(this,g),V(g)?-1:L(g)?0:1};function M(g){const c=g.g.length,u=[];for(let d=0;d<c;d++)u[d]=~g.g[d];return new m(u,~g.h).add(I)}s.abs=function(){return V(this)?M(this):this},s.add=function(g){const c=Math.max(this.g.length,g.g.length),u=[];let d=0;for(let f=0;f<=c;f++){let _=d+(this.i(f)&65535)+(g.i(f)&65535),l=(_>>>16)+(this.i(f)>>>16)+(g.i(f)>>>16);d=l>>>16,_&=65535,l&=65535,u[f]=l<<16|_}return new m(u,u[u.length-1]&-2147483648?-1:0)};function st(g,c){return g.add(M(c))}s.j=function(g){if(L(this)||L(g))return S;if(V(this))return V(g)?M(this).j(M(g)):M(M(this).j(g));if(V(g))return M(this.j(M(g)));if(this.l(x)<0&&g.l(x)<0)return T(this.m()*g.m());const c=this.g.length+g.g.length,u=[];for(var d=0;d<2*c;d++)u[d]=0;for(d=0;d<this.g.length;d++)for(let f=0;f<g.g.length;f++){const _=this.i(d)>>>16,l=this.i(d)&65535,W=g.i(f)>>>16,vt=g.i(f)&65535;u[2*d+2*f]+=l*vt,K(u,2*d+2*f),u[2*d+2*f+1]+=_*vt,K(u,2*d+2*f+1),u[2*d+2*f+1]+=l*W,K(u,2*d+2*f+1),u[2*d+2*f+2]+=_*W,K(u,2*d+2*f+2)}for(g=0;g<c;g++)u[g]=u[2*g+1]<<16|u[2*g];for(g=c;g<2*c;g++)u[g]=0;return new m(u,0)};function K(g,c){for(;(g[c]&65535)!=g[c];)g[c+1]+=g[c]>>>16,g[c]&=65535,c++}function q(g,c){this.g=g,this.h=c}function ht(g,c){if(L(c))throw Error("division by zero");if(L(g))return new q(S,S);if(V(g))return c=ht(M(g),c),new q(M(c.g),M(c.h));if(V(c))return c=ht(g,M(c)),new q(M(c.g),c.h);if(g.g.length>30){if(V(g)||V(c))throw Error("slowDivide_ only works with positive integers.");for(var u=I,d=c;d.l(g)<=0;)u=at(u),d=at(d);var f=X(u,1),_=X(d,1);for(d=X(d,2),u=X(u,2);!L(d);){var l=_.add(d);l.l(g)<=0&&(f=f.add(u),_=l),d=X(d,1),u=X(u,1)}return c=st(g,f.j(c)),new q(f,c)}for(f=S;g.l(c)>=0;){for(u=Math.max(1,Math.floor(g.m()/c.m())),d=Math.ceil(Math.log(u)/Math.LN2),d=d<=48?1:Math.pow(2,d-48),_=T(u),l=_.j(c);V(l)||l.l(g)>0;)u-=d,_=T(u),l=_.j(c);L(_)&&(_=I),f=f.add(_),g=st(g,l)}return new q(f,g)}s.B=function(g){return ht(this,g).h},s.and=function(g){const c=Math.max(this.g.length,g.g.length),u=[];for(let d=0;d<c;d++)u[d]=this.i(d)&g.i(d);return new m(u,this.h&g.h)},s.or=function(g){const c=Math.max(this.g.length,g.g.length),u=[];for(let d=0;d<c;d++)u[d]=this.i(d)|g.i(d);return new m(u,this.h|g.h)},s.xor=function(g){const c=Math.max(this.g.length,g.g.length),u=[];for(let d=0;d<c;d++)u[d]=this.i(d)^g.i(d);return new m(u,this.h^g.h)};function at(g){const c=g.g.length+1,u=[];for(let d=0;d<c;d++)u[d]=g.i(d)<<1|g.i(d-1)>>>31;return new m(u,g.h)}function X(g,c){const u=c>>5;c%=32;const d=g.g.length-u,f=[];for(let _=0;_<d;_++)f[_]=c>0?g.i(_+u)>>>c|g.i(_+u+1)<<32-c:g.i(_+u);return new m(f,g.h)}o.prototype.digest=o.prototype.A,o.prototype.reset=o.prototype.u,o.prototype.update=o.prototype.v,m.prototype.add=m.prototype.add,m.prototype.multiply=m.prototype.j,m.prototype.modulo=m.prototype.B,m.prototype.compare=m.prototype.l,m.prototype.toNumber=m.prototype.m,m.prototype.toString=m.prototype.toString,m.prototype.getBits=m.prototype.i,m.fromNumber=T,m.fromString=N,vn=m}).apply(typeof Bi<"u"?Bi:typeof self<"u"?self:typeof window<"u"?window:{});var Ee=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};(function(){var s,e=Object.defineProperty;function i(t){t=[typeof globalThis=="object"&&globalThis,t,typeof window=="object"&&window,typeof self=="object"&&self,typeof Ee=="object"&&Ee];for(var n=0;n<t.length;++n){var r=t[n];if(r&&r.Math==Math)return r}throw Error("Cannot find global object")}var o=i(this);function a(t,n){if(n)t:{var r=o;t=t.split(".");for(var h=0;h<t.length-1;h++){var y=t[h];if(!(y in r))break t;r=r[y]}t=t[t.length-1],h=r[t],n=n(h),n!=h&&n!=null&&e(r,t,{configurable:!0,writable:!0,value:n})}}a("Symbol.dispose",function(t){return t||Symbol("Symbol.dispose")}),a("Array.prototype.values",function(t){return t||function(){return this[Symbol.iterator]()}}),a("Object.entries",function(t){return t||function(n){var r=[],h;for(h in n)Object.prototype.hasOwnProperty.call(n,h)&&r.push([h,n[h]]);return r}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var p=p||{},m=this||self;function w(t){var n=typeof t;return n=="object"&&t!=null||n=="function"}function A(t,n,r){return t.call.apply(t.bind,arguments)}function T(t,n,r){return T=A,T.apply(null,arguments)}function N(t,n){var r=Array.prototype.slice.call(arguments,1);return function(){var h=r.slice();return h.push.apply(h,arguments),t.apply(this,h)}}function S(t,n){function r(){}r.prototype=n.prototype,t.Z=n.prototype,t.prototype=new r,t.prototype.constructor=t,t.Ob=function(h,y,v){for(var E=Array(arguments.length-2),b=2;b<arguments.length;b++)E[b-2]=arguments[b];return n.prototype[y].apply(h,E)}}var I=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?t=>t&&AsyncContext.Snapshot.wrap(t):t=>t;function x(t){const n=t.length;if(n>0){const r=Array(n);for(let h=0;h<n;h++)r[h]=t[h];return r}return[]}function L(t,n){for(let h=1;h<arguments.length;h++){const y=arguments[h];var r=typeof y;if(r=r!="object"?r:y?Array.isArray(y)?"array":r:"null",r=="array"||r=="object"&&typeof y.length=="number"){r=t.length||0;const v=y.length||0;t.length=r+v;for(let E=0;E<v;E++)t[r+E]=y[E]}else t.push(y)}}class V{constructor(n,r){this.i=n,this.j=r,this.h=0,this.g=null}get(){let n;return this.h>0?(this.h--,n=this.g,this.g=n.next,n.next=null):n=this.i(),n}}function M(t){m.setTimeout(()=>{throw t},0)}function st(){var t=g;let n=null;return t.g&&(n=t.g,t.g=t.g.next,t.g||(t.h=null),n.next=null),n}class K{constructor(){this.h=this.g=null}add(n,r){const h=q.get();h.set(n,r),this.h?this.h.next=h:this.g=h,this.h=h}}var q=new V(()=>new ht,t=>t.reset());class ht{constructor(){this.next=this.g=this.h=null}set(n,r){this.h=n,this.g=r,this.next=null}reset(){this.next=this.g=this.h=null}}let at,X=!1,g=new K,c=()=>{const t=Promise.resolve(void 0);at=()=>{t.then(u)}};function u(){for(var t;t=st();){try{t.h.call(t.g)}catch(r){M(r)}var n=q;n.j(t),n.h<100&&(n.h++,t.next=n.g,n.g=t)}X=!1}function d(){this.u=this.u,this.C=this.C}d.prototype.u=!1,d.prototype.dispose=function(){this.u||(this.u=!0,this.N())},d.prototype[Symbol.dispose]=function(){this.dispose()},d.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function f(t,n){this.type=t,this.g=this.target=n,this.defaultPrevented=!1}f.prototype.h=function(){this.defaultPrevented=!0};var _=(function(){if(!m.addEventListener||!Object.defineProperty)return!1;var t=!1,n=Object.defineProperty({},"passive",{get:function(){t=!0}});try{const r=()=>{};m.addEventListener("test",r,n),m.removeEventListener("test",r,n)}catch{}return t})();function l(t){return/^[\s\xa0]*$/.test(t)}function W(t,n){f.call(this,t?t.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,t&&this.init(t,n)}S(W,f),W.prototype.init=function(t,n){const r=this.type=t.type,h=t.changedTouches&&t.changedTouches.length?t.changedTouches[0]:null;this.target=t.target||t.srcElement,this.g=n,n=t.relatedTarget,n||(r=="mouseover"?n=t.fromElement:r=="mouseout"&&(n=t.toElement)),this.relatedTarget=n,h?(this.clientX=h.clientX!==void 0?h.clientX:h.pageX,this.clientY=h.clientY!==void 0?h.clientY:h.pageY,this.screenX=h.screenX||0,this.screenY=h.screenY||0):(this.clientX=t.clientX!==void 0?t.clientX:t.pageX,this.clientY=t.clientY!==void 0?t.clientY:t.pageY,this.screenX=t.screenX||0,this.screenY=t.screenY||0),this.button=t.button,this.key=t.key||"",this.ctrlKey=t.ctrlKey,this.altKey=t.altKey,this.shiftKey=t.shiftKey,this.metaKey=t.metaKey,this.pointerId=t.pointerId||0,this.pointerType=t.pointerType,this.state=t.state,this.i=t,t.defaultPrevented&&W.Z.h.call(this)},W.prototype.h=function(){W.Z.h.call(this);const t=this.i;t.preventDefault?t.preventDefault():t.returnValue=!1};var vt="closure_listenable_"+(Math.random()*1e6|0),xs=0;function Vs(t,n,r,h,y){this.listener=t,this.proxy=null,this.src=n,this.type=r,this.capture=!!h,this.ha=y,this.key=++xs,this.da=this.fa=!1}function ce(t){t.da=!0,t.listener=null,t.proxy=null,t.src=null,t.ha=null}function le(t,n,r){for(const h in t)n.call(r,t[h],h,t)}function Bs(t,n){for(const r in t)n.call(void 0,t[r],r,t)}function Tn(t){const n={};for(const r in t)n[r]=t[r];return n}const Sn="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function bn(t,n){let r,h;for(let y=1;y<arguments.length;y++){h=arguments[y];for(r in h)t[r]=h[r];for(let v=0;v<Sn.length;v++)r=Sn[v],Object.prototype.hasOwnProperty.call(h,r)&&(t[r]=h[r])}}function ue(t){this.src=t,this.g={},this.h=0}ue.prototype.add=function(t,n,r,h,y){const v=t.toString();t=this.g[v],t||(t=this.g[v]=[],this.h++);const E=Pe(t,n,h,y);return E>-1?(n=t[E],r||(n.fa=!1)):(n=new Vs(n,this.src,v,!!h,y),n.fa=r,t.push(n)),n};function De(t,n){const r=n.type;if(r in t.g){var h=t.g[r],y=Array.prototype.indexOf.call(h,n,void 0),v;(v=y>=0)&&Array.prototype.splice.call(h,y,1),v&&(ce(n),t.g[r].length==0&&(delete t.g[r],t.h--))}}function Pe(t,n,r,h){for(let y=0;y<t.length;++y){const v=t[y];if(!v.da&&v.listener==n&&v.capture==!!r&&v.ha==h)return y}return-1}var Re="closure_lm_"+(Math.random()*1e6|0),Ne={};function Cn(t,n,r,h,y){if(Array.isArray(n)){for(let v=0;v<n.length;v++)Cn(t,n[v],r,h,y);return null}return r=Rn(r),t&&t[vt]?t.J(n,r,w(h)?!!h.capture:!1,y):Fs(t,n,r,!1,h,y)}function Fs(t,n,r,h,y,v){if(!n)throw Error("Invalid event type");const E=w(y)?!!y.capture:!!y;let b=ke(t);if(b||(t[Re]=b=new ue(t)),r=b.add(n,r,h,E,v),r.proxy)return r;if(h=Us(),r.proxy=h,h.src=t,h.listener=r,t.addEventListener)_||(y=E),y===void 0&&(y=!1),t.addEventListener(n.toString(),h,y);else if(t.attachEvent)t.attachEvent(Pn(n.toString()),h);else if(t.addListener&&t.removeListener)t.addListener(h);else throw Error("addEventListener and attachEvent are unavailable.");return r}function Us(){function t(r){return n.call(t.src,t.listener,r)}const n=$s;return t}function Dn(t,n,r,h,y){if(Array.isArray(n))for(var v=0;v<n.length;v++)Dn(t,n[v],r,h,y);else h=w(h)?!!h.capture:!!h,r=Rn(r),t&&t[vt]?(t=t.i,v=String(n).toString(),v in t.g&&(n=t.g[v],r=Pe(n,r,h,y),r>-1&&(ce(n[r]),Array.prototype.splice.call(n,r,1),n.length==0&&(delete t.g[v],t.h--)))):t&&(t=ke(t))&&(n=t.g[n.toString()],t=-1,n&&(t=Pe(n,r,h,y)),(r=t>-1?n[t]:null)&&Oe(r))}function Oe(t){if(typeof t!="number"&&t&&!t.da){var n=t.src;if(n&&n[vt])De(n.i,t);else{var r=t.type,h=t.proxy;n.removeEventListener?n.removeEventListener(r,h,t.capture):n.detachEvent?n.detachEvent(Pn(r),h):n.addListener&&n.removeListener&&n.removeListener(h),(r=ke(n))?(De(r,t),r.h==0&&(r.src=null,n[Re]=null)):ce(t)}}}function Pn(t){return t in Ne?Ne[t]:Ne[t]="on"+t}function $s(t,n){if(t.da)t=!0;else{n=new W(n,this);const r=t.listener,h=t.ha||t.src;t.fa&&Oe(t),t=r.call(h,n)}return t}function ke(t){return t=t[Re],t instanceof ue?t:null}var Me="__closure_events_fn_"+(Math.random()*1e9>>>0);function Rn(t){return typeof t=="function"?t:(t[Me]||(t[Me]=function(n){return t.handleEvent(n)}),t[Me])}function $(){d.call(this),this.i=new ue(this),this.M=this,this.G=null}S($,d),$.prototype[vt]=!0,$.prototype.removeEventListener=function(t,n,r,h){Dn(this,t,n,r,h)};function H(t,n){var r,h=t.G;if(h)for(r=[];h;h=h.G)r.push(h);if(t=t.M,h=n.type||n,typeof n=="string")n=new f(n,t);else if(n instanceof f)n.target=n.target||t;else{var y=n;n=new f(h,t),bn(n,y)}y=!0;let v,E;if(r)for(E=r.length-1;E>=0;E--)v=n.g=r[E],y=fe(v,h,!0,n)&&y;if(v=n.g=t,y=fe(v,h,!0,n)&&y,y=fe(v,h,!1,n)&&y,r)for(E=0;E<r.length;E++)v=n.g=r[E],y=fe(v,h,!1,n)&&y}$.prototype.N=function(){if($.Z.N.call(this),this.i){var t=this.i;for(const n in t.g){const r=t.g[n];for(let h=0;h<r.length;h++)ce(r[h]);delete t.g[n],t.h--}}this.G=null},$.prototype.J=function(t,n,r,h){return this.i.add(String(t),n,!1,r,h)},$.prototype.K=function(t,n,r,h){return this.i.add(String(t),n,!0,r,h)};function fe(t,n,r,h){if(n=t.i.g[String(n)],!n)return!0;n=n.concat();let y=!0;for(let v=0;v<n.length;++v){const E=n[v];if(E&&!E.da&&E.capture==r){const b=E.listener,F=E.ha||E.src;E.fa&&De(t.i,E),y=b.call(F,h)!==!1&&y}}return y&&!h.defaultPrevented}function Hs(t,n){if(typeof t!="function")if(t&&typeof t.handleEvent=="function")t=T(t.handleEvent,t);else throw Error("Invalid listener argument");return Number(n)>2147483647?-1:m.setTimeout(t,n||0)}function Nn(t){t.g=Hs(()=>{t.g=null,t.i&&(t.i=!1,Nn(t))},t.l);const n=t.h;t.h=null,t.m.apply(null,n)}class zs extends d{constructor(n,r){super(),this.m=n,this.l=r,this.h=null,this.i=!1,this.g=null}j(n){this.h=arguments,this.g?this.i=!0:Nn(this)}N(){super.N(),this.g&&(m.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Vt(t){d.call(this),this.h=t,this.g={}}S(Vt,d);var On=[];function kn(t){le(t.g,function(n,r){this.g.hasOwnProperty(r)&&Oe(n)},t),t.g={}}Vt.prototype.N=function(){Vt.Z.N.call(this),kn(this)},Vt.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Le=m.JSON.stringify,Gs=m.JSON.parse,Ws=class{stringify(t){return m.JSON.stringify(t,void 0)}parse(t){return m.JSON.parse(t,void 0)}};function Mn(){}function qs(){}var Bt={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function je(){f.call(this,"d")}S(je,f);function xe(){f.call(this,"c")}S(xe,f);var Rt={},Ln=null;function Ve(){return Ln=Ln||new $}Rt.Ia="serverreachability";function jn(t){f.call(this,Rt.Ia,t)}S(jn,f);function Ft(t){const n=Ve();H(n,new jn(n))}Rt.STAT_EVENT="statevent";function xn(t,n){f.call(this,Rt.STAT_EVENT,t),this.stat=n}S(xn,f);function z(t){const n=Ve();H(n,new xn(n,t))}Rt.Ja="timingevent";function Vn(t,n){f.call(this,Rt.Ja,t),this.size=n}S(Vn,f);function Ut(t,n){if(typeof t!="function")throw Error("Fn must not be null and must be a function");return m.setTimeout(function(){t()},n)}function $t(){this.g=!0}$t.prototype.ua=function(){this.g=!1};function Xs(t,n,r,h,y,v){t.info(function(){if(t.g)if(v){var E="",b=v.split("&");for(let O=0;O<b.length;O++){var F=b[O].split("=");if(F.length>1){const U=F[0];F=F[1];const tt=U.split("_");E=tt.length>=2&&tt[1]=="type"?E+(U+"="+F+"&"):E+(U+"=redacted&")}}}else E=null;else E=v;return"XMLHTTP REQ ("+h+") [attempt "+y+"]: "+n+`
`+r+`
`+E})}function Js(t,n,r,h,y,v,E){t.info(function(){return"XMLHTTP RESP ("+h+") [ attempt "+y+"]: "+n+`
`+r+`
`+v+" "+E})}function Nt(t,n,r,h){t.info(function(){return"XMLHTTP TEXT ("+n+"): "+Ys(t,r)+(h?" "+h:"")})}function Ks(t,n){t.info(function(){return"TIMEOUT: "+n})}$t.prototype.info=function(){};function Ys(t,n){if(!t.g)return n;if(!n)return null;try{const v=JSON.parse(n);if(v){for(t=0;t<v.length;t++)if(Array.isArray(v[t])){var r=v[t];if(!(r.length<2)){var h=r[1];if(Array.isArray(h)&&!(h.length<1)){var y=h[0];if(y!="noop"&&y!="stop"&&y!="close")for(let E=1;E<h.length;E++)h[E]=""}}}}return Le(v)}catch{return n}}var Be={NO_ERROR:0,TIMEOUT:8},Zs={},Bn;function Fe(){}S(Fe,Mn),Fe.prototype.g=function(){return new XMLHttpRequest},Bn=new Fe;function Ht(t){return encodeURIComponent(String(t))}function Qs(t){var n=1;t=t.split(":");const r=[];for(;n>0&&t.length;)r.push(t.shift()),n--;return t.length&&r.push(t.join(":")),r}function ct(t,n,r,h){this.j=t,this.i=n,this.l=r,this.S=h||1,this.V=new Vt(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Fn}function Fn(){this.i=null,this.g="",this.h=!1}var Un={},Ue={};function $e(t,n,r){t.M=1,t.A=ge(Q(n)),t.u=r,t.R=!0,$n(t,null)}function $n(t,n){t.F=Date.now(),pe(t),t.B=Q(t.A);var r=t.B,h=t.S;Array.isArray(h)||(h=[String(h)]),ei(r.i,"t",h),t.C=0,r=t.j.L,t.h=new Fn,t.g=vi(t.j,r?n:null,!t.u),t.P>0&&(t.O=new zs(T(t.Y,t,t.g),t.P)),n=t.V,r=t.g,h=t.ba;var y="readystatechange";Array.isArray(y)||(y&&(On[0]=y.toString()),y=On);for(let v=0;v<y.length;v++){const E=Cn(r,y[v],h||n.handleEvent,!1,n.h||n);if(!E)break;n.g[E.key]=E}n=t.J?Tn(t.J):{},t.u?(t.v||(t.v="POST"),n["Content-Type"]="application/x-www-form-urlencoded",t.g.ea(t.B,t.v,t.u,n)):(t.v="GET",t.g.ea(t.B,t.v,null,n)),Ft(),Xs(t.i,t.v,t.B,t.l,t.S,t.u)}ct.prototype.ba=function(t){t=t.target;const n=this.O;n&&ft(t)==3?n.j():this.Y(t)},ct.prototype.Y=function(t){try{if(t==this.g)t:{const b=ft(this.g),F=this.g.ya(),O=this.g.ca();if(!(b<3)&&(b!=3||this.g&&(this.h.h||this.g.la()||ai(this.g)))){this.K||b!=4||F==7||(F==8||O<=0?Ft(3):Ft(2)),He(this);var n=this.g.ca();this.X=n;var r=tr(this);if(this.o=n==200,Js(this.i,this.v,this.B,this.l,this.S,b,n),this.o){if(this.U&&!this.L){e:{if(this.g){var h,y=this.g;if((h=y.g?y.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!l(h)){var v=h;break e}}v=null}if(t=v)Nt(this.i,this.l,t,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,ze(this,t);else{this.o=!1,this.m=3,z(12),wt(this),zt(this);break t}}if(this.R){t=!0;let U;for(;!this.K&&this.C<r.length;)if(U=er(this,r),U==Ue){b==4&&(this.m=4,z(14),t=!1),Nt(this.i,this.l,null,"[Incomplete Response]");break}else if(U==Un){this.m=4,z(15),Nt(this.i,this.l,r,"[Invalid Chunk]"),t=!1;break}else Nt(this.i,this.l,U,null),ze(this,U);if(Hn(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),b!=4||r.length!=0||this.h.h||(this.m=1,z(16),t=!1),this.o=this.o&&t,!t)Nt(this.i,this.l,r,"[Invalid Chunked Response]"),wt(this),zt(this);else if(r.length>0&&!this.W){this.W=!0;var E=this.j;E.g==this&&E.aa&&!E.P&&(E.j.info("Great, no buffering proxy detected. Bytes received: "+r.length),Ze(E),E.P=!0,z(11))}}else Nt(this.i,this.l,r,null),ze(this,r);b==4&&wt(this),this.o&&!this.K&&(b==4?di(this.j,this):(this.o=!1,pe(this)))}else dr(this.g),n==400&&r.indexOf("Unknown SID")>0?(this.m=3,z(12)):(this.m=0,z(13)),wt(this),zt(this)}}}catch{}finally{}};function tr(t){if(!Hn(t))return t.g.la();const n=ai(t.g);if(n==="")return"";let r="";const h=n.length,y=ft(t.g)==4;if(!t.h.i){if(typeof TextDecoder>"u")return wt(t),zt(t),"";t.h.i=new m.TextDecoder}for(let v=0;v<h;v++)t.h.h=!0,r+=t.h.i.decode(n[v],{stream:!(y&&v==h-1)});return n.length=0,t.h.g+=r,t.C=0,t.h.g}function Hn(t){return t.g?t.v=="GET"&&t.M!=2&&t.j.Aa:!1}function er(t,n){var r=t.C,h=n.indexOf(`
`,r);return h==-1?Ue:(r=Number(n.substring(r,h)),isNaN(r)?Un:(h+=1,h+r>n.length?Ue:(n=n.slice(h,h+r),t.C=h+r,n)))}ct.prototype.cancel=function(){this.K=!0,wt(this)};function pe(t){t.T=Date.now()+t.H,zn(t,t.H)}function zn(t,n){if(t.D!=null)throw Error("WatchDog timer not null");t.D=Ut(T(t.aa,t),n)}function He(t){t.D&&(m.clearTimeout(t.D),t.D=null)}ct.prototype.aa=function(){this.D=null;const t=Date.now();t-this.T>=0?(Ks(this.i,this.B),this.M!=2&&(Ft(),z(17)),wt(this),this.m=2,zt(this)):zn(this,this.T-t)};function zt(t){t.j.I==0||t.K||di(t.j,t)}function wt(t){He(t);var n=t.O;n&&typeof n.dispose=="function"&&n.dispose(),t.O=null,kn(t.V),t.g&&(n=t.g,t.g=null,n.abort(),n.dispose())}function ze(t,n){try{var r=t.j;if(r.I!=0&&(r.g==t||Ge(r.h,t))){if(!t.L&&Ge(r.h,t)&&r.I==3){try{var h=r.Ba.g.parse(n)}catch{h=null}if(Array.isArray(h)&&h.length==3){var y=h;if(y[0]==0){t:if(!r.v){if(r.g)if(r.g.F+3e3<t.F)ve(r),ye(r);else break t;Ye(r),z(18)}}else r.xa=y[1],0<r.xa-r.K&&y[2]<37500&&r.F&&r.A==0&&!r.C&&(r.C=Ut(T(r.Va,r),6e3));qn(r.h)<=1&&r.ta&&(r.ta=void 0)}else At(r,11)}else if((t.L||r.g==t)&&ve(r),!l(n))for(y=r.Ba.g.parse(n),n=0;n<y.length;n++){let O=y[n];const U=O[0];if(!(U<=r.K))if(r.K=U,O=O[1],r.I==2)if(O[0]=="c"){r.M=O[1],r.ba=O[2];const tt=O[3];tt!=null&&(r.ka=tt,r.j.info("VER="+r.ka));const It=O[4];It!=null&&(r.za=It,r.j.info("SVER="+r.za));const pt=O[5];pt!=null&&typeof pt=="number"&&pt>0&&(h=1.5*pt,r.O=h,r.j.info("backChannelRequestTimeoutMs_="+h)),h=r;const gt=t.g;if(gt){const we=gt.g?gt.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(we){var v=h.h;v.g||we.indexOf("spdy")==-1&&we.indexOf("quic")==-1&&we.indexOf("h2")==-1||(v.j=v.l,v.g=new Set,v.h&&(We(v,v.h),v.h=null))}if(h.G){const Qe=gt.g?gt.g.getResponseHeader("X-HTTP-Session-Id"):null;Qe&&(h.wa=Qe,k(h.J,h.G,Qe))}}r.I=3,r.l&&r.l.ra(),r.aa&&(r.T=Date.now()-t.F,r.j.info("Handshake RTT: "+r.T+"ms")),h=r;var E=t;if(h.na=_i(h,h.L?h.ba:null,h.W),E.L){Xn(h.h,E);var b=E,F=h.O;F&&(b.H=F),b.D&&(He(b),pe(b)),h.g=E}else pi(h);r.i.length>0&&_e(r)}else O[0]!="stop"&&O[0]!="close"||At(r,7);else r.I==3&&(O[0]=="stop"||O[0]=="close"?O[0]=="stop"?At(r,7):Ke(r):O[0]!="noop"&&r.l&&r.l.qa(O),r.A=0)}}Ft(4)}catch{}}var nr=class{constructor(t,n){this.g=t,this.map=n}};function Gn(t){this.l=t||10,m.PerformanceNavigationTiming?(t=m.performance.getEntriesByType("navigation"),t=t.length>0&&(t[0].nextHopProtocol=="hq"||t[0].nextHopProtocol=="h2")):t=!!(m.chrome&&m.chrome.loadTimes&&m.chrome.loadTimes()&&m.chrome.loadTimes().wasFetchedViaSpdy),this.j=t?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Wn(t){return t.h?!0:t.g?t.g.size>=t.j:!1}function qn(t){return t.h?1:t.g?t.g.size:0}function Ge(t,n){return t.h?t.h==n:t.g?t.g.has(n):!1}function We(t,n){t.g?t.g.add(n):t.h=n}function Xn(t,n){t.h&&t.h==n?t.h=null:t.g&&t.g.has(n)&&t.g.delete(n)}Gn.prototype.cancel=function(){if(this.i=Jn(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const t of this.g.values())t.cancel();this.g.clear()}};function Jn(t){if(t.h!=null)return t.i.concat(t.h.G);if(t.g!=null&&t.g.size!==0){let n=t.i;for(const r of t.g.values())n=n.concat(r.G);return n}return x(t.i)}var Kn=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function ir(t,n){if(t){t=t.split("&");for(let r=0;r<t.length;r++){const h=t[r].indexOf("=");let y,v=null;h>=0?(y=t[r].substring(0,h),v=t[r].substring(h+1)):y=t[r],n(y,v?decodeURIComponent(v.replace(/\+/g," ")):"")}}}function lt(t){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let n;t instanceof lt?(this.l=t.l,Gt(this,t.j),this.o=t.o,this.g=t.g,Wt(this,t.u),this.h=t.h,qe(this,ni(t.i)),this.m=t.m):t&&(n=String(t).match(Kn))?(this.l=!1,Gt(this,n[1]||"",!0),this.o=qt(n[2]||""),this.g=qt(n[3]||"",!0),Wt(this,n[4]),this.h=qt(n[5]||"",!0),qe(this,n[6]||"",!0),this.m=qt(n[7]||"")):(this.l=!1,this.i=new Jt(null,this.l))}lt.prototype.toString=function(){const t=[];var n=this.j;n&&t.push(Xt(n,Yn,!0),":");var r=this.g;return(r||n=="file")&&(t.push("//"),(n=this.o)&&t.push(Xt(n,Yn,!0),"@"),t.push(Ht(r).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),r=this.u,r!=null&&t.push(":",String(r))),(r=this.h)&&(this.g&&r.charAt(0)!="/"&&t.push("/"),t.push(Xt(r,r.charAt(0)=="/"?or:rr,!0))),(r=this.i.toString())&&t.push("?",r),(r=this.m)&&t.push("#",Xt(r,ar)),t.join("")},lt.prototype.resolve=function(t){const n=Q(this);let r=!!t.j;r?Gt(n,t.j):r=!!t.o,r?n.o=t.o:r=!!t.g,r?n.g=t.g:r=t.u!=null;var h=t.h;if(r)Wt(n,t.u);else if(r=!!t.h){if(h.charAt(0)!="/")if(this.g&&!this.h)h="/"+h;else{var y=n.h.lastIndexOf("/");y!=-1&&(h=n.h.slice(0,y+1)+h)}if(y=h,y==".."||y==".")h="";else if(y.indexOf("./")!=-1||y.indexOf("/.")!=-1){h=y.lastIndexOf("/",0)==0,y=y.split("/");const v=[];for(let E=0;E<y.length;){const b=y[E++];b=="."?h&&E==y.length&&v.push(""):b==".."?((v.length>1||v.length==1&&v[0]!="")&&v.pop(),h&&E==y.length&&v.push("")):(v.push(b),h=!0)}h=v.join("/")}else h=y}return r?n.h=h:r=t.i.toString()!=="",r?qe(n,ni(t.i)):r=!!t.m,r&&(n.m=t.m),n};function Q(t){return new lt(t)}function Gt(t,n,r){t.j=r?qt(n,!0):n,t.j&&(t.j=t.j.replace(/:$/,""))}function Wt(t,n){if(n){if(n=Number(n),isNaN(n)||n<0)throw Error("Bad port number "+n);t.u=n}else t.u=null}function qe(t,n,r){n instanceof Jt?(t.i=n,cr(t.i,t.l)):(r||(n=Xt(n,hr)),t.i=new Jt(n,t.l))}function k(t,n,r){t.i.set(n,r)}function ge(t){return k(t,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),t}function qt(t,n){return t?n?decodeURI(t.replace(/%25/g,"%2525")):decodeURIComponent(t):""}function Xt(t,n,r){return typeof t=="string"?(t=encodeURI(t).replace(n,sr),r&&(t=t.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),t):null}function sr(t){return t=t.charCodeAt(0),"%"+(t>>4&15).toString(16)+(t&15).toString(16)}var Yn=/[#\/\?@]/g,rr=/[#\?:]/g,or=/[#\?]/g,hr=/[#\?@]/g,ar=/#/g;function Jt(t,n){this.h=this.g=null,this.i=t||null,this.j=!!n}function Et(t){t.g||(t.g=new Map,t.h=0,t.i&&ir(t.i,function(n,r){t.add(decodeURIComponent(n.replace(/\+/g," ")),r)}))}s=Jt.prototype,s.add=function(t,n){Et(this),this.i=null,t=Ot(this,t);let r=this.g.get(t);return r||this.g.set(t,r=[]),r.push(n),this.h+=1,this};function Zn(t,n){Et(t),n=Ot(t,n),t.g.has(n)&&(t.i=null,t.h-=t.g.get(n).length,t.g.delete(n))}function Qn(t,n){return Et(t),n=Ot(t,n),t.g.has(n)}s.forEach=function(t,n){Et(this),this.g.forEach(function(r,h){r.forEach(function(y){t.call(n,y,h,this)},this)},this)};function ti(t,n){Et(t);let r=[];if(typeof n=="string")Qn(t,n)&&(r=r.concat(t.g.get(Ot(t,n))));else for(t=Array.from(t.g.values()),n=0;n<t.length;n++)r=r.concat(t[n]);return r}s.set=function(t,n){return Et(this),this.i=null,t=Ot(this,t),Qn(this,t)&&(this.h-=this.g.get(t).length),this.g.set(t,[n]),this.h+=1,this},s.get=function(t,n){return t?(t=ti(this,t),t.length>0?String(t[0]):n):n};function ei(t,n,r){Zn(t,n),r.length>0&&(t.i=null,t.g.set(Ot(t,n),x(r)),t.h+=r.length)}s.toString=function(){if(this.i)return this.i;if(!this.g)return"";const t=[],n=Array.from(this.g.keys());for(let h=0;h<n.length;h++){var r=n[h];const y=Ht(r);r=ti(this,r);for(let v=0;v<r.length;v++){let E=y;r[v]!==""&&(E+="="+Ht(r[v])),t.push(E)}}return this.i=t.join("&")};function ni(t){const n=new Jt;return n.i=t.i,t.g&&(n.g=new Map(t.g),n.h=t.h),n}function Ot(t,n){return n=String(n),t.j&&(n=n.toLowerCase()),n}function cr(t,n){n&&!t.j&&(Et(t),t.i=null,t.g.forEach(function(r,h){const y=h.toLowerCase();h!=y&&(Zn(this,h),ei(this,y,r))},t)),t.j=n}function lr(t,n){const r=new $t;if(m.Image){const h=new Image;h.onload=N(ut,r,"TestLoadImage: loaded",!0,n,h),h.onerror=N(ut,r,"TestLoadImage: error",!1,n,h),h.onabort=N(ut,r,"TestLoadImage: abort",!1,n,h),h.ontimeout=N(ut,r,"TestLoadImage: timeout",!1,n,h),m.setTimeout(function(){h.ontimeout&&h.ontimeout()},1e4),h.src=t}else n(!1)}function ur(t,n){const r=new $t,h=new AbortController,y=setTimeout(()=>{h.abort(),ut(r,"TestPingServer: timeout",!1,n)},1e4);fetch(t,{signal:h.signal}).then(v=>{clearTimeout(y),v.ok?ut(r,"TestPingServer: ok",!0,n):ut(r,"TestPingServer: server error",!1,n)}).catch(()=>{clearTimeout(y),ut(r,"TestPingServer: error",!1,n)})}function ut(t,n,r,h,y){try{y&&(y.onload=null,y.onerror=null,y.onabort=null,y.ontimeout=null),h(r)}catch{}}function fr(){this.g=new Ws}function Xe(t){this.i=t.Sb||null,this.h=t.ab||!1}S(Xe,Mn),Xe.prototype.g=function(){return new de(this.i,this.h)};function de(t,n){$.call(this),this.H=t,this.o=n,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}S(de,$),s=de.prototype,s.open=function(t,n){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=t,this.D=n,this.readyState=1,Yt(this)},s.send=function(t){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const n={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};t&&(n.body=t),(this.H||m).fetch(new Request(this.D,n)).then(this.Pa.bind(this),this.ga.bind(this))},s.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,Kt(this)),this.readyState=0},s.Pa=function(t){if(this.g&&(this.l=t,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=t.headers,this.readyState=2,Yt(this)),this.g&&(this.readyState=3,Yt(this),this.g)))if(this.responseType==="arraybuffer")t.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof m.ReadableStream<"u"&&"body"in t){if(this.j=t.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;ii(this)}else t.text().then(this.Oa.bind(this),this.ga.bind(this))};function ii(t){t.j.read().then(t.Ma.bind(t)).catch(t.ga.bind(t))}s.Ma=function(t){if(this.g){if(this.o&&t.value)this.response.push(t.value);else if(!this.o){var n=t.value?t.value:new Uint8Array(0);(n=this.B.decode(n,{stream:!t.done}))&&(this.response=this.responseText+=n)}t.done?Kt(this):Yt(this),this.readyState==3&&ii(this)}},s.Oa=function(t){this.g&&(this.response=this.responseText=t,Kt(this))},s.Na=function(t){this.g&&(this.response=t,Kt(this))},s.ga=function(){this.g&&Kt(this)};function Kt(t){t.readyState=4,t.l=null,t.j=null,t.B=null,Yt(t)}s.setRequestHeader=function(t,n){this.A.append(t,n)},s.getResponseHeader=function(t){return this.h&&this.h.get(t.toLowerCase())||""},s.getAllResponseHeaders=function(){if(!this.h)return"";const t=[],n=this.h.entries();for(var r=n.next();!r.done;)r=r.value,t.push(r[0]+": "+r[1]),r=n.next();return t.join(`\r
`)};function Yt(t){t.onreadystatechange&&t.onreadystatechange.call(t)}Object.defineProperty(de.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(t){this.m=t?"include":"same-origin"}});function si(t){let n="";return le(t,function(r,h){n+=h,n+=":",n+=r,n+=`\r
`}),n}function Je(t,n,r){t:{for(h in r){var h=!1;break t}h=!0}h||(r=si(r),typeof t=="string"?r!=null&&Ht(r):k(t,n,r))}function j(t){$.call(this),this.headers=new Map,this.L=t||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}S(j,$);var pr=/^https?$/i,gr=["POST","PUT"];s=j.prototype,s.Fa=function(t){this.H=t},s.ea=function(t,n,r,h){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+t);n=n?n.toUpperCase():"GET",this.D=t,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():Bn.g(),this.g.onreadystatechange=I(T(this.Ca,this));try{this.B=!0,this.g.open(n,String(t),!0),this.B=!1}catch(v){ri(this,v);return}if(t=r||"",r=new Map(this.headers),h)if(Object.getPrototypeOf(h)===Object.prototype)for(var y in h)r.set(y,h[y]);else if(typeof h.keys=="function"&&typeof h.get=="function")for(const v of h.keys())r.set(v,h.get(v));else throw Error("Unknown input type for opt_headers: "+String(h));h=Array.from(r.keys()).find(v=>v.toLowerCase()=="content-type"),y=m.FormData&&t instanceof m.FormData,!(Array.prototype.indexOf.call(gr,n,void 0)>=0)||h||y||r.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[v,E]of r)this.g.setRequestHeader(v,E);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(t),this.v=!1}catch(v){ri(this,v)}};function ri(t,n){t.h=!1,t.g&&(t.j=!0,t.g.abort(),t.j=!1),t.l=n,t.o=5,oi(t),me(t)}function oi(t){t.A||(t.A=!0,H(t,"complete"),H(t,"error"))}s.abort=function(t){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=t||7,H(this,"complete"),H(this,"abort"),me(this))},s.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),me(this,!0)),j.Z.N.call(this)},s.Ca=function(){this.u||(this.B||this.v||this.j?hi(this):this.Xa())},s.Xa=function(){hi(this)};function hi(t){if(t.h&&typeof p<"u"){if(t.v&&ft(t)==4)setTimeout(t.Ca.bind(t),0);else if(H(t,"readystatechange"),ft(t)==4){t.h=!1;try{const v=t.ca();t:switch(v){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var n=!0;break t;default:n=!1}var r;if(!(r=n)){var h;if(h=v===0){let E=String(t.D).match(Kn)[1]||null;!E&&m.self&&m.self.location&&(E=m.self.location.protocol.slice(0,-1)),h=!pr.test(E?E.toLowerCase():"")}r=h}if(r)H(t,"complete"),H(t,"success");else{t.o=6;try{var y=ft(t)>2?t.g.statusText:""}catch{y=""}t.l=y+" ["+t.ca()+"]",oi(t)}}finally{me(t)}}}}function me(t,n){if(t.g){t.m&&(clearTimeout(t.m),t.m=null);const r=t.g;t.g=null,n||H(t,"ready");try{r.onreadystatechange=null}catch{}}}s.isActive=function(){return!!this.g};function ft(t){return t.g?t.g.readyState:0}s.ca=function(){try{return ft(this)>2?this.g.status:-1}catch{return-1}},s.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},s.La=function(t){if(this.g){var n=this.g.responseText;return t&&n.indexOf(t)==0&&(n=n.substring(t.length)),Gs(n)}};function ai(t){try{if(!t.g)return null;if("response"in t.g)return t.g.response;switch(t.F){case"":case"text":return t.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in t.g)return t.g.mozResponseArrayBuffer}return null}catch{return null}}function dr(t){const n={};t=(t.g&&ft(t)>=2&&t.g.getAllResponseHeaders()||"").split(`\r
`);for(let h=0;h<t.length;h++){if(l(t[h]))continue;var r=Qs(t[h]);const y=r[0];if(r=r[1],typeof r!="string")continue;r=r.trim();const v=n[y]||[];n[y]=v,v.push(r)}Bs(n,function(h){return h.join(", ")})}s.ya=function(){return this.o},s.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function Zt(t,n,r){return r&&r.internalChannelParams&&r.internalChannelParams[t]||n}function ci(t){this.za=0,this.i=[],this.j=new $t,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Zt("failFast",!1,t),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Zt("baseRetryDelayMs",5e3,t),this.Za=Zt("retryDelaySeedMs",1e4,t),this.Ta=Zt("forwardChannelMaxRetries",2,t),this.va=Zt("forwardChannelRequestTimeoutMs",2e4,t),this.ma=t&&t.xmlHttpFactory||void 0,this.Ua=t&&t.Rb||void 0,this.Aa=t&&t.useFetchStreams||!1,this.O=void 0,this.L=t&&t.supportsCrossDomainXhr||!1,this.M="",this.h=new Gn(t&&t.concurrentRequestLimit),this.Ba=new fr,this.S=t&&t.fastHandshake||!1,this.R=t&&t.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=t&&t.Pb||!1,t&&t.ua&&this.j.ua(),t&&t.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&t&&t.detectBufferingProxy||!1,this.ia=void 0,t&&t.longPollingTimeout&&t.longPollingTimeout>0&&(this.ia=t.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}s=ci.prototype,s.ka=8,s.I=1,s.connect=function(t,n,r,h){z(0),this.W=t,this.H=n||{},r&&h!==void 0&&(this.H.OSID=r,this.H.OAID=h),this.F=this.X,this.J=_i(this,null,this.W),_e(this)};function Ke(t){if(li(t),t.I==3){var n=t.V++,r=Q(t.J);if(k(r,"SID",t.M),k(r,"RID",n),k(r,"TYPE","terminate"),Qt(t,r),n=new ct(t,t.j,n),n.M=2,n.A=ge(Q(r)),r=!1,m.navigator&&m.navigator.sendBeacon)try{r=m.navigator.sendBeacon(n.A.toString(),"")}catch{}!r&&m.Image&&(new Image().src=n.A,r=!0),r||(n.g=vi(n.j,null),n.g.ea(n.A)),n.F=Date.now(),pe(n)}yi(t)}function ye(t){t.g&&(Ze(t),t.g.cancel(),t.g=null)}function li(t){ye(t),t.v&&(m.clearTimeout(t.v),t.v=null),ve(t),t.h.cancel(),t.m&&(typeof t.m=="number"&&m.clearTimeout(t.m),t.m=null)}function _e(t){if(!Wn(t.h)&&!t.m){t.m=!0;var n=t.Ea;at||c(),X||(at(),X=!0),g.add(n,t),t.D=0}}function mr(t,n){return qn(t.h)>=t.h.j-(t.m?1:0)?!1:t.m?(t.i=n.G.concat(t.i),!0):t.I==1||t.I==2||t.D>=(t.Sa?0:t.Ta)?!1:(t.m=Ut(T(t.Ea,t,n),mi(t,t.D)),t.D++,!0)}s.Ea=function(t){if(this.m)if(this.m=null,this.I==1){if(!t){this.V=Math.floor(Math.random()*1e5),t=this.V++;const y=new ct(this,this.j,t);let v=this.o;if(this.U&&(v?(v=Tn(v),bn(v,this.U)):v=this.U),this.u!==null||this.R||(y.J=v,v=null),this.S)t:{for(var n=0,r=0;r<this.i.length;r++){e:{var h=this.i[r];if("__data__"in h.map&&(h=h.map.__data__,typeof h=="string")){h=h.length;break e}h=void 0}if(h===void 0)break;if(n+=h,n>4096){n=r;break t}if(n===4096||r===this.i.length-1){n=r+1;break t}}n=1e3}else n=1e3;n=fi(this,y,n),r=Q(this.J),k(r,"RID",t),k(r,"CVER",22),this.G&&k(r,"X-HTTP-Session-Id",this.G),Qt(this,r),v&&(this.R?n="headers="+Ht(si(v))+"&"+n:this.u&&Je(r,this.u,v)),We(this.h,y),this.Ra&&k(r,"TYPE","init"),this.S?(k(r,"$req",n),k(r,"SID","null"),y.U=!0,$e(y,r,null)):$e(y,r,n),this.I=2}}else this.I==3&&(t?ui(this,t):this.i.length==0||Wn(this.h)||ui(this))};function ui(t,n){var r;n?r=n.l:r=t.V++;const h=Q(t.J);k(h,"SID",t.M),k(h,"RID",r),k(h,"AID",t.K),Qt(t,h),t.u&&t.o&&Je(h,t.u,t.o),r=new ct(t,t.j,r,t.D+1),t.u===null&&(r.J=t.o),n&&(t.i=n.G.concat(t.i)),n=fi(t,r,1e3),r.H=Math.round(t.va*.5)+Math.round(t.va*.5*Math.random()),We(t.h,r),$e(r,h,n)}function Qt(t,n){t.H&&le(t.H,function(r,h){k(n,h,r)}),t.l&&le({},function(r,h){k(n,h,r)})}function fi(t,n,r){r=Math.min(t.i.length,r);const h=t.l?T(t.l.Ka,t.l,t):null;t:{var y=t.i;let b=-1;for(;;){const F=["count="+r];b==-1?r>0?(b=y[0].g,F.push("ofs="+b)):b=0:F.push("ofs="+b);let O=!0;for(let U=0;U<r;U++){var v=y[U].g;const tt=y[U].map;if(v-=b,v<0)b=Math.max(0,y[U].g-100),O=!1;else try{v="req"+v+"_"||"";try{var E=tt instanceof Map?tt:Object.entries(tt);for(const[It,pt]of E){let gt=pt;w(pt)&&(gt=Le(pt)),F.push(v+It+"="+encodeURIComponent(gt))}}catch(It){throw F.push(v+"type="+encodeURIComponent("_badmap")),It}}catch{h&&h(tt)}}if(O){E=F.join("&");break t}}E=void 0}return t=t.i.splice(0,r),n.G=t,E}function pi(t){if(!t.g&&!t.v){t.Y=1;var n=t.Da;at||c(),X||(at(),X=!0),g.add(n,t),t.A=0}}function Ye(t){return t.g||t.v||t.A>=3?!1:(t.Y++,t.v=Ut(T(t.Da,t),mi(t,t.A)),t.A++,!0)}s.Da=function(){if(this.v=null,gi(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var t=4*this.T;this.j.info("BP detection timer enabled: "+t),this.B=Ut(T(this.Wa,this),t)}},s.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,z(10),ye(this),gi(this))};function Ze(t){t.B!=null&&(m.clearTimeout(t.B),t.B=null)}function gi(t){t.g=new ct(t,t.j,"rpc",t.Y),t.u===null&&(t.g.J=t.o),t.g.P=0;var n=Q(t.na);k(n,"RID","rpc"),k(n,"SID",t.M),k(n,"AID",t.K),k(n,"CI",t.F?"0":"1"),!t.F&&t.ia&&k(n,"TO",t.ia),k(n,"TYPE","xmlhttp"),Qt(t,n),t.u&&t.o&&Je(n,t.u,t.o),t.O&&(t.g.H=t.O);var r=t.g;t=t.ba,r.M=1,r.A=ge(Q(n)),r.u=null,r.R=!0,$n(r,t)}s.Va=function(){this.C!=null&&(this.C=null,ye(this),Ye(this),z(19))};function ve(t){t.C!=null&&(m.clearTimeout(t.C),t.C=null)}function di(t,n){var r=null;if(t.g==n){ve(t),Ze(t),t.g=null;var h=2}else if(Ge(t.h,n))r=n.G,Xn(t.h,n),h=1;else return;if(t.I!=0){if(n.o)if(h==1){r=n.u?n.u.length:0,n=Date.now()-n.F;var y=t.D;h=Ve(),H(h,new Vn(h,r)),_e(t)}else pi(t);else if(y=n.m,y==3||y==0&&n.X>0||!(h==1&&mr(t,n)||h==2&&Ye(t)))switch(r&&r.length>0&&(n=t.h,n.i=n.i.concat(r)),y){case 1:At(t,5);break;case 4:At(t,10);break;case 3:At(t,6);break;default:At(t,2)}}}function mi(t,n){let r=t.Qa+Math.floor(Math.random()*t.Za);return t.isActive()||(r*=2),r*n}function At(t,n){if(t.j.info("Error code "+n),n==2){var r=T(t.bb,t),h=t.Ua;const y=!h;h=new lt(h||"//www.google.com/images/cleardot.gif"),m.location&&m.location.protocol=="http"||Gt(h,"https"),ge(h),y?lr(h.toString(),r):ur(h.toString(),r)}else z(2);t.I=0,t.l&&t.l.pa(n),yi(t),li(t)}s.bb=function(t){t?(this.j.info("Successfully pinged google.com"),z(2)):(this.j.info("Failed to ping google.com"),z(1))};function yi(t){if(t.I=0,t.ja=[],t.l){const n=Jn(t.h);(n.length!=0||t.i.length!=0)&&(L(t.ja,n),L(t.ja,t.i),t.h.i.length=0,x(t.i),t.i.length=0),t.l.oa()}}function _i(t,n,r){var h=r instanceof lt?Q(r):new lt(r);if(h.g!="")n&&(h.g=n+"."+h.g),Wt(h,h.u);else{var y=m.location;h=y.protocol,n=n?n+"."+y.hostname:y.hostname,y=+y.port;const v=new lt(null);h&&Gt(v,h),n&&(v.g=n),y&&Wt(v,y),r&&(v.h=r),h=v}return r=t.G,n=t.wa,r&&n&&k(h,r,n),k(h,"VER",t.ka),Qt(t,h),h}function vi(t,n,r){if(n&&!t.L)throw Error("Can't create secondary domain capable XhrIo object.");return n=t.Aa&&!t.ma?new j(new Xe({ab:r})):new j(t.ma),n.Fa(t.L),n}s.isActive=function(){return!!this.l&&this.l.isActive(this)};function wi(){}s=wi.prototype,s.ra=function(){},s.qa=function(){},s.pa=function(){},s.oa=function(){},s.isActive=function(){return!0},s.Ka=function(){};function J(t,n){$.call(this),this.g=new ci(n),this.l=t,this.h=n&&n.messageUrlParams||null,t=n&&n.messageHeaders||null,n&&n.clientProtocolHeaderRequired&&(t?t["X-Client-Protocol"]="webchannel":t={"X-Client-Protocol":"webchannel"}),this.g.o=t,t=n&&n.initMessageHeaders||null,n&&n.messageContentType&&(t?t["X-WebChannel-Content-Type"]=n.messageContentType:t={"X-WebChannel-Content-Type":n.messageContentType}),n&&n.sa&&(t?t["X-WebChannel-Client-Profile"]=n.sa:t={"X-WebChannel-Client-Profile":n.sa}),this.g.U=t,(t=n&&n.Qb)&&!l(t)&&(this.g.u=t),this.A=n&&n.supportsCrossDomainXhr||!1,this.v=n&&n.sendRawJson||!1,(n=n&&n.httpSessionIdParam)&&!l(n)&&(this.g.G=n,t=this.h,t!==null&&n in t&&(t=this.h,n in t&&delete t[n])),this.j=new kt(this)}S(J,$),J.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},J.prototype.close=function(){Ke(this.g)},J.prototype.o=function(t){var n=this.g;if(typeof t=="string"){var r={};r.__data__=t,t=r}else this.v&&(r={},r.__data__=Le(t),t=r);n.i.push(new nr(n.Ya++,t)),n.I==3&&_e(n)},J.prototype.N=function(){this.g.l=null,delete this.j,Ke(this.g),delete this.g,J.Z.N.call(this)};function Ei(t){je.call(this),t.__headers__&&(this.headers=t.__headers__,this.statusCode=t.__status__,delete t.__headers__,delete t.__status__);var n=t.__sm__;if(n){t:{for(const r in n){t=r;break t}t=void 0}(this.i=t)&&(t=this.i,n=n!==null&&t in n?n[t]:void 0),this.data=n}else this.data=t}S(Ei,je);function Ai(){xe.call(this),this.status=1}S(Ai,xe);function kt(t){this.g=t}S(kt,wi),kt.prototype.ra=function(){H(this.g,"a")},kt.prototype.qa=function(t){H(this.g,new Ei(t))},kt.prototype.pa=function(t){H(this.g,new Ai)},kt.prototype.oa=function(){H(this.g,"b")},J.prototype.send=J.prototype.o,J.prototype.open=J.prototype.m,J.prototype.close=J.prototype.close,Be.NO_ERROR=0,Be.TIMEOUT=8,Be.HTTP_ERROR=6,Zs.COMPLETE="complete",qs.EventType=Bt,Bt.OPEN="a",Bt.CLOSE="b",Bt.ERROR="c",Bt.MESSAGE="d",$.prototype.listen=$.prototype.J,j.prototype.listenOnce=j.prototype.K,j.prototype.getLastError=j.prototype.Ha,j.prototype.getLastErrorCode=j.prototype.ya,j.prototype.getStatus=j.prototype.ca,j.prototype.getResponseJson=j.prototype.La,j.prototype.getResponseText=j.prototype.la,j.prototype.send=j.prototype.ea,j.prototype.setWithCredentials=j.prototype.Fa}).apply(typeof Ee<"u"?Ee:typeof self<"u"?self:typeof window<"u"?window:{});const Fi="@firebase/firestore",Ui="4.9.2";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class G{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}G.UNAUTHENTICATED=new G(null),G.GOOGLE_CREDENTIALS=new G("google-credentials-uid"),G.FIRST_PARTY=new G("first-party-uid"),G.MOCK_USER=new G("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let he="12.3.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jt=new ms("@firebase/firestore");function Z(s,...e){if(jt.logLevel<=R.DEBUG){const i=e.map(wn);jt.debug(`Firestore (${he}): ${s}`,...i)}}function Cs(s,...e){if(jt.logLevel<=R.ERROR){const i=e.map(wn);jt.error(`Firestore (${he}): ${s}`,...i)}}function mh(s,...e){if(jt.logLevel<=R.WARN){const i=e.map(wn);jt.warn(`Firestore (${he}): ${s}`,...i)}}function wn(s){if(typeof s=="string")return s;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return(function(i){return JSON.stringify(i)})(s)}catch{return s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oe(s,e,i){let o="Unexpected state";typeof e=="string"?o=e:i=e,Ds(s,o,i)}function Ds(s,e,i){let o=`FIRESTORE (${he}) INTERNAL ASSERTION FAILED: ${e} (ID: ${s.toString(16)})`;if(i!==void 0)try{o+=" CONTEXT: "+JSON.stringify(i)}catch{o+=" CONTEXT: "+i}throw Cs(o),new Error(o)}function ee(s,e,i,o){let a="Unexpected state";typeof i=="string"?a=i:o=i,s||Ds(e,a,o)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const D={CANCELLED:"cancelled",INVALID_ARGUMENT:"invalid-argument",FAILED_PRECONDITION:"failed-precondition"};class P extends xt{constructor(e,i){super(e,i),this.code=e,this.message=i,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ne{constructor(){this.promise=new Promise(((e,i)=>{this.resolve=e,this.reject=i}))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ps{constructor(e,i){this.user=i,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class yh{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,i){e.enqueueRetryable((()=>i(G.UNAUTHENTICATED)))}shutdown(){}}class _h{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,i){this.changeListener=i,e.enqueueRetryable((()=>i(this.token.user)))}shutdown(){this.changeListener=null}}class vh{constructor(e){this.t=e,this.currentUser=G.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,i){ee(this.o===void 0,42304);let o=this.i;const a=A=>this.i!==o?(o=this.i,i(A)):Promise.resolve();let p=new ne;this.o=()=>{this.i++,this.currentUser=this.u(),p.resolve(),p=new ne,e.enqueueRetryable((()=>a(this.currentUser)))};const m=()=>{const A=p;e.enqueueRetryable((async()=>{await A.promise,await a(this.currentUser)}))},w=A=>{Z("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=A,this.o&&(this.auth.addAuthTokenListener(this.o),m())};this.t.onInit((A=>w(A))),setTimeout((()=>{if(!this.auth){const A=this.t.getImmediate({optional:!0});A?w(A):(Z("FirebaseAuthCredentialsProvider","Auth not yet detected"),p.resolve(),p=new ne)}}),0),m()}getToken(){const e=this.i,i=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(i).then((o=>this.i!==e?(Z("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):o?(ee(typeof o.accessToken=="string",31837,{l:o}),new Ps(o.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return ee(e===null||typeof e=="string",2055,{h:e}),new G(e)}}class wh{constructor(e,i,o){this.P=e,this.T=i,this.I=o,this.type="FirstParty",this.user=G.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class Eh{constructor(e,i,o){this.P=e,this.T=i,this.I=o}getToken(){return Promise.resolve(new wh(this.P,this.T,this.I))}start(e,i){e.enqueueRetryable((()=>i(G.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class $i{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Ah{constructor(e,i){this.V=i,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,ws(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,i){ee(this.o===void 0,3512);const o=p=>{p.error!=null&&Z("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${p.error.message}`);const m=p.token!==this.m;return this.m=p.token,Z("FirebaseAppCheckTokenProvider",`Received ${m?"new":"existing"} token.`),m?i(p.token):Promise.resolve()};this.o=p=>{e.enqueueRetryable((()=>o(p)))};const a=p=>{Z("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=p,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit((p=>a(p))),setTimeout((()=>{if(!this.appCheck){const p=this.V.getImmediate({optional:!0});p?a(p):Z("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.p)return Promise.resolve(new $i(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((i=>i?(ee(typeof i.token=="string",44558,{tokenResult:i}),this.m=i.token,new $i(i.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ih(s){const e=typeof self<"u"&&(self.crypto||self.msCrypto),i=new Uint8Array(s);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(i);else for(let o=0;o<s;o++)i[o]=Math.floor(256*Math.random());return i}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Th{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",i=62*Math.floor(4.129032258064516);let o="";for(;o.length<20;){const a=Ih(40);for(let p=0;p<a.length;++p)o.length<20&&a[p]<i&&(o+=e.charAt(a[p]%62))}return o}}function _t(s,e){return s<e?-1:s>e?1:0}function Sh(s,e){const i=Math.min(s.length,e.length);for(let o=0;o<i;o++){const a=s.charAt(o),p=e.charAt(o);if(a!==p)return hn(a)===hn(p)?_t(a,p):hn(a)?1:-1}return _t(s.length,e.length)}const bh=55296,Ch=57343;function hn(s){const e=s.charCodeAt(0);return e>=bh&&e<=Ch}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hi="__name__";class et{constructor(e,i,o){i===void 0?i=0:i>e.length&&oe(637,{offset:i,range:e.length}),o===void 0?o=e.length-i:o>e.length-i&&oe(1746,{length:o,range:e.length-i}),this.segments=e,this.offset=i,this.len=o}get length(){return this.len}isEqual(e){return et.comparator(this,e)===0}child(e){const i=this.segments.slice(this.offset,this.limit());return e instanceof et?e.forEach((o=>{i.push(o)})):i.push(e),this.construct(i)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let i=0;i<this.length;i++)if(this.get(i)!==e.get(i))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let i=0;i<this.length;i++)if(this.get(i)!==e.get(i))return!1;return!0}forEach(e){for(let i=this.offset,o=this.limit();i<o;i++)e(this.segments[i])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,i){const o=Math.min(e.length,i.length);for(let a=0;a<o;a++){const p=et.compareSegments(e.get(a),i.get(a));if(p!==0)return p}return _t(e.length,i.length)}static compareSegments(e,i){const o=et.isNumericId(e),a=et.isNumericId(i);return o&&!a?-1:!o&&a?1:o&&a?et.extractNumericId(e).compare(et.extractNumericId(i)):Sh(e,i)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return vn.fromString(e.substring(4,e.length-2))}}class Y extends et{construct(e,i,o){return new Y(e,i,o)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const i=[];for(const o of e){if(o.indexOf("//")>=0)throw new P(D.INVALID_ARGUMENT,`Invalid segment (${o}). Paths must not contain // in them.`);i.push(...o.split("/").filter((a=>a.length>0)))}return new Y(i)}static emptyPath(){return new Y([])}}const Dh=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class St extends et{construct(e,i,o){return new St(e,i,o)}static isValidIdentifier(e){return Dh.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),St.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Hi}static keyField(){return new St([Hi])}static fromServerFormat(e){const i=[];let o="",a=0;const p=()=>{if(o.length===0)throw new P(D.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);i.push(o),o=""};let m=!1;for(;a<e.length;){const w=e[a];if(w==="\\"){if(a+1===e.length)throw new P(D.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const A=e[a+1];if(A!=="\\"&&A!=="."&&A!=="`")throw new P(D.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);o+=A,a+=2}else w==="`"?(m=!m,a++):w!=="."||m?(o+=w,a++):(p(),a++)}if(p(),m)throw new P(D.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new St(i)}static emptyPath(){return new St([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bt{constructor(e){this.path=e}static fromPath(e){return new bt(Y.fromString(e))}static fromName(e){return new bt(Y.fromString(e).popFirst(5))}static empty(){return new bt(Y.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&Y.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,i){return Y.comparator(e.path,i.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new bt(new Y(e.slice()))}}function Ph(s,e,i,o){if(e===!0&&o===!0)throw new P(D.INVALID_ARGUMENT,`${s} and ${i} cannot be used together.`)}function Rh(s){return typeof s=="object"&&s!==null&&(Object.getPrototypeOf(s)===Object.prototype||Object.getPrototypeOf(s)===null)}function Nh(s){if(s===void 0)return"undefined";if(s===null)return"null";if(typeof s=="string")return s.length>20&&(s=`${s.substring(0,20)}...`),JSON.stringify(s);if(typeof s=="number"||typeof s=="boolean")return""+s;if(typeof s=="object"){if(s instanceof Array)return"an array";{const e=(function(o){return o.constructor?o.constructor.name:null})(s);return e?`a custom ${e} object`:"an object"}}return typeof s=="function"?"a function":oe(12329,{type:typeof s})}function Oh(s,e){if("_delegate"in s&&(s=s._delegate),!(s instanceof e)){if(e.name===s.constructor.name)throw new P(D.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const i=Nh(s);throw new P(D.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${i}`)}}return s}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function B(s,e){const i={typeString:s};return e&&(i.value=e),i}function ae(s,e){if(!Rh(s))throw new P(D.INVALID_ARGUMENT,"JSON must be an object");let i;for(const o in e)if(e[o]){const a=e[o].typeString,p="value"in e[o]?{value:e[o].value}:void 0;if(!(o in s)){i=`JSON missing required field: '${o}'`;break}const m=s[o];if(a&&typeof m!==a){i=`JSON field '${o}' must be a ${a}.`;break}if(p!==void 0&&m!==p.value){i=`Expected '${o}' field to equal '${p.value}'`;break}}if(i)throw new P(D.INVALID_ARGUMENT,i);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zi=-62135596800,Gi=1e6;class nt{static now(){return nt.fromMillis(Date.now())}static fromDate(e){return nt.fromMillis(e.getTime())}static fromMillis(e){const i=Math.floor(e/1e3),o=Math.floor((e-1e3*i)*Gi);return new nt(i,o)}constructor(e,i){if(this.seconds=e,this.nanoseconds=i,i<0)throw new P(D.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+i);if(i>=1e9)throw new P(D.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+i);if(e<zi)throw new P(D.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new P(D.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Gi}_compareTo(e){return this.seconds===e.seconds?_t(this.nanoseconds,e.nanoseconds):_t(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:nt._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(ae(e,nt._jsonSchema))return new nt(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-zi;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}nt._jsonSchemaVersion="firestore/timestamp/1.0",nt._jsonSchema={type:B("string",nt._jsonSchemaVersion),seconds:B("number"),nanoseconds:B("number")};function kh(s){return s.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mh extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pt{constructor(e){this.binaryString=e}static fromBase64String(e){const i=(function(a){try{return atob(a)}catch(p){throw typeof DOMException<"u"&&p instanceof DOMException?new Mh("Invalid base64 string: "+p):p}})(e);return new Pt(i)}static fromUint8Array(e){const i=(function(a){let p="";for(let m=0;m<a.length;++m)p+=String.fromCharCode(a[m]);return p})(e);return new Pt(i)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(i){return btoa(i)})(this.binaryString)}toUint8Array(){return(function(i){const o=new Uint8Array(i.length);for(let a=0;a<i.length;a++)o[a]=i.charCodeAt(a);return o})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return _t(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Pt.EMPTY_BYTE_STRING=new Pt("");const mn="(default)";class Ce{constructor(e,i){this.projectId=e,this.database=i||mn}static empty(){return new Ce("","")}get isDefaultDatabase(){return this.database===mn}isEqual(e){return e instanceof Ce&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lh{constructor(e,i=null,o=[],a=[],p=null,m="F",w=null,A=null){this.path=e,this.collectionGroup=i,this.explicitOrderBy=o,this.filters=a,this.limit=p,this.limitType=m,this.startAt=w,this.endAt=A,this.Ie=null,this.Ee=null,this.de=null,this.startAt,this.endAt}}function jh(s){return new Lh(s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Wi,C;(C=Wi||(Wi={}))[C.OK=0]="OK",C[C.CANCELLED=1]="CANCELLED",C[C.UNKNOWN=2]="UNKNOWN",C[C.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",C[C.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",C[C.NOT_FOUND=5]="NOT_FOUND",C[C.ALREADY_EXISTS=6]="ALREADY_EXISTS",C[C.PERMISSION_DENIED=7]="PERMISSION_DENIED",C[C.UNAUTHENTICATED=16]="UNAUTHENTICATED",C[C.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",C[C.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",C[C.ABORTED=10]="ABORTED",C[C.OUT_OF_RANGE=11]="OUT_OF_RANGE",C[C.UNIMPLEMENTED=12]="UNIMPLEMENTED",C[C.INTERNAL=13]="INTERNAL",C[C.UNAVAILABLE=14]="UNAVAILABLE",C[C.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new vn([4294967295,4294967295],0);/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xh=41943040;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vh=1048576;function an(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bh{constructor(e,i,o=1e3,a=1.5,p=6e4){this.Mi=e,this.timerId=i,this.d_=o,this.A_=a,this.R_=p,this.V_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.V_=0}g_(){this.V_=this.R_}p_(e){this.cancel();const i=Math.floor(this.V_+this.y_()),o=Math.max(0,Date.now()-this.f_),a=Math.max(0,i-o);a>0&&Z("ExponentialBackoff",`Backing off for ${a} ms (base delay: ${this.V_} ms, delay with jitter: ${i} ms, last attempt: ${o} ms ago)`),this.m_=this.Mi.enqueueAfterDelay(this.timerId,a,(()=>(this.f_=Date.now(),e()))),this.V_*=this.A_,this.V_<this.d_&&(this.V_=this.d_),this.V_>this.R_&&(this.V_=this.R_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.V_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class En{constructor(e,i,o,a,p){this.asyncQueue=e,this.timerId=i,this.targetTimeMs=o,this.op=a,this.removalCallback=p,this.deferred=new ne,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((m=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,i,o,a,p){const m=Date.now()+o,w=new En(e,i,m,a,p);return w.start(o),w}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new P(D.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}var qi,Xi;(Xi=qi||(qi={})).Ma="default",Xi.Cache="cache";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fh(s){const e={};return s.timeoutSeconds!==void 0&&(e.timeoutSeconds=s.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ji=new Map;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rs="firestore.googleapis.com",Ki=!0;class Yi{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new P(D.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=Rs,this.ssl=Ki}else this.host=e.host,this.ssl=e.ssl??Ki;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=xh;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<Vh)throw new P(D.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Ph("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Fh(e.experimentalLongPollingOptions??{}),(function(o){if(o.timeoutSeconds!==void 0){if(isNaN(o.timeoutSeconds))throw new P(D.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (must not be NaN)`);if(o.timeoutSeconds<5)throw new P(D.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (minimum allowed value is 5)`);if(o.timeoutSeconds>30)throw new P(D.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(o,a){return o.timeoutSeconds===a.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Ns{constructor(e,i,o,a){this._authCredentials=e,this._appCheckCredentials=i,this._databaseId=o,this._app=a,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Yi({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new P(D.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new P(D.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Yi(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=(function(o){if(!o)return new yh;switch(o.type){case"firstParty":return new Eh(o.sessionIndex||"0",o.iamToken||null,o.authTokenFactory||null);case"provider":return o.client;default:throw new P(D.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(i){const o=Ji.get(i);o&&(Z("ComponentProvider","Removing Datastore"),Ji.delete(i),o.terminate())})(this),Promise.resolve()}}function Os(s,e,i,o={}){s=Oh(s,Ns);const a=yn(e),p=s._getSettings(),m={...p,emulatorOptions:s._getEmulatorOptions()},w=`${e}:${i}`;a&&(fs(`https://${w}`),ps("Firestore",!0)),p.host!==Rs&&p.host!==w&&mh("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const A={...p,host:w,ssl:a,emulatorOptions:o};if(!Se(A,m)&&(s._setSettings(A),o.mockUserToken)){let T,N;if(typeof o.mockUserToken=="string")T=o.mockUserToken,N=G.MOCK_USER;else{T=$r(o.mockUserToken,s._app?.options.projectId);const S=o.mockUserToken.sub||o.mockUserToken.user_id;if(!S)throw new P(D.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");N=new G(S)}s._authCredentials=new _h(new Ps(T,N))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class An{constructor(e,i,o){this.converter=i,this._query=o,this.type="query",this.firestore=e}withConverter(e){return new An(this.firestore,e,this._query)}}class it{constructor(e,i,o){this.converter=i,this._key=o,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new In(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new it(this.firestore,e,this._key)}toJSON(){return{type:it._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,i,o){if(ae(i,it._jsonSchema))return new it(e,o||null,new bt(Y.fromString(i.referencePath)))}}it._jsonSchemaVersion="firestore/documentReference/1.0",it._jsonSchema={type:B("string",it._jsonSchemaVersion),referencePath:B("string")};class In extends An{constructor(e,i,o){super(e,i,jh(o)),this._path=o,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new it(this.firestore,null,new bt(e))}withConverter(e){return new In(this.firestore,e,this._path)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zi="AsyncQueue";class Qi{constructor(e=Promise.resolve()){this.Xu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new Bh(this,"async_queue_retry"),this._c=()=>{const o=an();o&&Z(Zi,"Visibility state changed to "+o.visibilityState),this.M_.w_()},this.ac=e;const i=an();i&&typeof i.addEventListener=="function"&&i.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.uc(),this.cc(e)}enterRestrictedMode(e){if(!this.ec){this.ec=!0,this.sc=e||!1;const i=an();i&&typeof i.removeEventListener=="function"&&i.removeEventListener("visibilitychange",this._c)}}enqueue(e){if(this.uc(),this.ec)return new Promise((()=>{}));const i=new ne;return this.cc((()=>this.ec&&this.sc?Promise.resolve():(e().then(i.resolve,i.reject),i.promise))).then((()=>i.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.Xu.push(e),this.lc())))}async lc(){if(this.Xu.length!==0){try{await this.Xu[0](),this.Xu.shift(),this.M_.reset()}catch(e){if(!kh(e))throw e;Z(Zi,"Operation failed with retryable error: "+e)}this.Xu.length>0&&this.M_.p_((()=>this.lc()))}}cc(e){const i=this.ac.then((()=>(this.rc=!0,e().catch((o=>{throw this.nc=o,this.rc=!1,Cs("INTERNAL UNHANDLED ERROR: ",ts(o)),o})).then((o=>(this.rc=!1,o))))));return this.ac=i,i}enqueueAfterDelay(e,i,o){this.uc(),this.oc.indexOf(e)>-1&&(i=0);const a=En.createAndSchedule(this,e,i,o,(p=>this.hc(p)));return this.tc.push(a),a}uc(){this.nc&&oe(47125,{Pc:ts(this.nc)})}verifyOperationInProgress(){}async Tc(){let e;do e=this.ac,await e;while(e!==this.ac)}Ic(e){for(const i of this.tc)if(i.timerId===e)return!0;return!1}Ec(e){return this.Tc().then((()=>{this.tc.sort(((i,o)=>i.targetTimeMs-o.targetTimeMs));for(const i of this.tc)if(i.skipDelay(),e!=="all"&&i.timerId===e)break;return this.Tc()}))}dc(e){this.oc.push(e)}hc(e){const i=this.tc.indexOf(e);this.tc.splice(i,1)}}function ts(s){let e=s.message||"";return s.stack&&(e=s.stack.includes(s.message)?s.stack:s.message+`
`+s.stack),e}class Uh extends Ns{constructor(e,i,o,a){super(e,i,o,a),this.type="firestore",this._queue=new Qi,this._persistenceKey=a?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Qi(e),this._firestoreClient=void 0,await e}}}function $h(s,e){const i=typeof s=="object"?s:As(),o=typeof s=="string"?s:mn,a=vs(i,"firestore").getImmediate({identifier:o});if(!a._initialized){const p=ls("firestore");p&&Os(a,...p)}return a}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rt{constructor(e){this._byteString=e}static fromBase64String(e){try{return new rt(Pt.fromBase64String(e))}catch(i){throw new P(D.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+i)}}static fromUint8Array(e){return new rt(Pt.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:rt._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(ae(e,rt._jsonSchema))return rt.fromBase64String(e.bytes)}}rt._jsonSchemaVersion="firestore/bytes/1.0",rt._jsonSchema={type:B("string",rt._jsonSchemaVersion),bytes:B("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ks{constructor(...e){for(let i=0;i<e.length;++i)if(e[i].length===0)throw new P(D.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new St(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ct{constructor(e,i){if(!isFinite(e)||e<-90||e>90)throw new P(D.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(i)||i<-180||i>180)throw new P(D.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+i);this._lat=e,this._long=i}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return _t(this._lat,e._lat)||_t(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Ct._jsonSchemaVersion}}static fromJSON(e){if(ae(e,Ct._jsonSchema))return new Ct(e.latitude,e.longitude)}}Ct._jsonSchemaVersion="firestore/geoPoint/1.0",Ct._jsonSchema={type:B("string",Ct._jsonSchemaVersion),latitude:B("number"),longitude:B("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dt{constructor(e){this._values=(e||[]).map((i=>i))}toArray(){return this._values.map((e=>e))}isEqual(e){return(function(o,a){if(o.length!==a.length)return!1;for(let p=0;p<o.length;++p)if(o[p]!==a[p])return!1;return!0})(this._values,e._values)}toJSON(){return{type:Dt._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(ae(e,Dt._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every((i=>typeof i=="number")))return new Dt(e.vectorValues);throw new P(D.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}Dt._jsonSchemaVersion="firestore/vectorValue/1.0",Dt._jsonSchema={type:B("string",Dt._jsonSchemaVersion),vectorValues:B("object")};const Hh=new RegExp("[~\\*/\\[\\]]");function zh(s,e,i){if(e.search(Hh)>=0)throw es(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,s);try{return new ks(...e.split("."))._internalPath}catch{throw es(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,s)}}function es(s,e,i,o,a){let p=`Function ${e}() called with invalid data`;p+=". ";let m="";return new P(D.INVALID_ARGUMENT,p+s+m)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ms{constructor(e,i,o,a,p){this._firestore=e,this._userDataWriter=i,this._key=o,this._document=a,this._converter=p}get id(){return this._key.path.lastSegment()}get ref(){return new it(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new Gh(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const i=this._document.data.field(Ls("DocumentSnapshot.get",e));if(i!==null)return this._userDataWriter.convertValue(i)}}}class Gh extends Ms{data(){return super.data()}}function Ls(s,e){return typeof e=="string"?zh(s,e):e instanceof ks?e._internalPath:e._delegate._internalPath}class Ae{constructor(e,i){this.hasPendingWrites=e,this.fromCache=i}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Mt extends Ms{constructor(e,i,o,a,p,m){super(e,i,o,a,m),this._firestore=e,this._firestoreImpl=e,this.metadata=p}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const i=new Ie(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(i,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,i={}){if(this._document){const o=this._document.data.field(Ls("DocumentSnapshot.get",e));if(o!==null)return this._userDataWriter.convertValue(o,i.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new P(D.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,i={};return i.type=Mt._jsonSchemaVersion,i.bundle="",i.bundleSource="DocumentSnapshot",i.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?i:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),i.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),i)}}Mt._jsonSchemaVersion="firestore/documentSnapshot/1.0",Mt._jsonSchema={type:B("string",Mt._jsonSchemaVersion),bundleSource:B("string","DocumentSnapshot"),bundleName:B("string"),bundle:B("string")};class Ie extends Mt{data(e={}){return super.data(e)}}class ie{constructor(e,i,o,a){this._firestore=e,this._userDataWriter=i,this._snapshot=a,this.metadata=new Ae(a.hasPendingWrites,a.fromCache),this.query=o}get docs(){const e=[];return this.forEach((i=>e.push(i))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,i){this._snapshot.docs.forEach((o=>{e.call(i,new Ie(this._firestore,this._userDataWriter,o.key,o,new Ae(this._snapshot.mutatedKeys.has(o.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const i=!!e.includeMetadataChanges;if(i&&this._snapshot.excludesMetadataChanges)throw new P(D.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===i||(this._cachedChanges=(function(a,p){if(a._snapshot.oldDocs.isEmpty()){let m=0;return a._snapshot.docChanges.map((w=>{const A=new Ie(a._firestore,a._userDataWriter,w.doc.key,w.doc,new Ae(a._snapshot.mutatedKeys.has(w.doc.key),a._snapshot.fromCache),a.query.converter);return w.doc,{type:"added",doc:A,oldIndex:-1,newIndex:m++}}))}{let m=a._snapshot.oldDocs;return a._snapshot.docChanges.filter((w=>p||w.type!==3)).map((w=>{const A=new Ie(a._firestore,a._userDataWriter,w.doc.key,w.doc,new Ae(a._snapshot.mutatedKeys.has(w.doc.key),a._snapshot.fromCache),a.query.converter);let T=-1,N=-1;return w.type!==0&&(T=m.indexOf(w.doc.key),m=m.delete(w.doc.key)),w.type!==1&&(m=m.add(w.doc),N=m.indexOf(w.doc.key)),{type:Wh(w.type),doc:A,oldIndex:T,newIndex:N}}))}})(this,i),this._cachedChangesIncludeMetadataChanges=i),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new P(D.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=ie._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Th.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const i=[],o=[],a=[];return this.docs.forEach((p=>{p._document!==null&&(i.push(p._document),o.push(this._userDataWriter.convertObjectMap(p._document.data.value.mapValue.fields,"previous")),a.push(p.ref.path))})),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function Wh(s){switch(s){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return oe(61501,{type:s})}}ie._jsonSchemaVersion="firestore/querySnapshot/1.0",ie._jsonSchema={type:B("string",ie._jsonSchemaVersion),bundleSource:B("string","QuerySnapshot"),bundleName:B("string"),bundle:B("string")};(function(e,i=!0){(function(a){he=a})(Jo),se(new Lt("firestore",((o,{instanceIdentifier:a,options:p})=>{const m=o.getProvider("app").getImmediate(),w=new Uh(new vh(o.getProvider("auth-internal")),new Ah(m,o.getProvider("app-check-internal")),(function(T,N){if(!Object.prototype.hasOwnProperty.apply(T.options,["projectId"]))throw new P(D.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Ce(T.options.projectId,N)})(m,a),m);return p={useFetchStreams:i,...p},w._setSettings(p),w}),"PUBLIC").setMultipleInstances(!0)),yt(Fi,Ui,e),yt(Fi,Ui,"esm2020")})();const js=Es({apiKey:"AIzaSyAzv2yATCAmAOVJgoOMS_56vDUv8Mb8gX8",authDomain:"storytect-e77d1.firebaseapp.com",projectId:"storytect-e77d1",storageBucket:"storytect-e77d1.firebasestorage.app",messagingSenderId:"178947771962",appId:"1:178947771962:web:6b76776633435433b56f03",measurementId:"G-X4HHEM6BEF"}),qh=dh(js),Xh=$h(js);location.hostname==="localhost"&&(bs(qh,"localhost",5001),Os(Xh,"localhost",8080));function na(s,e){ns(e,!1);let i=is("");Math.random().toString(36).slice(2,12),os();var a=Ar(),p=Ir(a);{var m=w=>{Rr(w,{get msg(){return cn(i)}})};Tr(p,w=>{cn(i)&&w(m)})}ss(s,a),rs()}export{na as component};
