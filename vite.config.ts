import { sveltekit } from '@sveltejs/kit/vite'
import autoImport from 'sveltekit-autoimport'

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		autoImport({
			components: ['./src/elements'],

			module: {
				svelte: ['onMount']
			}
		}),
		sveltekit()
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
}

export default config
