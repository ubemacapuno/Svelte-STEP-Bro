// Size
export type FontSize =
	| 'huge'
	| 'largest'
	| 'xlarge'
	| 'xxlarge'
	| 'large'
	| 'normal'
	| 'small'
	| 'smallest'
	| 'xsmall'
export type GapSize = 'normal' | 'large' | 'largest' | 'small' | 'smallest' | 'xsmall' | '0'

// Theme
export type Status = 'info' | 'warning' | 'caution' | 'success'
export type Text = 'text' | 'subtext' | 'title'
export type Theme = 'primary' | 'secondary'
export type Accent = Status | Text | Theme

// Icons (from Material UI)
export type IconName =
	| 'play_arrow'
	| 'folder_open'
	| 'cancel'
	| 'restart_alt'
	| 'dark_mode'
	| 'light_mode'
