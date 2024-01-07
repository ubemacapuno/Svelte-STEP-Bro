<script lang="ts">
	import Tooltip from '$lib/components/Tooltip.svelte'
	import { createEventDispatcher } from 'svelte'
	import type { Accent, IconName, FontSize } from './element-types'
	import Icon from './Icon.svelte'

	const dispatch = createEventDispatcher()

	export let type: 'button' | 'submit' | 'reset' = 'button'
	export let href: string | null = null
	export let disabled: boolean = false
	export let loading: boolean = false
	export let accent: Accent = 'text'
	export let active = false
	export let size: FontSize = 'normal'
	export let outline = false
	export let name: IconName
	export let tooltipText = ''
	export let tooltipPlacement: 'top' | 'bottom' | 'left' | 'right' = 'top'
	export let hasPadding = true

	$: if (href && !href.startsWith('/'))
		console.error('{href} prop must start with a slash to be a valid link')
</script>

{#if tooltipText}
	<Tooltip content={tooltipText} placement={tooltipPlacement}>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<svelte:element
			this={href ? 'a' : 'button'}
			{href}
			{disabled}
			aria-busy={loading}
			class={`icon_btn ${accent}_color`}
			class:outline
			class:active
			class:hasPadding
			on:click|stopPropagation={() => dispatch('click')}
			{type}
			{...$$restProps}
		>
			<Icon {name} {size} />
		</svelte:element>
	</Tooltip>
{:else}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<svelte:element
		this={href ? 'a' : 'button'}
		{href}
		{disabled}
		aria-busy={loading}
		class={`icon_btn ${accent}_color`}
		class:outline
		class:active
		class:hasPadding
		on:click|stopPropagation={() => dispatch('click')}
		{type}
		{...$$restProps}
	>
		<Icon {name} {size} />
	</svelte:element>
{/if}

<style lang="postcss">
	.icon_btn,
	a.icon_btn {
		border-radius: var(--border_radius);

		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition:
			border-color,
			background-color,
			color var(--transition_speed) ease-in;
		line-height: 1;
		border: 1px solid transparent;

		&.hasPadding {
			padding: var(--gap_smallest);
		}

		&:hover {
			background-color: var(--hover_color);

			&.caution_color {
				:global(.icon) {
					color: var(--caution_color);
				}
			}

			&.warning_color {
				:global(.icon) {
					color: var(--warning_color);
				}
			}
			&.primary_color {
				:global(.icon) {
					color: var(--primary_color);
				}
			}
		}

		&.active {
			background-color: var(--primary_active_color);
		}

		&.outline {
			background-color: transparent;
			color: var(--text_color);
			border-color: var(--button_border_color);

			&.active {
				background-color: var(--primary_active_color);
			}

			&:hover {
				color: var(--title_color);
			}
			&:disabled {
				border-color: var(--disabled_color);
			}
		}

		&:disabled {
			cursor: not-allowed;
		}

		:global(&:disabled .icon) {
			color: var(--disabled_color);
		}

		&:focus,
		&:focus-visible {
			outline: 1px auto -webkit-focus-ring-color;
		}
	}
</style>
