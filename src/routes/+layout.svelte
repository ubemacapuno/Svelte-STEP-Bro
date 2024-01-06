<script lang="ts">
	import TopNav from './TopNav.svelte';
</script>

<!-- <TopNav />
<main> -->
<slot />

<!-- </main> -->

<style>
	main {
		grid-area: main;
		overflow-y: auto;
		height: calc(100vh - 3rem);
	}
</style>
