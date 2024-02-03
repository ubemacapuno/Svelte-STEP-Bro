<script lang="ts">
	import TopNav from './TopNav.svelte'
	import '$lib/styles/index.css'
</script>

<div class="site_wrapper">
	<TopNav />
	<main>
		<slot />
	</main>
</div>

<style>
	.site_wrapper {
		display: grid;
		grid-template-columns: auto 1fr;
		grid-template-rows: auto;
		grid-template-areas:
			'sidenav topnav'
			'sidenav main';
	}

	main {
		grid-area: main;
		overflow-y: auto;
		height: calc(100vh - 3rem);
	}
</style>
