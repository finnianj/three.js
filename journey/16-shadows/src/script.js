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
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.position.set(2, 2, - 1)
gui.add(directionalLight, 'intensity').min(0).max(1).step(0.001)
gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001)
directionalLight.castShadow = true;
gui.add(directionalLight.position, 'y', 0, 5)
directionalLight.shadow.mapSize.width = 1024
directionalLight.shadow.mapSize.height = 1024
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 6
directionalLight.shadow.camera.top = 2
directionalLight.shadow.camera.right = 2
directionalLight.shadow.camera.bottom = - 2
directionalLight.shadow.camera.left = - 2
// directionalLight.shadow.radius = 10
const dlHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(dlHelper)
scene.add(directionalLight)
// console.log(directionalLight.shadow);

// Spot light
const spotLight = new THREE.SpotLight(0x0000ff, 2, 10, Math.PI * 0.3)

spotLight.castShadow = true

spotLight.position.set(0, 2, 2)
scene.add(spotLight)
scene.add(spotLight.target)
spotLight.shadow.camera.fov = 30

const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera)
// scene.add(spotLightCameraHelper)

const rectLight = new THREE.RectAreaLight(0x00ffff, 3, 2, 2)
rectLight.position.z = 2
// scene.add(rectLight)

const pointLight = new THREE.PointLight(0xffffff, 0.3)
pointLight.shadow.mapSize.width = 1024
pointLight.shadow.mapSize.height = 1024

pointLight.shadow.camera.near = 0.1
pointLight.shadow.camera.far = 5

pointLight.castShadow = true

pointLight.position.set(- 1, 1, 0)
scene.add(pointLight)

const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
// scene.add(pointLightCameraHelper)

/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.7
gui.add(material, 'metalness').min(0).max(1).step(0.001)
gui.add(material, 'roughness').min(0).max(1).step(0.001)

/**
 * Objects
 */
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)
sphere.castShadow = true
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.5
plane.receiveShadow = true;

// gui.add(sphere.position, 'x', 0, 5)
// gui.add(sphere.position, 'y', 0, 5)
// gui.add(sphere.position, 'z', 0, 5)

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.5, 0.5),
  material
)
cube1.position.x = 1
cube1.castShadow = true

const cube2 = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.5, 0.5),
  material
)
cube2.castShadow = true
cube2.position.x = -1

const cube3 = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.5, 0.5),
  material
)
cube3.castShadow = true
cube3.position.z = 1
const cube4 = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.5, 0.5),
  material
)
cube4.castShadow = true
cube4.position.z = -1



// scene.add(cube2, cube1, cube3, cube4)

scene.add(sphere, plane)

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
controls.target = sphere.position

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

console.log(cube1
  );
/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    let scaler = elapsedTime

    // cube1.position.y = Math.sin(elapsedTime)
    // // cube1.scale.set(scaler, scaler, scaler)
    // cube2.position.y = Math.sin(elapsedTime) * -1

    // cube1.position.x = Math.sin(elapsedTime + 1)
    // cube2.position.x = Math.sin(elapsedTime + 2)
    // cube3.position.x = Math.sin(elapsedTime + 3)
    // cube4.position.x = Math.sin(elapsedTime + 4)

    // cube1.position.z = Math.cos(elapsedTime + 1)
    // cube2.position.z = Math.cos(elapsedTime + 2)
    // cube3.position.z = Math.cos(elapsedTime + 3)
    // cube4.position.z = Math.cos(elapsedTime + 4)

    // cube1.rotation.x = elapsedTime
    // cube2.rotation.x = elapsedTime - 0.2
    // cube3.rotation.x = elapsedTime - 0.4
    // cube4.rotation.x = elapsedTime - 0.6



    // sphere.position.x = Math.sin(elapsedTime)
    // sphere.position.z = Math.cos(elapsedTime)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
