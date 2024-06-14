<script lang="ts">
	import * as THREE from 'three'
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
	import { onMount } from 'svelte'
	import {
		cleanupMaterial,
		loadStepUsingWorker,
		calculateSurfaceArea,
		calculateVolume
	} from '../../utilities/step-helpers'
	import Button from '$elements/Button.svelte'
	import Loader from './Loader.svelte'
	import IconButton from '$elements/IconButton.svelte'

	// STEP Colors
	const edgeColor = 0x333333
	const lightingColor = 0xffffff
	const modeColors = { light: 0xd9e7fc, dark: 0x232323 }

	let container: HTMLElement
	let isModelLoading = false
	let debouncedResize: (...args: any[]) => void
	let currentBackgroundColor = modeColors.dark

	let surfaceArea = ''
	let volume = ''
	let boundingBoxVolume = ''
	let boundingBoxDimensions = ''
	let isUIVisible = true

	// Three.js vars
	let model: THREE.Object3D<THREE.Object3DEventMap> | null
	let scene: THREE.Scene
	let camera: THREE.OrthographicCamera
	let renderer: THREE.WebGLRenderer
	let controls: OrbitControls
	let viewSize: number

	// 3D Model Vars
	let src = ''
	let modelFileInput: HTMLInputElement
	let modelFileName = ''
	let isModelRendered = false
	const fileTypes = '.stp, .step'

	function toggleInfoVisibility() {
		isUIVisible = !isUIVisible
	}

	function adjustCamera(boundingBox: THREE.Box3) {
		const size = boundingBox.getSize(new THREE.Vector3())
		viewSize = Math.max(size.x, size.y, size.z)

		// Set orthographic camera frustum
		const aspectRatio = container.clientWidth / container.clientHeight
		camera.left = (-aspectRatio * viewSize) / 2
		camera.right = (aspectRatio * viewSize) / 2
		camera.top = viewSize / 2
		camera.bottom = -viewSize / 2

		camera.near = -10000
		camera.far = 10000

		const center = boundingBox.getCenter(new THREE.Vector3())
		camera.position.set(center.x, center.y, center.z + viewSize)
		camera.lookAt(center)
		camera.updateProjectionMatrix() // called for camera changes to take effect
	}

	// Resize the renderer when the window is resized
	function onWindowResize() {
		if (camera && renderer && container) {
			const aspect = container.clientWidth / container.clientHeight

			camera.left = (-aspect * viewSize) / 2
			camera.right = (aspect * viewSize) / 2
			camera.top = viewSize / 2
			camera.bottom = -viewSize / 2

			camera.updateProjectionMatrix()
			renderer.setSize(container.clientWidth, container.clientHeight)
		}
	}

	/**
	 * TODOs:
	 * - light/dark mode
	 * - camera reset
	 * - orthographic/perspective camera switch
	 * - zoom in/out
	 * - mesh selection
	 */

	// function toggleLightDarkMode() {
	// 	currentBackgroundColor =
	// 		currentBackgroundColor === modeColors.light ? modeColors.dark : modeColors.light

	// 	if (renderer) {
	// 		renderer.setClearColor(currentBackgroundColor)
	// 		renderer.render(scene, camera) // re-render scene
	// 	}
	// }

	// function resetCamera() {
	// 	if (!model || !camera) return
	// 	const boundingBox = new THREE.Box3().setFromObject(model)
	// 	adjustCamera(boundingBox)
	// 	controls?.target.copy(boundingBox.getCenter(new THREE.Vector3())) // Center the model
	// 	controls?.update()
	// }

	function debounce(func: (...args: any[]) => void, timeout = 300) {
		let timer: number | undefined
		return (...args: any[]) => {
			clearTimeout(timer)
			timer = setTimeout(() => {
				func.apply(this, args)
			}, timeout)
		}
	}

	async function initScene() {
		if (!src || !container) {
			return
		}

		try {
			isModelLoading = true

			scene = new THREE.Scene()
			camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000)
			renderer = new THREE.WebGLRenderer({ antialias: true })
			renderer.setSize(container.clientWidth, container.clientHeight)
			container.appendChild(renderer.domElement)
			renderer.setClearColor(currentBackgroundColor)

			const response = await fetch(src)
			if (!response.ok) throw new Error('Failed to fetch the file')

			const arrayBuffer = await response.arrayBuffer()
			model = await loadStepUsingWorker(arrayBuffer)

			if (model) {
				isModelLoading = false
				scene.add(model)
				const boundingBox = new THREE.Box3().setFromObject(model)
				model.position.sub(boundingBox.getCenter(new THREE.Vector3()))

				model.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						const edges = new THREE.EdgesGeometry(child.geometry)
						const edgeLine = new THREE.LineSegments(
							edges,
							new THREE.LineBasicMaterial({ color: edgeColor, linewidth: 1 })
						)
						child.add(edgeLine)
					}
				})

				adjustCamera(boundingBox)

				// Calculate and display surface area and volume
				surfaceArea = calculateSurfaceArea(model).toFixed(3)
				volume = calculateVolume(model).toFixed(3)

				// Calculate bounding box volume and dimensions
				const boxSize = boundingBox.getSize(new THREE.Vector3())
				const boxVolume = boxSize.x * boxSize.y * boxSize.z
				boundingBoxVolume = boxVolume.toFixed(3)
				boundingBoxDimensions = `${boxSize.x.toFixed(3)}mm × ${boxSize.y.toFixed(3)}mm × ${boxSize.z.toFixed(3)}mm`

				const ambientLight = new THREE.AmbientLight(lightingColor)
				const directionalLight = new THREE.DirectionalLight(lightingColor, 1.0)
				directionalLight.position.set(5, 5, 5)
				scene.add(ambientLight, directionalLight)

				controls = new OrbitControls(camera, renderer.domElement)
				;(function animate() {
					requestAnimationFrame(animate)
					controls.update()
					renderer.render(scene, camera)
				})()
			}

			debouncedResize = debounce(onWindowResize, 1800) // Resize after 1.8s
			window.addEventListener('resize', debouncedResize)
			onWindowResize()
			isModelLoading = false
			isModelRendered = true
			// toast.success('Model Loaded', {
			// 	description: 'STEP model has been loaded successfully.'
			// })
		} catch (error) {
			console.error('Error initializing Three.js scene: ', error)
			isModelLoading = false
			// toast.error('Error Loading Model', {
			// 	description: error as string
			// })
		}
	}

	const handleModelFileUpload = (event: Event) => {
		const input = event.target as HTMLInputElement
		if (input.files && input.files[0]) {
			const file = input.files[0]

			modelFileName = file.name
			src = URL.createObjectURL(file)
			input.value = ''
		}
	}

	function removeModel() {
		if (model && scene) {
			scene.remove(model)
			model.traverse((object) => {
				// Cleanup materials and geometries
				if (object instanceof THREE.Mesh) {
					object.geometry.dispose()
					if (Array.isArray(object.material)) {
						object.material.forEach(cleanupMaterial)
					} else if (object.material instanceof THREE.Material) {
						cleanupMaterial(object.material)
					}
				}
			})
			container.removeChild(renderer.domElement)

			model = null
			modelFileName = ''
			isUIVisible = true
		}
		if (controls) {
			controls.dispose()
		}
		if (renderer) {
			renderer.dispose()
		}
		volume = ''
		surfaceArea = ''
		boundingBoxVolume = ''
		boundingBoxDimensions = ''
		isModelRendered = false
	}

	onMount(() => {
		if (container) {
			initScene()
		}

		return () => {
			window.removeEventListener('resize', debouncedResize)
			removeModel()
		}
	})

	function numberWithCommas(x: string | number) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	}

	$: if (src && container) {
		initScene()
	}
