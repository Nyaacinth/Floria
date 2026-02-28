<script lang="ts">
    import { doTauriInit } from "$lib/utils/doTauriInit"
    import { onMount } from "svelte"
    import "../app.css"

    let { children } = $props()

    onMount(() => {
        return doTauriInit()
    })
</script>

{@render children?.()}
