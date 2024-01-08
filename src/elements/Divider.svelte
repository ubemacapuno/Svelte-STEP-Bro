<script lang="ts">
	import type { Accent, FontSize, GapSize } from '$elements/element-types'

	export let left: GapSize = '0'
	export let right: GapSize = '0'
	export let accent: Accent | 'line' = 'line'
	export let size: FontSize = 'normal'
</script>

<span
	class={$$props.class}
	style:margin-left={`var(--gap_${left})`}
	style:margin-right={`var(--gap_${right})`}
	style:background-color={`var(--${accent}_color)`}
	style:height={`calc(var(--font_${size}) + var(--gap_smallest) * 2)`}
/>

<style lang="postcss">
	span {
		width: 1px;
	}
</style>
