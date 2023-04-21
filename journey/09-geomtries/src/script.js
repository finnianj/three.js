import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Creating my own Buffergeometry

const positions = new Float32Array([
  0, 0, 0,
  0, 1, 0,
  1, 0, 0
])

const positionsAttribute = new THREE.BufferAttribute(positions, 3)

const bufferGeometry = new THREE.BufferGeometry()
bufferGeometry.setAttribute('position', positionsAttribute)

// Creating 50 triangles with random values

const count = 100;
const positions2 = new Float32Array(count * 3 * 3)
for (let i = 0; i < count * 3 * 3 ; i++) {
  positions2[i] = (Math.random() - 0.5);
}
const positions2Attribute = new THREE.BufferAttribute(positions2, 3)
const buffer2Geometry = new THREE.BufferGeometry()
buffer2Geometry.setAttribute('position', positions2Attribute)

// Object
// const geometry = new THREE.BoxGeometry(1, 1, 1, 10, 10, 10)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
const mesh = new THREE.Mesh(bufferGeometry, material)
const mesh2 = new THREE.Mesh(buffer2Geometry, material)
scene.add(mesh)
scene.add(mesh2)

// Sizes
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

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Animate
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
