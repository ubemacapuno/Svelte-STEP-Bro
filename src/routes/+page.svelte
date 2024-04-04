<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import * as THREE from 'three'
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
	import { LoadStep } from '../utilities/StepLoader'
	import Loader from '$lib/components/Loader.svelte'
	import MenuItem from '$lib/components/MenuItem.svelte'
	import Tooltip from '$lib/components/Tooltip.svelte'
	import IconButton from '$elements/IconButton.svelte'
	import Button from '$elements/Button.svelte'
	import Divider from '$elements/Divider.svelte'
	import { debounce } from '$utilities/helpers'

	type ModelSource = string | File

	const demoUrl = '/demo.stp'

	// STEP Colors
	const lightModeColor = 0xd9e7fc
	const darkModeColor = 0x232323

	// THREEjs Vars:
	let container: HTMLElement | null = null
	let model: THREE.Object3D | null
	let scene: THREE.Scene
	let camera: THREE.PerspectiveCamera
	let renderer: THREE.WebGLRenderer
	let controls: OrbitControls

	let isModelLoading = false
	let isModelRendered: boolean = false
	let fileName: string | null = null
	let debouncedResize: (...args: any[]) => void
	let currentBackgroundColor = darkModeColor

	onMount(() => {
		// Initialize scene, camera, and renderer,
		// but make sure container and window exist first
		if (container && typeof window !== 'undefined') {
			scene = new THREE.Scene()
			camera = new THREE.PerspectiveCamera(
				45,
				container.clientWidth / container.clientHeight,
				10,
				100000
			)
			renderer = new THREE.WebGLRenderer({ antialias: true })
			renderer.setClearColor(currentBackgroundColor)
			renderer.setSize(container.clientWidth, container.clientHeight)

			container.appendChild(renderer.domElement)

			// Add ambient light
			const ambientLight = new THREE.AmbientLight(0xffffff)
			scene.add(ambientLight)

			// Add directional light
			const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7)
			directionalLight.position.set(5, 5, 5)
			scene.add(directionalLight)

			// Initialize OrbitControls
			controls = new OrbitControls(camera, renderer.domElement)

			// Rendering loop
			function animate() {
				requestAnimationFrame(animate)
				if (controls) {
					controls.update()
				}
				renderer.render(scene, camera)
			}
			animate()
			debouncedResize = debounce(onWindowResize, 1800) // Debounce the resize to save on performance
			window.addEventListener('resize', debouncedResize)

			// Ensure initial sizing is correct
			onWindowResize()
			loadDemoFile()
		} else {
			console.error('Container and/or Window elements are undefined.')
		}
	})

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', debouncedResize)
		}
	})

	async function loadAndHandleModel(modelSource: ModelSource) {
		fileName = modelSource instanceof File ? modelSource.name : 'demo.stp'
		isModelLoading = true

		clearModel()
		model = await LoadStep(modelSource)

		if (model) {
			isModelRendered = true
			scene.add(model)

			// Calculate the bounding box to adjust the camera
			const bbox = new THREE.Box3().setFromObject(model)
			const center = bbox.getCenter(new THREE.Vector3())
			model.position.sub(center) // Center the model

			// Create edge geometry from the mesh
			const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 1 })
			model.traverse((child) => {
				if (child instanceof THREE.Mesh) {
					const edges = new THREE.EdgesGeometry(child.geometry)
					const edgeLine = new THREE.LineSegments(edges, edgeMaterial)
					child.add(edgeLine)
				}
			})

			// Adjust the camera based on the model's bounding box
			const size = bbox.getSize(new THREE.Vector3())
			const maxDim = Math.max(size.x, size.y, size.z)
			const fov = camera.fov * (Math.PI / 180)
			let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2))

			cameraZ *= 1.2 // Adjust this factor as needed to ensure the model is fully visible

			// Position the camera at a 45-degree angle along Y and X axes
			camera.position.set(cameraZ, cameraZ, cameraZ)

			camera.lookAt(center)
			camera.updateProjectionMatrix()

			isModelLoading = false
		}
	}

	async function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement
		if (input.files && input.files[0]) {
			await loadAndHandleModel(input.files[0]) // Pass the file to the new function
		}
	}

	function triggerFileInput() {
		const fileInput = document.getElementById('fileInput')
		fileInput?.click()
	}

	function resetCamera() {
		if (!model) return
		// Calculate the bounding box to adjust the camera
		const bbox = new THREE.Box3().setFromObject(model)
		const center = bbox.getCenter(new THREE.Vector3())
		const size = bbox.getSize(new THREE.Vector3())
		const maxDim = Math.max(size.x, size.y, size.z)
		const fov = camera.fov * (Math.PI / 180)
		let cameraZ = maxDim / 2 / Math.tan(fov / 2)

		cameraZ *= 1.2
		// Update camera position
		camera.position.set(cameraZ, cameraZ, cameraZ)
		camera.lookAt(center)
		camera.updateProjectionMatrix()

		// Reset OrbitControls to view centered model
		if (controls) {
			controls.target.copy(center)
			controls.update()
		}
	}

	function clearModel() {
		if (model && scene) {
			// Remove and dispose of the model
			scene.remove(model)
			model.traverse((child) => {
				if (child instanceof THREE.Mesh) {
					child.geometry.dispose()
					if (Array.isArray(child.material)) {
						child.material.forEach((material) => material.dispose())
					} else {
						child.material.dispose()
					}
				}
			})
			fileName = null
			model = null
		}
		// Reset the camera
		resetCamera()

		// Reset controls
		if (controls) {
			controls.reset()
		}

		// clear out the renderer
		renderer.clear()

		isModelRendered = false
	}

	function onWindowResize() {
		if (camera && renderer && container) {
			camera.aspect = container.clientWidth / container.clientHeight
			camera.updateProjectionMatrix()
			renderer.setSize(container.clientWidth, container.clientHeight)
		}
	}

	// Function to toggle light/dark mode
	function toggleLightDarkMode() {
		// Toggle between light and dark mode colors
		currentBackgroundColor =
			currentBackgroundColor === lightModeColor ? darkModeColor : lightModeColor

		// Apply the new color
		if (renderer) {
			renderer.setClearColor(currentBackgroundColor)
			renderer.render(scene, camera) // Re-render the scene with the new background color
		}
	}

	async function loadDemoFile() {
		await loadAndHandleModel(demoUrl) // Pass the URL
	}
