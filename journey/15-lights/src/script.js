import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)
// Minimal cost
gui.add(ambientLight, 'intensity', 0, 1).name('Ambient light intensity')

const directionalLight = new THREE.DirectionalLight(0xffff00, 0.5)
directionalLight.position.z = 2
// scene.add(directionalLight)

// gui.add(directionalLight.position, 'x', -5, 5).name('D-light X')
// gui.add(directionalLight.position, 'y', -5, 5).name('D-light Y')
// gui.add(directionalLight.position, 'z', -5, 5).name('D-light Z')

const hemisphereLight = new THREE.HemisphereLight(0x0000ff, 0xff0000, 1)
// Minimal cost
scene.add(hemisphereLight)

const pointLight = new THREE.PointLight(0xff9000, 0.8, 7)
pointLight.position.y = 2
pointLight.position.z = 2
// scene.add(pointLight)
// gui.add(pointLight.position, 'x', -5, 5).name('P-light X')
// gui.add(pointLight.position, 'y', -5, 5).name('P-light Y')
// gui.add(pointLight.position, 'z', -5, 5).name('P-light Z')

// Only works with MeshStandard or MeshPhysical:
const rectLight = new THREE.RectAreaLight(0x4e00fff, 3, 3, 1)
rectLight.position.set(-1.5, 1.5, 1.5)
rectLight.lookAt(new THREE.Vector3())
// scene.add(rectLight)
// RectAreaLight has a high performance cost

const spotLight = new THREE.SpotLight(0xffff00, 2, 10, Math.PI * 0.1, 0.25, 1)
spotLight.position.set(0, 2, 3)
// scene.add(spotLight)
// If you want to move the spotlight then you need to add spotlight.target to the scene, and move that rather than moving spotlight
// Spotlight has a high performance cost

// Helpers:
const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight)
scene.add(hemisphereLightHelper)

/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.4

// Objects
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)
sphere.position.x = - 1.5

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.75, 0.75),
    material
)

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 32, 64),
    material
)
torus.position.x = 1.5

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.65

scene.add(sphere, cube, torus, plane)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    sphere.rotation.y = 0.1 * elapsedTime
    cube.rotation.y = 0.1 * elapsedTime
    torus.rotation.y = 0.1 * elapsedTime

    sphere.rotation.x = 0.15 * elapsedTime
    cube.rotation.x = 0.15 * elapsedTime
    torus.rotation.x = 0.15 * elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
