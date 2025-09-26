<script lang="ts">
    import ChevronDownIcon from "~icons/gravity-ui/chevron-down"
    import XmarkIcon from "~icons/gravity-ui/xmark"

    import { getDefaultTrafficLightPosition } from "$lib/utils/getDefaultTrafficLightPosition"
    import { getCurrentWindow } from "@tauri-apps/api/window"

    let { forcePosition }: { forcePosition?: "left" | "right" } = $props()

    const position = $derived.by(() => {
        let position = forcePosition
        if (position) return position
        return getDefaultTrafficLightPosition()
    })
</script>

{#if position !== "none"}
    <div
        class="fixed top-3 {position === 'left'
            ? 'left-3'
            : position === 'right'
              ? 'right-3'
              : ''} z-9999 flex h-min w-min rounded-[9999px] bg-[#FFFFFF76] p-1 text-gray-900 shadow-md backdrop-blur-md"
    >
        {#snippet minimizeButton()}
            <button class="contents" onclick={() => getCurrentWindow().minimize()}>
                <ChevronDownIcon width="18" height="18" />
            </button>
        {/snippet}
        {#snippet closeButton()}
            <button class="contents" onclick={() => getCurrentWindow().close()}>
                <XmarkIcon width="18" height="18" />
            </button>
        {/snippet}
        {#snippet spaceBetween()}
            <div class="mx-0.5"></div>
        {/snippet}
        {#if position === "left"}
            {@render closeButton()}
            {@render spaceBetween()}
            {@render minimizeButton()}
        {:else if position === "right"}
            {@render minimizeButton()}
            {@render spaceBetween()}
            {@render closeButton()}
        {/if}
    </div>
{/if}
