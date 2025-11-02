export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["robots.txt"]),
	mimeTypes: {".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.qYluMOMI.js",app:"_app/immutable/entry/app.Cyj8QSVA.js",imports:["_app/immutable/entry/start.qYluMOMI.js","_app/immutable/chunks/DuH3qB-k.js","_app/immutable/chunks/BaSbAj9Z.js","_app/immutable/chunks/DG-OJh56.js","_app/immutable/entry/app.Cyj8QSVA.js","_app/immutable/chunks/DG-OJh56.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/BaSbAj9Z.js","_app/immutable/chunks/D-EumPD_.js","_app/immutable/chunks/Bml6PAJl.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/home",
				pattern: /^\/home\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/me",
				pattern: /^\/me\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