</script>

<div class="canvas_container" bind:this={container}>
	{#if isModelLoading}
		<div class="canvas_center flex">
			<Loader />
		</div>
	{/if}
	{#if !isModelRendered && !isModelLoading}
		<div class="canvas_center flex">
			<Button
				on:click={() => {
					modelFileInput.click()
				}}
				outline
			>
				Import STEP
			</Button>
		</div>
	{:else}
		<div class="control_buttons">
			<IconButton
				name={isUIVisible ? 'visibility' : 'visibility_off'}
				on:click={toggleInfoVisibility}
				tooltipText={isUIVisible ? 'Hide info' : 'Show info'}
			/>
			<Button outline on:click={removeModel}>Clear</Button>
		</div>
	{/if}
	{#if modelFileName && isUIVisible}
		<p class="model_file_name">{modelFileName}</p>
	{/if}
	{#if volume && surfaceArea && boundingBoxVolume && boundingBoxDimensions && isUIVisible}
		<div class="info_box">
			<div class="info_content">
				<p class="highlight">Surface Area:</p>
				{numberWithCommas(surfaceArea)} mm²
				<p class="highlight">Actual Part Volume:</p>
				{numberWithCommas(volume)} mm³
				<p class="highlight">Bounding Box Volume:</p>
				{boundingBoxDimensions} = {numberWithCommas(boundingBoxVolume)} mm³
			</div>
		</div>
	{/if}

	<input
		type="file"
		accept={fileTypes}
		on:change={handleModelFileUpload}
		bind:this={modelFileInput}
		hidden
	/>
</div>

<style>
	.canvas_container {
		height: 85vh;
		width: 100%;
		position: relative;
		margin: 0.5rem 0;
	}

	.canvas_center {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.flex {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		width: 100%;
	}

	.control_buttons {
		position: absolute;
		top: 1rem;
		right: 1rem;
		display: flex;
		align-items: center;
		gap: var(--gap_smallest);
	}

	.model_file_name {
		position: absolute;
		top: 1rem;
		left: 1rem;
		background-color: var(--transparent_backdrop);
		padding: 0.5rem;
		margin: 0.5rem;
		border-radius: 0.5rem;
		color: var(--primary_color);
	}

	.info_box {
		position: absolute;
		bottom: 1rem;
		left: 1rem;
	}

	.info_content {
		background-color: var(--transparent_backdrop);
		padding: 0.5rem;
		margin: 0.5rem;
		border-radius: 0.5rem;
		color: var(--text_color);
	}

	.highlight {
		color: var(--primary_color);
	}
</style>
