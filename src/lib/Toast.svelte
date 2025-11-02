<script>
    import { onMount } from "svelte"
    export let msg = ""
    let visible = false
    onMount(() => {
        requestAnimationFrame(() => (visible = true))
        const t = setTimeout(() => (visible = false), 1500)
        return () => clearTimeout(t)
    })
</script>

<div
    style="position:fixed;bottom:1rem;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.8);color:white;padding:.5rem 1rem;border-radius:.5rem;font-size:.9rem;z-index:9999;transition:opacity .3s"
    style:opacity={visible ? 1 : 0}
>
    {msg}
</div>
