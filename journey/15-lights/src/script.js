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

const hemisphereLight = new THREE.HemisphereLight(0x00ffff, 0xff0000, 1)
// Minimal cost
scene.add(hemisphereLight)
gui.add(hemisphereLight, 'intensity', 0, 1)

const pointLight = new THREE.PointLight(0xffffff, 0.8, 0)
pointLight.position.y = 22
pointLight.position.z = 2
// scene.add(pointLight)
gui.add(pointLight, 'intensity', 0, 50).name('P-light Intensity')
gui.add(pointLight.position, 'x', -50, 50).name('P-light X')
gui.add(pointLight.position, 'y', -50, 50).name('P-light Y')
gui.add(pointLight.position, 'z', -50, 50).name('P-light Z')

const plHelper = new THREE.PointLightHelper(pointLight)
scene.add(plHelper)


// Only works with MeshStandard or MeshPhysical:
const rectLight = new THREE.RectAreaLight('red', 3, 10, 10)
rectLight.position.set(-1.5, 1.5, 1.5)
rectLight.lookAt(new THREE.Vector3())
scene.add(rectLight)
console.log(rectLight);
gui.add(rectLight, 'intensity', 0, 20).name('Rect Intensity')
gui.add(rectLight.color, 'r', 0, 10, 0.001).name('Rect R')
gui.add(rectLight.color, 'g', 0, 10, 0.001).name('Rect G')
gui.add(rectLight.color, 'b', 0, 10, 0.001).name('Rect B')
gui.add(rectLight.position, 'x', -50, 50).name('Rect X')
gui.add(rectLight.position, 'y', -50, 50).name('Rect Y')
gui.add(rectLight.position, 'z', -50, 50).name('Rect Z')

// RectAreaLight has a high performance cost

const spotLight = new THREE.SpotLight(0xffff00, 2, 10, Math.PI * 0.1, 0.25, 1)
spotLight.position.set(0, 2, 3)
// scene.add(spotLight)
// If you want to move the spotlight then you need to add spotlight.target to the scene, and move that rather than moving spotlight
// Spotlight has a high performance cost

// Helpers:
const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight)

// scene.add(hemisphereLightHelper)

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
sphere.position.y = 2
sphere.position.x = - 1.5

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.75, 0.75),
    material
)
cube.position.y = 2


const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 32, 64),
    material
)
torus.position.y = 2
torus.position.x = 1.5

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 17

scene.add(sphere, cube, torus, plane)

// 100 cubes
let cubes = []
for (let i = 0; i < 100; i ++) {
  const scale = Math.random() * 5
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(scale, scale, scale),
    material
  )
  cubes.push(cube)
  cube.position.x = (Math.random() - 0.5) * 30
  cube.position.y = (Math.random() - 0.5) * 30
  cube.position.z = (Math.random() - 0.5) * 30

  cube.rotation.x = (Math.random() * 2 * Math.PI)
  cube.rotation.y = (Math.random() * 2 * Math.PI)

  scene.add(cube)
}

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
controls.target = cube.position

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

    cubes.forEach ((cube, index) =>  {
      cube.rotation.x = (elapsedTime * (0.005 * index))
      cube.rotation.y = (elapsedTime * (0.005 * index))
    })

    rectLight.lookAt(0, 0, 0)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
