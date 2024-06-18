<script lang="ts">
	import * as THREE from 'three'
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
	import { onMount } from 'svelte'
	import {
		cleanupMaterial,
		loadStepUsingWorker,
		calculateSurfaceArea,
		calculateVolume
	} from '$utilities/step-helpers'
	import Button from '$elements/Button.svelte'
	import Loader from './Loader.svelte'
	import IconButton from '$elements/IconButton.svelte'
	import { fade } from 'svelte/transition'
	import { addToast } from '$lib/components/Toaster.svelte'

	const demoFile = './demo.stp'

	// STEP Colors
	const edgeColor = 0x333333
	const lightingColor = 0xffffff
	const modeColors = { light: 0xdcdcdc, dark: 0x232323 }

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
	let initialCameraState: { position: THREE.Vector3; zoom: number; target: THREE.Vector3 } | null

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

		initialCameraState = {
			position: camera.position.clone(),
			zoom: camera.zoom,
			target: center.clone()
		}
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

	function resetCamera() {
		if (!model || !camera || !initialCameraState) return
		camera.position.copy(initialCameraState.position)
		camera.zoom = initialCameraState.zoom
		camera.updateProjectionMatrix()
		if (controls) {
			controls.target.copy(initialCameraState.target)
			controls.update()
		}
	}

	function updateBackgroundColor() {
		const theme = document.documentElement.getAttribute('data-theme')
		currentBackgroundColor = theme === 'light' ? modeColors.light : modeColors.dark

		if (renderer) {
			renderer.setClearColor(currentBackgroundColor)
			renderer.render(scene, camera) // re-render scene
		}
	}
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
			updateBackgroundColor()

			const response = await fetch(src)
			if (!response.ok) throw new Error('Failed to fetch the file')

			const arrayBuffer = await response.arrayBuffer()
			model = await loadStepUsingWorker(arrayBuffer)

			if (model) {
				isModelLoading = false
				scene.add(model)
				const boundingBox = new THREE.Box3().setFromObject(model)

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
				controls.target.copy(boundingBox.getCenter(new THREE.Vector3()))
				controls.update()
				;(function animate() {
					requestAnimationFrame(animate)
					controls?.update()
					renderer.render(scene, camera)
				})()
			}

			debouncedResize = debounce(onWindowResize, 1800) // Resize after 1.8s
			window.addEventListener('resize', debouncedResize)
			onWindowResize()
			isModelLoading = false
			isModelRendered = true

			sendToast('Success', 'Model loaded successfully.', 'green')
		} catch (error) {
			console.error('Error initializing Three.js scene: ', error)
			isModelLoading = false
			sendToast('Error', (error as string) || 'Error initializing Three.js scene.', 'red')
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
		src = ''
		volume = ''
		surfaceArea = ''
		boundingBoxVolume = ''
		boundingBoxDimensions = ''
		isModelRendered = false
		sendToast('Success', 'Model removed successfully.', 'green')
	}

	onMount(() => {
		if (container) {
			initScene()
		}

		const observer = new MutationObserver(() => {
			updateBackgroundColor()
		})
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		})

		return () => {
			window.removeEventListener('resize', debouncedResize)

			// Traverse scene and clean up materials and geometries
			scene.traverse((object) => {
				if (object instanceof THREE.Mesh) {
					object.geometry.dispose()

					if (Array.isArray(object.material)) {
						object.material.forEach((material) => {
							if (material instanceof THREE.Material) {
								cleanupMaterial(material)
							}
						})
					} else if (object.material instanceof THREE.Material) {
						cleanupMaterial(object.material)
					}
				}
			})

			if (controls) {
				controls.dispose()
			}

			if (renderer) {
				renderer.dispose()
				if (container && renderer.domElement.parentNode === container) {
					container.removeChild(renderer.domElement)
				}
			}
		}
	})

	function numberWithCommas(x: string | number) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	}

	function sendToast(title: string, description: string, color: string) {
		addToast({
			data: {
				title,
				description,
				color
			}
		})
	}

	$: if (src && container) {
		initScene()
	}
</script>

<div class="canvas_container" bind:this={container}>
	{#if isModelLoading}
		<div class="canvas_center flex" transition:fade={{ duration: 300 }}>
			<Loader />
		</div>
	{/if}
	{#if !isModelRendered && !isModelLoading}
		<div class="canvas_center flex" transition:fade={{ duration: 300 }}>
			<Button
				on:click={() => {
					modelFileInput.click()
				}}
			>
				Import STEP
			</Button>
			<Button
				outline
				on:click={() => {
					src = demoFile
					modelFileName = 'Demo STEP Model'
				}}>Load Demo</Button
			>
		</div>
	{:else}
		<div class="control_buttons" transition:fade={{ duration: 300 }}>
			<IconButton
				name="restart_alt"
				on:click={resetCamera}
				tooltipText="Reset camera"
				disabled={!isModelRendered}
			/>
			<IconButton
				name={isUIVisible ? 'visibility' : 'visibility_off'}
				on:click={toggleInfoVisibility}
				tooltipText={isUIVisible ? 'Hide info' : 'Show info'}
				disabled={!isModelRendered}
			/>
			<IconButton
				name="cancel"
				accent={!model ? undefined : 'warning'}
				on:click={removeModel}
				tooltipText="Clear Model"
				disabled={!isModelRendered}
			/>
		</div>
	{/if}
	{#if modelFileName && isUIVisible}
		<div class="model_file_name" transition:fade={{ duration: 300 }}>
			<P as="span">
				{modelFileName}
			</P>
		</div>
	{/if}
	{#if volume && surfaceArea && boundingBoxVolume && boundingBoxDimensions && isUIVisible}
		<div class="info_box" transition:fade={{ duration: 300 }}>
			<div class="info_content">
				<div>
					<P style="margin: 0;" accent="primary">Surface Area:</P>
					<P as="span">
						{numberWithCommas(surfaceArea)} mm²
					</P>
				</div>

				<div>
					<P style="margin: 0;" accent="primary">Actual Part Volume:</P>
					<P as="span">
						{numberWithCommas(volume)} mm³
					</P>
				</div>

				<div>
					<P style="margin: 0;" accent="primary">Bounding Box Volume:</P>
					<P as="span">
						{boundingBoxDimensions} = {numberWithCommas(boundingBoxVolume)} mm³
					</P>
				</div>
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

<style lang="postcss">
	.canvas_container {
		height: 100%;
		width: 100%;
		position: relative;

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
			flex-direction: column;
			gap: var(--gap_small);
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
			background-color: var(--transparent_backdrop);
			padding: var(--gap_smallest);
			margin: var(--gap_smallest);
			border-radius: var(--border_radius);
		}

		.model_file_name {
			position: absolute;
			top: 1rem;
			left: 1rem;
			background-color: var(--transparent_backdrop);
			padding: var(--gap_smallest);
			margin: var(--gap_smallest);
			border-radius: var(--gap_smallest);
		}

		.info_box {
			position: absolute;
			bottom: 1rem;
			left: 1rem;
		}

		.info_content {
			background-color: var(--transparent_backdrop);
			padding: var(--gap_smallest);
			margin: var(--gap_smallest);
			border-radius: var(--border_radius);
			color: var(--text_color);
			display: flex;
			flex-direction: column;
			gap: var(--gap);
			justify-content: flex-start;
		}
	}
</style>
