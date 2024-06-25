<script lang="ts">
	export let label: string = ''
	export let design: string = 'inner'
	export let fontSize: number = 16
	export let value: boolean

	let checked = value

	const uniqueID = Math.floor(Math.random() * 100)

	function handleClick() {
		checked = !checked
		value = checked
	}
</script>

{#if design === 'inner'}
	<div class="s s--inner">
		<span id={`switch-${uniqueID}`}>{label}</span>
		<button
			role="switch"
			aria-checked={checked}
			aria-labelledby={`switch-${uniqueID}`}
			on:click={handleClick}
		>
			<span>on</span>
			<span>off</span>
		</button>
	</div>
{:else if design === 'slider'}
	<div class="s s--slider" style="font-size:{fontSize}px">
		<span id={`switch-${uniqueID}`}>{label}</span>
		<button
			role="switch"
			aria-checked={checked}
			aria-labelledby={`switch-${uniqueID}`}
			on:click={handleClick}
		></button>
	</div>
{:else}
	<div class="s s--multi">
		<div
			role="radiogroup"
			class="group-container"
			aria-labelledby={`label-${uniqueID}`}
			style="font-size:{fontSize}px"
			id={`group-${uniqueID}`}
		>
			<div class="legend" id={`label-${uniqueID}`}>{label}</div>
			<input
				type="radio"
				id={`option-metric-${uniqueID}`}
				name={`group-${uniqueID}`}
				value="metric"
				checked={value === true}
				on:click={() => (value = true)}
			/>
			<label for={`option-metric-${uniqueID}`}>Metric</label>
			<input
				type="radio"
				id={`option-imperial-${uniqueID}`}
				name={`group-${uniqueID}`}
				value="imperial"
				checked={value === false}
				on:click={() => (value = false)}
			/>
			<label for={`option-imperial-${uniqueID}`}>Imperial</label>
		</div>
	</div>
{/if}

<style>
	/* Inner Design Option */
	.s--inner button {
		padding: 0.5em;
		background-color: var(--white);
		border: 1px solid var(--grey_10);
	}
	[role='switch'][aria-checked='true'] :first-child,
	[role='switch'][aria-checked='false'] :last-child {
		display: none;
		color: var(--white);
	}

	.s--inner button span {
		user-select: none;
		pointer-events: none;
		padding: 0.25em;
	}

	.s--inner button:focus {
		outline: var(--primary_color) solid 1px;
	}

	/* Slider Design Option */

	.s--slider {
		display: flex;
		align-items: center;
	}

	.s--slider button {
		width: 3em;
		height: 1.6em;
		position: relative;
		margin: 0 0 0 0.5em;
		background: var(--grey_10);
		border: none;
	}

	.s--slider button::before {
		content: '';
		position: absolute;
		width: 1.3em;
		height: 1.3em;
		background: var(--white);
		top: 0.13em;
		right: 1.5em;
		transition: transform 0.3s;
	}

	.s--slider button[aria-checked='true'] {
		background-color: var(--primary_color);
	}

	.s--slider button[aria-checked='true']::before {
		transform: translateX(1.3em);
		transition: transform 0.3s;
	}

	.s--slider button:focus {
		box-shadow: 0 0px 0px 1px var(--primary_color);
	}

	/* Multi Design Option */

	/* Based on suggestions from Sara Soueidan https://www.sarasoueidan.com/blog/toggle-switch-design/
  and this example from Scott O'hara https://codepen.io/scottohara/pen/zLZwNv */

	.s--multi .group-container {
		border: none;
		padding: 0;
		white-space: nowrap;
	}

	/* .s--multi legend {
  font-size: 2px;
  opacity: 0;
  position: absolute;
  } */

	.s--multi label {
		display: inline-block;
		line-height: 1.6;
		position: relative;
		z-index: 2;
	}

	.s--multi input {
		opacity: 0;
		position: absolute;
	}

	.s--multi label:first-of-type {
		padding-right: 5em;
	}

	.s--multi label:last-child {
		margin-left: -5em;
		padding-left: 5em;
	}

	.s--multi:focus-within label:first-of-type:after {
		box-shadow: 0 0px 8px var(--primary_color);
		border-radius: 1.5em;
	}

	/* making the switch UI.  */
	.s--multi label:first-of-type:before,
	.s--multi label:first-of-type:after {
		content: '';
		height: 1.25em;
		overflow: hidden;
		pointer-events: none;
		position: absolute;
		vertical-align: middle;
	}

	.s--multi label:first-of-type:before {
		border-radius: 100%;
		z-index: 2;
		position: absolute;
		width: 1.2em;
		height: 1.2em;
		background: var(--white);
		top: 0.2em;
		right: 1.2em;
		transition: transform 0.3s;
	}

	.s--multi label:first-of-type:after {
		background: var(--primary_color);
		border-radius: 1em;
		margin: 0 1em;
		transition: background 0.2s ease-in-out;
		width: 3em;
		height: 1.6em;
	}

	.s--multi input:first-of-type:checked ~ label:first-of-type:after {
		background: var(--grey_10);
	}

	.s--multi input:first-of-type:checked ~ label:first-of-type:before {
		transform: translateX(-1.4em);
	}

	.s--multi input:last-of-type:checked ~ label:last-of-type {
		z-index: 1;
	}

	.s--multi input:focus {
		box-shadow: 0 0px 8px var(--primary_color);
		border-radius: 1.5em;
	}

	/* gravy */

	/* Inner Design Option */
	[role='switch'][aria-checked='true'] :first-child,
	[role='switch'][aria-checked='false'] :last-child {
		border-radius: 0.25em;
		background: var(--primary_color);
		display: inline-block;
	}

	.s--inner button:focus {
		box-shadow: 0 0px 8px var(--primary_color);
		border-radius: 0.1em;
	}

	/* Slider Design Option */
	.s--slider button {
		border-radius: 1.5em;
	}

	.s--slider button::before {
		border-radius: 100%;
	}

	.s--slider button:focus {
		box-shadow: 0 0px 8px var(--primary_color);
		border-radius: 1.5em;
	}
</style>
