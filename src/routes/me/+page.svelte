<script context="module" lang="ts">
	export const ssr = false;
</script>

<script lang="ts">
	import {
		functions,
		db,
		httpsCallable,
		gteDoc,
		gteGetDoc,
	} from "$lib/firebase";
	import { pushError } from "$lib/errorBus";

	let robloxName = "";
	let privateServerUrl = "";
	let verifying = false;

	let handle = "";
	const genCode = () => {
		const actualCode = Math.random().toString(36).slice(2, 12);
		return `I'm verifying my account for the GTE website! This is the code: ${actualCode}`;
	};
	let code = genCode();

	function copyText(t: string) {
		navigator.clipboard
			?.writeText(t)
			.catch(() => pushError("Could not copy to clipboard"));
	}

	async function verifyNow() {
		if (!handle.trim() || !code.trim()) {
			pushError("Enter your Roblox @ and generate a code first.");
			return;
		}
		verifying = true;
		try {
			const verifyFn = httpsCallable(functions, "verifyRoblox");
			const res: any = await verifyFn({
				handle: handle.replace(/^@/, ""),
				code,
			});
			if (res.data?.success) {
				const docRef = gteDoc(db, "users", handle.toLowerCase());
				const snap = await gteGetDoc(docRef);
				const isVerified =
					snap.exists() && (snap.data() as any).verified === true;
				robloxName = isVerified ? handle.replace(/^@/, "") : "";
				if (!isVerified) pushError("Not verified on server.");
			} else {
				pushError(res.data?.error || "Code not found");
			}
		} catch (e) {
			console.error(e);
			pushError("Verification error");
		} finally {
			verifying = false;
		}
	}

	async function savePrivateServer() {
		try {
			const saveFn = httpsCallable(functions, "saveUserProfile");
			await saveFn({ handle: robloxName, privateServerUrl });
			// success: no toast per your request
		} catch (e) {
			console.error(e);
			pushError("Save failed");
		}
	}

	function logout() {
		robloxName = "";
		privateServerUrl = "";
	}
</script>

{#if robloxName}
	<div
		style="display:flex;flex-direction:column;gap:1em;width:100%;text-align:center;max-width:720px;margin:0 auto"
	>
		<h1>Logged in as @{robloxName}</h1>

		<button on:click={logout}>Log out</button>

		<div>
			<div>OPTIONAL: Share your Dandy's World private server link</div>
			<div>Recommended. It can speed up the search.</div>
		</div>

		<input
			placeholder="https://www.roblox.com/share?code=..........."
			bind:value={privateServerUrl}
			style="width:100%"
		/>

		<button on:click={savePrivateServer}>Save</button>

		<div>
			<h1>Where can I find my link?</h1>
			<div>You can create a free private server here:</div>
			<a
				href="https://www.roblox.com/games/16116270224/Dandys-World-ALPHA#!/game-instances"
				target="_blank"
				style="color:lightblue"
			>
				&gt;&gt;&gt; Dandy's World on Roblox &lt;&lt;&lt;
			</a>
			<h1>Go to Servers and configure it:</h1>
			<img
				src="/media/howtomakeprivateserver1.webp"
				alt="How to make private server 1"
				style="max-width:100%;display:block;margin:0 auto"
			/>
			<h1>Allow Joining and copy the link:</h1>
			<img
				src="/media/howtomakeprivateserver2.webp"
				alt="How to make private server 2"
				style="max-width:100%;display:block;margin:0 auto"
			/>
		</div>
	</div>
{:else}
	<div
		style="display:flex;flex-direction:column;gap:1em;width:100%;max-width:720px;margin:0 auto;text-align:center"
	>
		<h1>You are currently NOT verified!</h1>
		<div>
			You must have a Roblox account and verify it to use this website.
			Here's how:
		</div>

		<img
			src="/media/howtoverifyrobloxaccount.webp"
			alt="How to verify"
			style="max-width:100%;display:block;margin:0 auto"
		/>

		<div
			style="display:flex;gap:.5em;align-items:center;justify-content:center"
		>
			<label for="rbxHandle">Roblox @</label>
			<input
				id="rbxHandle"
				placeholder="coolrobloxperson"
				bind:value={handle}
			/>
		</div>

		<div>Copy this code and paste it in your Roblox About section:</div>

		<div
			style="display:flex;flex-direction:column;align-items:stretch;gap:.5em;width:100%;text-align:center"
		>
			<textarea
				readonly
				bind:value={code}
				on:input={(e) => {
					const el = e.currentTarget;
					el.style.height = "auto";
					el.style.height = el.scrollHeight + "px";
				}}
				style="width:100%;box-sizing:border-box;resize:none;overflow:hidden"
			></textarea>
			<div style="display:flex;gap:.5em;justify-content:flex-end">
				<button on:click={() => copyText(code)}>Copy</button>
				<button on:click={() => (code = genCode())}>New code</button>
			</div>
		</div>

		<div>Once that's done, click verify:</div>

		<div style="display:flex;justify-content:center">
			<button on:click={verifyNow} disabled={verifying}
				>{verifying ? "Verifying..." : "Verify now"}</button
			>
		</div>
	</div>
{/if}
