
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/contact" | "/home" | "/me" | "/search";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/contact": Record<string, never>;
			"/home": Record<string, never>;
			"/me": Record<string, never>;
			"/search": Record<string, never>
		};
		Pathname(): "/" | "/contact" | "/contact/" | "/home" | "/home/" | "/me" | "/me/" | "/search" | "/search/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/favicon.ico" | "/media/howtomakeprivateserver1.webp" | "/media/howtomakeprivateserver2.webp" | "/media/howtoverifyrobloxaccount.webp" | "/media/toons/Astro_Render.webp" | "/media/toons/Bassie_Render.webp" | "/media/toons/Blot_Render.webp" | "/media/toons/Bobette_Render.webp" | "/media/toons/Boxten_Render.webp" | "/media/toons/Brightney_Render.webp" | "/media/toons/Brusha_Render.webp" | "/media/toons/Coal_Render.webp" | "/media/toons/Cocoa_Render.webp" | "/media/toons/Connie_Render.webp" | "/media/toons/Cosmo_Render.webp" | "/media/toons/Eggson_Render.webp" | "/media/toons/Finn_Render.webp" | "/media/toons/Flutter_Render.webp" | "/media/toons/Flyte_Render.webp" | "/media/toons/Gigi_Render.webp" | "/media/toons/Ginger_Render.webp" | "/media/toons/Glisten_Render.webp" | "/media/toons/Goob_Render.webp" | "/media/toons/Looey_Render.webp" | "/media/toons/Pebble_Render.webp" | "/media/toons/Poppy_Render.webp" | "/media/toons/Razzle_&_Dazzle_Render.webp" | "/media/toons/Rodger_Render.webp" | "/media/toons/Rudie_Render.webp" | "/media/toons/Scraps_Render.webp" | "/media/toons/Shelly_Render.webp" | "/media/toons/Shrimpo_Render.webp" | "/media/toons/Sprout_Render.webp" | "/media/toons/Teagan_Render.webp" | "/media/toons/Tisha_Render.webp" | "/media/toons/Toodles_Render.webp" | "/media/toons/Vee_Render.webp" | "/media/toons/Yatta_Render.webp" | "/robots.txt" | string & {};
	}
}