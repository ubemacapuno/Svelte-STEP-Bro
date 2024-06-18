<script lang="ts">
	import Icon from '$elements/Icon.svelte'
	import type { IconName } from '$elements/element-types'
	import { type AnyMeltElement, emptyMeltElement, melt } from '@melt-ui/svelte'

	export let active = false
	export let element: AnyMeltElement = emptyMeltElement
	export let iconName: IconName | undefined = undefined
	export let description: string = ''
	export let href: string | null = null
	export let type: 'button' | 'submit' = 'button'
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	role={href ? 'link' : 'button'}
	data-testid={$$props['data-testid']}
	on:click
	use:melt={$element}
	on:m-click
	class="menu_item"
	class:active
	{type}
	{href}
	{...$$restProps}
>
	{#if iconName}
		<Icon name={iconName} size="large" />
	{/if}
	<span class="menu_label">
		<slot />
		{#if description}<P size="xsmall" accent="subtext" class="margin_0">{description}</P>{/if}
	</span>
</svelte:element>

<style lang="postcss">
	.menu_item {
		display: inline-flex;
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

			:global(.icon) {
				color: var(--disabled_color);
			}

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
