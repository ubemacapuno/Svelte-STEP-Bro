<div class="nav_wrapper" data-testid="top-nav">
	<h1>Svelte STEP Bro</h1>
</div>

<style>
	h1 {
		color: var(--orange);
	}
	.nav_wrapper {
		height: var(--nav_height);
		background-color: var(--sheet_color);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--gap_smallest);
		padding: 0 var(--gap_smallest);
		border-bottom: 1px solid var(--line_color);
		grid-area: topnav;
	}
</style>
