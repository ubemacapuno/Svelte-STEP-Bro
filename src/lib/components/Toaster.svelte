<script lang="ts" context="module">
	export type ToastData = {
		title: string
		description: string
		color: string
	}

	const {
		elements: { content, title, description, close },
		helpers,
		states: { toasts },
		actions: { portal }
	} = createToaster<ToastData>()

	export const addToast = helpers.addToast
</script>

<script lang="ts">
	import { createToaster, melt } from '@melt-ui/svelte'
	import { fly } from 'svelte/transition'
</script>

<div class="toast-container" use:portal>
	{#each $toasts as { id, data } (id)}
		<div
			class="toast"
			style="border: 1px solid var(--{data.color ?? 'line_color'})"
			use:melt={$content(id)}
			in:fly={{ duration: 150, x: '100%' }}
			out:fly={{ duration: 150, x: '100%' }}
		>
			<div>
				<h3 use:melt={$title(id)} style="color: var(--{data.color ?? 'text_color'})">
					{data.title}
					<span style="color: {data.color}"></span>
				</h3>
				<div use:melt={$description(id)} style="color: var(--text_color);">
					{data.description}
				</div>
			</div>
			<button use:melt={$close(id)} aria-label="close notification"> X </button>
		</div>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		right: 0;
		top: 0;
		z-index: 50;
		margin: 1rem;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.5rem;
	}

	@media (min-width: 900px) {
		.toast-container {
			bottom: 0;
			top: auto;
		}
	}

	h3 {
		margin: 0;
	}

	.toast {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: var(--sheet_color);
		padding: var(--gap_small);
		border-radius: var(--border_radius);
		box-shadow: var(--transparent_backdrop);
		transition: transform 0.15s ease-in-out;
		min-width: var(--min_width);
	}

	.toast button {
		cursor: pointer;
		color: var(--text_color);
	}

	.toast button:hover {
		color: var(--primary_hover_color);
	}
</style>
