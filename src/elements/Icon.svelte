<script lang="ts">
	import type { FontSize, Accent, IconName } from '$elements/element-types'

	export let name: IconName
	export let size: FontSize = 'large'
	export let accent: Accent | undefined = undefined
	export let disabled = false
	export let style = ''
</script>

<span
	class:disabled
	class={`icon icon-${name} material-symbols-outlined ${
		accent ? `${accent}_color` : ''
	} ${size}_font ${$$props.class ?? ''}`}
	{style}
>
	{name}
</span>

<style lang="postcss">
	.icon {
		flex-shrink: 0;
		transition: var(--transition_speed) ease-in-out color;
		user-select: none;

		&.disabled {
			color: var(--disabled_color);
		}
	}
</style>
