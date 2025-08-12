<script lang="ts">
    import ChevronDownIcon from "~icons/gravity-ui/chevron-down"
    import XmarkIcon from "~icons/gravity-ui/xmark"

    import { isTauri } from "@tauri-apps/api/core"
    import { getCurrentWindow } from "@tauri-apps/api/window"
    import { platform } from "@tauri-apps/plugin-os"
</script>

{#if isTauri() && platform() === "windows"}
    <div
        class="fixed top-3 right-3 z-9999 flex h-min w-min rounded-[9999px] bg-[#FFFFFF76] p-1 text-green-900 shadow-md backdrop-blur-md"
    >
        <button class="contents" onclick={() => getCurrentWindow().minimize()}>
            <ChevronDownIcon width="18" height="18" />
        </button>
        <div class="mx-0.5"></div>
        <button class="contents" onclick={() => getCurrentWindow().close()}>
            <XmarkIcon width="18" height="18" />
        </button>
    </div>
{/if}
