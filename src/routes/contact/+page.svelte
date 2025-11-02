<script>
	import { pushError } from "$lib/errorBus";
	const email = "gtedwlobbyfindercontact@gmail.com";

	async function copyEmail() {
		try {
			await navigator.clipboard.writeText(email);
		} catch {
			pushError("Could not copy email");
		}
	}
</script>

<div
	style="display:flex;flex-direction:column;gap:1rem;max-width:720px;margin:0 auto;color:white"
>
	<h1>Contact</h1>

	<p>
		Use this email for questions, bug reports, complaints, or suggestions:
	</p>

	<div style="display:flex;align-items:center;gap:0.5rem">
		<input
			readonly
			value={email}
			style="flex:1;padding:.6em 1em;border-radius:1em;background:#264e64;color:white"
		/>
		<button
			on:click={copyEmail}
			style="background:royalblue;padding:.6em 1em;border-radius:1em"
		>
			{copied ? "Copied" : "Copy"}
		</button>
	</div>
</div>
