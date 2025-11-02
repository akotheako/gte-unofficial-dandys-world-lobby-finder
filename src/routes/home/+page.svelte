<script>
    import NavLink from "$lib/NavLink.svelte"
</script>

<div style="display:flex;flex-direction:column;gap:1em;width:100%;text-align:center">
    <h1>Get To Ele!</h1>
    <h3>Dandy's World Unofficial Lobby Finder</h3>

    <div>
        <div>Are you tired of teams being so difficult to find?</div>
        <div>Waiting in the lobby for half an hour until you're ready, just in time for someone to have to leave?</div>
        <div>Getting together with people of a different region and lagging? Etc etc</div>
    </div>

    <h1>Wait no more!</h1>

    <div>
        <div>Find your perfect team right here!</div>
        <div>Just specify which toons and trinkets you want to use, team composition, your region, and just play!</div>
    </div>

    <div style="margin-top:4em;margin-bottom:4em;display:flex;flex-direction:column;gap:1em">
        <h1>Step 1: Verify your Roblox account -> <NavLink href="/me" text="Me" /></h1>
        <h1>Step 2: Search for a team! -> <NavLink href="/search" text="Search" /></h1>
    </div>

    <div>
        This is a website made by one person, so please have mercy if something doesn't work right and use
        <NavLink href="/contact" text="Contact" /> to leave feedback and bug reports! Thank you ✨
    </div>

    <div>
        Oh and one last thing: If you're
        <span style="color:hotpink">BlushCrunch Studio</span>
        and you do not approve of this website or want me to change something, let me know!
        <NavLink href="/contact" text="Contact" />
    </div>
</div>
