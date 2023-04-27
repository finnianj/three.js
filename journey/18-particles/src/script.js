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
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particlesTexture = textureLoader.load('/textures/particles/9.png')



// Particles
const particlesGeometry = new THREE.SphereGeometry(1, 32, 32)

// Particles material
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.1,
  sizeAttenuation: true,
})

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
// scene.add(particles)

// Custom
const count = 5000
const customGeometry = new THREE.BufferGeometry()
const vertices = new Float32Array(count * 3)

for (let i = 0; i < count * 3; i++) {
  vertices[i] = (Math.random() - 0.5) * 100
}

customGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(vertices, 3)
)
const customParticles = new THREE.Points(customGeometry, particlesMaterial)
particlesMaterial.color = new THREE.Color('#ff88cc')
particlesMaterial.map = particlesTexture

scene.add(customParticles)




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
camera.position.z = 3
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

    // Update controls
    controls.update()


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
