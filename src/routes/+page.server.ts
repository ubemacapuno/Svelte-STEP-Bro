import { redirect } from '@sveltejs/kit'

export const actions = {
	setTheme: async function ({ url, cookies }) {
		const theme = url.searchParams.get('theme')
		const redirectTo = url.searchParams.get('redirectTo')
		if (!theme) return
		cookies.set('step-theme', theme, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365
		})

		redirect(302, redirectTo ?? '/')
	}
}
