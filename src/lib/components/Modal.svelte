<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte'
	const {
		elements: { trigger, portalled, overlay, content, title, description, close },
		states: { open }
	} = createDialog()
</script>

<button use:melt={$trigger}><slot name="trigger"></slot></button>

{#if $open}
	<div class="modal_wrapper" use:melt={$portalled}>
		<div class="modal_overlay" use:melt={$overlay}></div>
		<div class="modal_content_wrapper" use:melt={$content}>
			<div class="modal_header">
				<h2 use:melt={$title}><slot name="title">Dialog Title</slot></h2>
				<button class="close_button" use:melt={$close}>
					<Icon name="close" />
				</button>
			</div>
			<div class="modal_body">
				<slot />
			</div>
		</div>
	</div>
{/if}

<style lang="postcss">
	.modal_wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		position: fixed;
		inset: 0;
		z-index: var(--modal_level);
	}

	.modal_overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: -1;
	}

	.modal_content_wrapper {
		background-color: var(--card_color);
		border-radius: var(--border_radius);
		box-shadow: var(--shadow);
		max-width: 42rem;
		width: 100%;
		margin: var(--gap_small);
		overflow: auto;
		display: flex;
		flex-direction: column;
	}

	.modal_header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--gap) var(--gap_small);
		border-bottom: var(--line);
		background-color: var(--bg_color);
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.modal_body {
		padding: var(--gap_small);
	}

	.close_button {
		background: none;
		border: none;
		color: var(--error);
		cursor: pointer;
		font-size: 1.2rem;
	}
</style>
