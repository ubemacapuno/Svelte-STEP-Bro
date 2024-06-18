import { redirect } from '@sveltejs/kit'

export const actions = {
	setTheme: async function ({ url, cookies }) {
		console.log('Running setTheme action')
		const theme = url.searchParams.get('theme')
		const redirectTo = url.searchParams.get('redirectTo')
		if (!theme) return
		cookies.set('fw-theme', theme, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365
		})

		redirect(302, redirectTo ?? '/')
	}
}
