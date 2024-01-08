<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import type { Accent, FontSize, IconName } from './element-types'
	import Icon from './Icon.svelte'

	const dispatch = createEventDispatcher()

	export let type: 'button' | 'submit' | 'reset' = 'button'
	export let href: string | null = null
	export let disabled: boolean = false
	export let loading: boolean = false
	export let accent: Extract<Accent, 'primary' | 'warning' | 'caution' | 'success'> = 'primary'
	export let outline = false
	export let text = false
	export let iconName: IconName | '' = ''
	export let size: FontSize = 'small'
	export let active: boolean = false

	$: if (href && !href.startsWith('/'))
		console.error('{href} prop must start with a slash to be a valid link')
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	{href}
	role={href ? 'link' : 'button'}
	disabled={disabled || loading}
	aria-busy={loading}
	class={`btn ${accent} ${size}_font`}
	class:outline
	class:text
	class:active
	on:click={() => dispatch('click')}
	{type}
	{...$$restProps}
>
	{#if iconName}
		<Icon name={iconName} {size} />
	{/if}
	<slot />
</svelte:element>

<style lang="postcss">
	.btn,
	a.btn {
		border-radius: var(--border_radius);
		color: var(--title_color);
		padding: var(--gap_xsmall) var(--gap_small);
		font-weight: var(--semi_bold_weight);
		display: inline-flex;
		gap: var(--gap_smallest);
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: var(--transition_speed) ease-in background;
		line-height: 1.25rem;
		border: 1px solid transparent;

		&.primary {
			border: 1px solid var(--primary_color);
			background-color: var(--primary_color);
			&:hover {
				background-color: var(--primary_hover_color);
			}
		}

		&.warning {
			background-color: var(--warning_color);
			border-color: var(--warning_color);

			&:hover {
				background-color: var(--warning_color);
			}
		}

		&.success {
			background-color: var(--success_color);
			border-color: var(--success_color);

			&:hover {
				background-color: var(--success_color);
			}
		}

		&.text {
			border: 1px solid transparent;
			background-color: transparent;
			color: var(--title_color);
			font-weight: var(--normal_weight);

			&.warning {
				color: var(--warning_color);

				:global(.icon) {
					color: var(--warning_color);
				}
			}

			&.success {
				color: var(--success_color);

				:global(.icon) {
					color: var(--success_color);
				}
			}

			&.caution {
				color: var(--caution_color);

				:global(.icon) {
					color: var(--caution_color);
				}
			}

			&:disabled,
			&:disabled:hover {
				color: var(--disabled_color);
				border-color: transparent;
				background-color: transparent;
			}

			&:hover {
				background-color: var(--hover_color);
			}
		}

		&:disabled,
		&:disabled:hover {
			background-color: var(--disabled_color);
			border-color: var(--disabled_color);
			cursor: not-allowed;
		}

		&.outline {
			background-color: transparent;
			color: var(--text_color);
			border-color: var(--button_border_color);

			&:hover {
				background-color: var(--hover_color);
				color: var(--title_color);
			}

			&.caution {
				color: var(--caution_color);
				border-color: var(--caution_color);

				&:hover {
					background-color: var(--hover_color);
					color: var(--caution_color);

					:global(.icon) {
						color: var(--caution_color);
					}
				}
			}

			&.warning {
				color: var(--warning_color);
				border-color: var(--warning_color);

				&:hover {
					background-color: var(--hover_color);
					color: var(--warning_color);

					:global(.icon) {
						color: var(--warning_color);
					}
				}
			}

			&.success {
				color: var(--success_color);
				border-color: var(--success_color);

				&:hover {
					background-color: var(--hover_color);
					color: var(--success_color);

					:global(.icon) {
						color: var(--success_color);
					}
				}
			}

			&:disabled,
			&:disabled:hover {
				background-color: transparent;
				color: var(--disabled_color);
			}
		}

		&:focus,
		&:focus-visible {
			outline: 1px auto -webkit-focus-ring-color;
		}

		&.active {
			background-color: var(--primary_active_color);
			transition: var(--transition_speed) ease-in-out;

			&:hover {
				background-color: var(--primary_active_color);
			}
		}
	}

	:global([data-theme='light']) .btn {
		color: var(--white);

		&.outline {
			color: var(--text_color);
		}

		&.text {
			color: var(--title_color);
		}
	}
</style>
