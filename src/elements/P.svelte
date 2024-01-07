<script lang="ts">
	import type { FontSize, Accent } from '$elements/element-types'

	export let style = ''
	export let size: FontSize = 'normal'
	export let accent: Accent | 'disabled' = 'text'
	export let as = 'p'
</script>

<svelte:element
	this={as}
	class={`${size}_font ${accent}_color ${$$props.class ?? ''}`}
	{style}
	data-testid={$$props['data-testid']}
>
	<slot />
</svelte:element>
