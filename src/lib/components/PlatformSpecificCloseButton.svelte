<script lang="ts">
    import XmarkIcon from "~icons/gravity-ui/xmark"

    import { isTauri } from "@tauri-apps/api/core"
    import { getCurrentWindow } from "@tauri-apps/api/window"
    import { platform } from "@tauri-apps/plugin-os"
</script>

{#if isTauri() && platform() === "windows"}
    <button
        class="fixed top-3 right-3 z-9999 h-min w-min rounded-[9999px] bg-[#FFFFFF76] p-1 text-green-900 shadow-md backdrop-blur-md"
        onclick={() => getCurrentWindow().close()}
    >
        <XmarkIcon width="18" height="18" />
    </button>
{/if}
