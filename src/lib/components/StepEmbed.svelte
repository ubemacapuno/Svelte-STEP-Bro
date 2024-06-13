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

	export let displayName = ''

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
			// toast.success('Model Removed', {
			// 	description: 'STEP model has been removed successfully.'
			// })
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

<div
	class="h-[80vh] w-full relative my-2"
	class:border-2={!isModelRendered}
	class:border-dashed={!isModelRendered}
	class:border-orange-400={!isModelRendered}
	bind:this={container}
>
	{#if isModelLoading}
		<div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
			<Loader />
		</div>
	{/if}
	{#if !isModelRendered && !isModelLoading}
		<div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
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
		<div class="absolute top-1 right-1">
			<Button outline on:click={removeModel}>Clear</Button>
		</div>
	{/if}
	{#if volume && surfaceArea && boundingBoxVolume && boundingBoxDimensions}
		<div class="absolute bottom-1 left-1">
			<div class="bg-black bg-opacity-80 p-2 m-2 rounded-lg text-white">
				<p class="text-orange-400">Surface Area:</p>
				{numberWithCommas(surfaceArea)} mm²
				<p class="text-orange-400">Actual Part Volume:</p>
				{numberWithCommas(volume)} mm³
				<p class="text-orange-400">Bounding Box Volume:</p>
				{boundingBoxDimensions} = {numberWithCommas(boundingBoxVolume)} mm³
			</div>
		</div>
	{/if}
	{#if displayName}
		<div class="absolute top-1/2 right-1/2 transform -translate-x-1/2 -translate-y-1/2 border-">
			<p>
				{displayName}
			</p>
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
