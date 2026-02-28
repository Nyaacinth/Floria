<script lang="ts">
    import { doAppInit } from "$lib/utils/doAppInit"
    import { onMount } from "svelte"
    import "../app.css"

    let { children } = $props()

    onMount(() => {
        return doAppInit()
    })
</script>

{@render children?.()}
