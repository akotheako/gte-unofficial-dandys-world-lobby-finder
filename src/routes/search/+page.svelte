<script lang="ts">
	import { onMount } from "svelte";

	type Toon = { id: number; imgSrc: string };
	const toonsInfo: Toon[] = [
		{ id: 0, imgSrc: "/media/toons/Astro_Render.webp" }, // TODO "Any" toon image
		{ id: 1, imgSrc: "/media/toons/Astro_Render.webp" },
		{ id: 2, imgSrc: "/media/toons/Bassie_Render.webp" },
		{ id: 3, imgSrc: "/media/toons/Blot_Render.webp" },
		{ id: 4, imgSrc: "/media/toons/Bobette_Render.webp" },
		{ id: 5, imgSrc: "/media/toons/Boxten_Render.webp" },
		{ id: 6, imgSrc: "/media/toons/Brightney_Render.webp" },
		{ id: 7, imgSrc: "/media/toons/Brusha_Render.webp" },
		{ id: 8, imgSrc: "/media/toons/Coal_Render.webp" },
		{ id: 9, imgSrc: "/media/toons/Cocoa_Render.webp" },
		{ id: 10, imgSrc: "/media/toons/Connie_Render.webp" },
		{ id: 11, imgSrc: "/media/toons/Cosmo_Render.webp" },
		{ id: 12, imgSrc: "/media/toons/Eggson_Render.webp" },
		{ id: 13, imgSrc: "/media/toons/Finn_Render.webp" },
		{ id: 14, imgSrc: "/media/toons/Flutter_Render.webp" },
		{ id: 15, imgSrc: "/media/toons/Flyte_Render.webp" },
		{ id: 16, imgSrc: "/media/toons/Gigi_Render.webp" },
		{ id: 17, imgSrc: "/media/toons/Ginger_Render.webp" },
		{ id: 18, imgSrc: "/media/toons/Glisten_Render.webp" },
		{ id: 19, imgSrc: "/media/toons/Goob_Render.webp" },
		{ id: 20, imgSrc: "/media/toons/Looey_Render.webp" },
		{ id: 21, imgSrc: "/media/toons/Pebble_Render.webp" },
		{ id: 22, imgSrc: "/media/toons/Poppy_Render.webp" },
		{ id: 23, imgSrc: "/media/toons/Razzle_&_Dazzle_Render.webp" },
		{ id: 24, imgSrc: "/media/toons/Rodger_Render.webp" },
		{ id: 25, imgSrc: "/media/toons/Rudie_Render.webp" },
		{ id: 26, imgSrc: "/media/toons/Scraps_Render.webp" },
		{ id: 27, imgSrc: "/media/toons/Shelly_Render.webp" },
		{ id: 28, imgSrc: "/media/toons/Shrimpo_Render.webp" },
		{ id: 29, imgSrc: "/media/toons/Sprout_Render.webp" },
		{ id: 30, imgSrc: "/media/toons/Teagan_Render.webp" },
		{ id: 31, imgSrc: "/media/toons/Tisha_Render.webp" },
		{ id: 32, imgSrc: "/media/toons/Toodles_Render.webp" },
		{ id: 33, imgSrc: "/media/toons/Vee_Render.webp" },
		{ id: 34, imgSrc: "/media/toons/Yatta_Render.webp" },
	];

	function preloadImages(srcs: string[]) {
		return Promise.all(
			srcs.map(
				(src) =>
					new Promise<void>((res) => {
						const img = new Image();
						img.onload = img.onerror = () => res();
						img.src = src;
					}),
			),
		);
	}

	onMount(() => {
		preloadImages(toonsInfo.map((t) => t.imgSrc));
	});

	type ToonPick = { toonID: number; trinket1ID: number; trinket2ID: number };
	let rows: ToonPick[][] = [[{ toonID: 0, trinket1ID: 0, trinket2ID: 0 }]];

	let pickerOpen = false;
	let pickerX = 0,
		pickerY = 0;
	let pickerType: "toon" | "t1" | "t2" | null = null;
	let targetRow = 0,
		targetCol = 0;

	function openPicker(
		e: MouseEvent,
		type: typeof pickerType,
		r: number,
		c: number,
	) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		pickerX = rect.left;
		pickerY = rect.bottom;
		pickerType = type;
		targetRow = r;
		targetCol = c;
		pickerOpen = true;
	}
	function closePicker() {
		pickerOpen = false;
	}

	function pickToon(t: Toon) {
		rows[targetRow][targetCol].toonID = t.id;
		closePicker();
	}
	function pickTrinket(id: number, slot: "t1" | "t2") {
		if (slot === "t1") rows[targetRow][targetCol].trinket1ID = id;
		else rows[targetRow][targetCol].trinket2ID = id;
		closePicker();
	}
