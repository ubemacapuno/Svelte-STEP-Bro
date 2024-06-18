<script lang="ts">
	import { enhance } from '$app/forms'
	import type { SubmitFunction } from '@sveltejs/kit'
	import { page } from '$app/stores'
	import { browser } from '$app/environment'
	import { invalidateAll } from '$app/navigation'
	import Tooltip from './Tooltip.svelte'
	import IconButton from '$elements/IconButton.svelte'

	export let action: string

	type Theme = 'light' | 'dark'

	let currentTheme: Theme = browser
		? (document.documentElement.getAttribute('data-theme') as Theme) ?? 'dark'
		: 'dark'

	const submitUpdateTheme: SubmitFunction = async ({ action }) => {
		const theme = action.searchParams.get('theme')

		if (theme) {
			document.documentElement.setAttribute('data-theme', theme)
			currentTheme = theme as Theme
			invalidateAll()
		}
	}

	$: {
		// Ensure currentTheme is in sync with the DOM attribute
		if (browser) {
			const theme = document.documentElement.getAttribute('data-theme') as Theme
			if (theme && currentTheme !== theme) {
				currentTheme = theme
			}
		}
	}
</script>

<form method="POST" use:enhance={submitUpdateTheme}>
	<IconButton
		formaction="{action}&theme={currentTheme === 'dark' ? 'light' : 'dark'}&redirectTo={$page.url
			.pathname}"
		name="{currentTheme}_mode"
		type="submit"
	/>
</form>
