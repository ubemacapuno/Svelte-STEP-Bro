import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

const theme: Handle = async ({ event, resolve }) => {
	let theme: string | null = null

	const newTheme = event.url.searchParams.get('theme')
	const cookieTheme = event.cookies.get('step-theme')

	if (newTheme) {
		theme = newTheme
	} else if (cookieTheme) {
		theme = cookieTheme
	}

	if (theme) {
		return await resolve(event, {
			transformPageChunk: ({ html }) => html.replace('data-theme="dark"', `data-theme="${theme}"`)
		})
	}

	return await resolve(event)
}

export const handle: Handle = sequence(theme)
