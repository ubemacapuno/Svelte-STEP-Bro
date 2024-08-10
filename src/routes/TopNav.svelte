<script>
	import Tooltip from '$lib/components/Tooltip.svelte'
	import Modal from '$lib/components/Modal.svelte'
	import Divider from '$elements/Divider.svelte'
	import ThemeSelector from '$lib/components/ThemeSelector.svelte'
</script>

<div class="nav_wrapper">
	<h1>Svelte STEP</h1>
	<div class="flex">
		<Tooltip content="Instructions">
			<Modal>
				<span slot="trigger">
					<IconButton name="info" tooltipText="Info" />
				</span>
				<div slot="title">Instructions</div>
				<div>
					<H3 accent="primary">Loading a STEP File</H3>
					<p>
						Click "Import STEP" to upload your file (.stp or .step). Click "Load Demo" to load a
						demo model. Models are shown in orthographic view.
					</p>
					<H3 accent="primary">Viewing and Navigating</H3>
					<p>
						Zoom: Use mouse wheel or pinch to zoom (on mobile).<br />
						Rotate: Hold left mouse button and move to rotate, or use one finger to rotate (on mobile).<br
						/>
						Move: Hold right mouse button and move, press Shift/Ctrl/Command + left mouse button to move,
						or use two fingers to move (on mobile).
					</p>
					<H3 accent="primary">Additional Controls</H3>
					<p>
						Toggle light/dark theme<br />
						Reset camera<br />
						Toggle info<br />
						Remove model<br />
						Toggle metric/imperial units
					</p>
					<H3 accent="primary">Model information</H3>
					<p>
						Surface area<br />
						Part volume<br />
						Bounding box
					</p>
				</div>
			</Modal>
		</Tooltip>

		<Tooltip content="Theme">
			<ThemeSelector action="?/setTheme" />
		</Tooltip>

		<Divider />

		<Tooltip content="View on GitHub">
			<a
				class="github-link"
				rel="noreferrer noopener"
				href="https://github.com/ubemacapuno/svelte-step-cad-viewer"
				target="_blank"
				aria-label="GitHub Repository"
			>
				<svg
					class="github-icon"
					fill="var(--grey_7)"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.602-3.369-1.34-3.369-1.34-.455-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.003.07 1.532 1.03 1.532 1.03.891 1.529 2.341 1.089 2.912.833.091-.647.349-1.086.635-1.335-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.276.098-2.656 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 7.029c.85 0 1.7.114 2.5.334 1.909-1.294 2.747-1.025 2.747-1.025.547 1.38.202 2.403.099 2.656.64.698 1.027 1.59 1.027 2.682 0 3.841-2.337 4.687-4.564 4.934.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.577.688.479C19.138 20.164 22 16.416 22 12c0-5.523-4.477-10-10-10z"
					/>
				</svg>
			</a>
		</Tooltip>
	</div>
</div>

<style>
	h1 {
		color: var(--orange);
	}
	.nav_wrapper {
		height: var(--nav_height);
		background-color: var(--bg_color);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--gap_smallest);
		padding: 0 var(--gap);
		border-bottom: 1px solid var(--line_color);
		grid-area: topnav;
	}
	.github-link {
		display: inline-block;
		width: 24px;
		height: 24px;
	}
	.github-icon {
		width: 100%;
		height: 100%;
	}

	.flex {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--gap_smallest);
	}
</style>
