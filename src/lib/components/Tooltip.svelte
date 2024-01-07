<script lang="ts">
	import type { Placement } from '@popperjs/core'
	import { createPopperActions } from 'svelte-popperjs'
	import { fade } from 'svelte/transition'

	export let placement: Placement = 'top'
	export let content = ''
	export let hasArrow = true
	export let style = ''

	const [popperRef, popperContent] = createPopperActions({ placement })
	const extraOpts = {
		modifiers: [{ name: 'offset', options: { offset: [0, 8] } }]
	}

	let showTooltip = false
</script>

<span
	use:popperRef
	on:mouseenter={() => (showTooltip = true)}
	on:mouseleave={() => (showTooltip = false)}
	{style}
>
	<slot />
</span>

{#if showTooltip && content}
	<div transition:fade={{ duration: 200 }} class="tooltip" use:popperContent={extraOpts}>
		{@html content}
		{#if hasArrow}
			<div class="tooltip-arrow" data-popper-arrow />{/if}
	</div>
{/if}
