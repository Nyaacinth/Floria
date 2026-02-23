<template>
    <div class="edges" :style="style" @mousedown="clicked = true" @mouseup="clicked = false">
        <slot />
    </div>
</template>

<script setup lang="ts">
    import type { CSSProperties } from "vue"
    import { ref, computed } from "vue"
    import { getDisplacementFilter, type DisplacementOptions } from "./getDisplacementFilter"
    import { getDisplacementMap } from "./getDisplacementMap"

    interface GlassElementProps extends DisplacementOptions {
        blur?: number
        debug?: boolean
    }

    const props = withDefaults(defineProps<GlassElementProps>(), {
        blur: 2,
        debug: false,
        strength: 100,
        chromaticAberration: 0
    })

    const clicked = ref(false)

    const style = computed<CSSProperties>(() => {
        const depth = props.depth / (clicked.value ? 0.7 : 1)
        const baseStyle: CSSProperties = {
            height: `${props.height}px`,
            width: `${props.width}px`,
            borderRadius: `${props.radius}px`,
            backdropFilter: `blur(${props.blur / 2}px) url('${getDisplacementFilter({
                height: props.height,
                width: props.width,
                radius: props.radius,
                depth,
                strength: props.strength,
                chromaticAberration: props.chromaticAberration
            })}') blur(${props.blur}px) brightness(1.1) saturate(1.5) `
        }

        if (props.debug) {
            baseStyle.background = `url("${getDisplacementMap({
                height: props.height,
                width: props.width,
                radius: props.radius,
                depth
            })}")`
            baseStyle.boxShadow = "none"
        }

        return baseStyle
    })
</script>

<style scoped>
    .edges {
        box-shadow: inset 0 0 4px 0px white;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