</script>

<!-- Hidden file input element -->
<input type="file" id="fileInput" accept=".step,.stp" on:change={handleFileChange} class="hidden" />

<div class="tool_container">
	<Tooltip content="Select a STEP File" placement="bottom">
		<MenuItem iconName="folder_open" on:click={triggerFileInput} />
	</Tooltip>
	<Tooltip content="Load a Demo STEP File" placement="bottom">
		<MenuItem iconName="play_arrow" on:click={loadDemoFile} />
	</Tooltip>

	<Divider />

	<IconButton
		tooltipText="Reset Camera"
		disabled={!model}
		accent="subtext"
		name="restart_alt"
		on:click={resetCamera}
	/>
	<IconButton
		tooltipText="Clear Model"
		disabled={!model}
		name="cancel"
		accent={!model ? undefined : 'warning'}
		on:click={clearModel}
	/>
	<IconButton
		tooltipText={currentBackgroundColor === lightModeColor
			? 'Toggle Dark Mode'
			: 'Toggle Light Mode'}
		disabled={!model}
		accent="subtext"
		name={currentBackgroundColor === lightModeColor ? 'light_mode' : 'dark_mode'}
		on:click={toggleLightDarkMode}
	/>
</div>

<div bind:this={container} class="canvas_container">
	{#if isModelLoading}
		<div class="canvas_center">
			<Loader />
		</div>
	{/if}
	{#if !isModelRendered && !isModelLoading}
		<div class="canvas_center flex">
			<Button on:click={triggerFileInput}>Select a STEP File</Button>
		</div>
	{/if}
	{#if fileName && isModelRendered}
		<div class="file_name_container">
			<span class="file_name">{fileName}</span>
		</div>
	{/if}
</div>

<style lang="postcss">
	.tool_container {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
		padding: var(--gap_smallest);
		gap: var(--gap_smallest);
		width: 100%;
		background-color: var(--sheet_color);
		height: var(--nav_height);
	}

	.canvas_container {
		height: calc(100vh - var(--nav_height) - var(--nav_height));
		width: 100%;
		position: relative;
		background-color: var(--grey_6);
		overflow: hidden;
	}

	.canvas_center {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.flex {
		display: flex;
		flex-direction: column;
	}

	.file_name_container {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		justify-content: center;
		width: 100%;
		background-color: var(--backdrop);
		padding: var(--gap_xsmall);
	}

	.file_name {
		color: var(--orange);
		font-size: 1rem;
		display: inline-block;
		max-width: 800px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.hidden {
		display: none;
	}
</style>
