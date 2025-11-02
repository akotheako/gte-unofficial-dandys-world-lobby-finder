<script>
	import "../app.css";
	import NavLink from "$lib/NavLink.svelte";
	import { errorMsg, clearError } from "$lib/errorBus";

	let muted = false;

	// restore on load
	if (typeof localStorage !== "undefined") {
		const saved = localStorage.getItem("muted-bg");
		if (saved === "true") muted = true;
	}

	// reactively apply + persist
	$: {
		document?.body.classList.toggle("muted-bg", muted);
		if (typeof localStorage !== "undefined")
			localStorage.setItem("muted-bg", String(muted));
	}
</script>

<nav
	style="display:flex;width:100%;background:rgba(0,0,0,0.4);align-items:center"
>
	<NavLink href="/home" text="Home" />
	<NavLink href="/me" text="Me" />
	<NavLink href="/search" text="Search" />
	<NavLink href="/contact" text="Contact" />
	<NavLink href="/tutorials" text="Tutorials" />
	<a href="https://www.roblox.com/games/16116270224" target="_blank">Play</a>
</nav>

<main
	id="app"
	class:muted
	style="padding:1rem;color:white;margin:1rem;border-radius:1rem;"
>
	<slot />
</main>

<button
	on:click={() => (muted = !muted)}
	aria-label="Toggle muted background"
	style="
		position:fixed;right:1rem;bottom:1rem;
		background:rgba(0,0,0,0.55);color:white;
		padding:.6em 1em;border-radius:1em;
		backdrop-filter:blur(4px);
		z-index:10000;"
>
	{muted ? "Colorful BG" : "Muted BG"}
</button>

<!-- Sticky error bar -->
{#if $errorMsg}
	<div
		role="alert"
		style="
			position:fixed;left:0;right:0;bottom:0;
			background:#b71c1c;color:white;
			padding:.75rem 1rem;text-align:center;
			z-index:10000;box-shadow:0 -2px 8px rgba(0,0,0,.3);
		"
	>
		<div
			style="max-width:960px;margin:0 auto;display:flex;gap:.75rem;align-items:center;justify-content:center;flex-wrap:wrap"
		>
			<span>{$errorMsg}</span>
			<button
				on:click={clearError}
				style="background:rgba(255,255,255,.2);padding:.3rem .75rem;border-radius:.75rem"
			>
				Dismiss
			</button>
		</div>
	</div>
{/if}

<style>
	main.muted {
		background: rgba(0, 0, 0, 0.35);
		backdrop-filter: blur(4px);
		transition: background 0.3s ease;
	}
</style>