</script>

<h1>Which toon will you play as?</h1>
<div>Placing toons in higher priorities (1=highest) affects the search.</div>

{#each rows as row, r}
	<div
		style="display:flex;align-items:center;gap:.75rem;padding:.5rem;background:rgba(0,0,0,.35);border-radius:.5rem"
	>
		<h1 style="width:2em;text-align:center;margin-left:.4em">{r + 1}</h1>
		<div style="display:flex;gap:.75rem;flex-wrap:wrap;flex:1">
			{#each row as toon, c}
				<div
					style="display:flex;flex-direction:column;align-items:center;gap:.4rem"
				>
					<!-- Toon -->
					<button
						type="button"
						class="circle"
						aria-label="Select toon"
						style="width:72px;height:72px;background-size:cover;background-position:center"
						on:click={(e) => openPicker(e, "toon", r, c)}
						style:backgroundImage={`url('${toonsInfo.find((t) => t.id === toon.toonID)?.imgSrc ?? ""}')`}
					></button>

					<!-- Trinkets -->
					<div style="display:flex;gap:.4rem">
						<button
							type="button"
							class="circle"
							aria-label="Select trinket slot 1"
							style="width:36px;height:36px"
							on:click={(e) => openPicker(e, "t1", r, c)}
						></button>
						<button
							type="button"
							class="circle"
							aria-label="Select trinket slot 2"
							style="width:36px;height:36px"
							on:click={(e) => openPicker(e, "t2", r, c)}
						></button>
					</div>
				</div>
			{/each}
			<button
				style="width:5em"
				on:click={() =>
					row.push({ toonID: 0, trinket1ID: 0, trinket2ID: 0 })}
				>+ Toon</button
			>
		</div>
		{#if r > 0}
			<button on:click={() => rows.splice(r, 1)}>Delete row</button>
		{/if}
	</div>
{/each}

<button
	on:click={() => rows.push([{ toonID: 0, trinket1ID: 0, trinket2ID: 0 }])}
	>+ Add row</button
>

{#if pickerOpen}
	<div
		class="picker"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		style={`left:${pickerX}px;top:${pickerY}px`}
		on:keydown={(e) => e.key === "Escape" && closePicker()}
	>
		{#if pickerType === "toon"}
			{#each toonsInfo as t}
				<button
					type="button"
					aria-label={`Pick toon ${t.id}`}
					on:click={() => pickToon(t)}
					style={`width:2rem;height:2rem;background-image:url('${t.imgSrc}');background-size:cover;background-position:center;border-radius:.25rem`}
				></button>
			{/each}
		{:else if pickerType}
			{#each Array(24) as _, i}
				<button
					on:click={() =>
						pickTrinket(i, pickerType === "t1" ? "t1" : "t2")}
					style="width:2rem;height:2rem;border-radius:.25rem"
					>{i}</button
				>
			{/each}
		{/if}
	</div>
	<div
		role="button"
		tabindex="0"
		aria-label="Close picker"
		style="position:fixed;inset:0"
		on:click={closePicker}
		on:keydown={(e) =>
			(e.key === "Enter" || e.key === " ") && closePicker()}
	></div>
{/if}

<style>
	.picker {
		position: fixed;
		background: rgba(0, 0, 0, 0.9);
		color: white;
		padding: 0.5rem;
		border-radius: 0.5rem;
		z-index: 9999;
		display: grid;
		grid-template-columns: repeat(5, 2rem);
		gap: 0.5rem;
	}
	.circle {
		border-radius: 9999px;
		background: rgba(255, 255, 255, 0.15);
		display: grid;
		place-items: center;
		cursor: pointer;
	}
	.circle:hover {
		outline: 2px solid rgba(255, 255, 255, 0.6);
	}
</style>
