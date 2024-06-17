<script lang="ts">
	import type { FontSize, Accent } from '$elements/element-types'

	export let style = ''
	export let size: FontSize = 'large'
	export let accent: Accent = 'title'
</script>

<h3
	class={`${size}_font ${accent}_color ${$$props.class ?? ''}`}
	{style}
	data-testid={$$props['data-testid']}
>
	<slot />
</h3>
