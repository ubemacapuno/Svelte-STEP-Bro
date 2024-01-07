<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import type { Accent, IconName } from '../../elements/element-types'

	const dispatch = createEventDispatcher()

	export let active = false
	export let iconName: IconName | undefined = undefined
	export let iconAccent: Accent | undefined = undefined
	export let description: string = ''
	export let href: string | null = null
	export let src: string | null = null
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	role={href ? 'link' : 'button'}
	data-testid={$$props['data-testid']}
	on:click={() => dispatch('click')}
	class="menu_item"
	class:active
	{href}
	{...$$restProps}
>
	{#if iconName}
		<Icon name={iconName} accent={iconAccent} size="large" class="menu_item_icon" />
	{:else if $$slots.icon}
		<slot name="icon" />
	{/if}
	<span class="menu_label">
		<slot />
		{#if description}<P size="xsmall" accent="subtext" class="margin_0">{description}</P>{/if}
	</span>
</svelte:element>

<style lang="postcss">
	.menu_item {
		align-items: center;
		gap: var(--gap_smallest);
		position: relative;
		width: 100%;
		padding: var(--gap_smallest);
		border-radius: var(--border_radius);
		color: var(--text_color);
		transition: var(--transition_speed) background-color;
		cursor: pointer;

		& + :global(.menu_item) {
			margin-top: var(--gap_smallest);
		}

		:global(.icon) {
			color: var(--subtext_color);
		}

		&:hover {
			background-color: var(--hover_color);
			color: var(--title_color);
		}

		&.active {
			color: var(--title_color);
			background-color: var(--primary_active_color);

			:global(.icon) {
				color: var(--title_color);
			}
		}

		&:disabled {
			color: var(--disabled_color);
			cursor: auto;

			&:hover {
				background-color: transparent;
			}
		}

		.menu_label {
			font-size: var(--font_small);
			text-align: left;
		}
	}
</style>
