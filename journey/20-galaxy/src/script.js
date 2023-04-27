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

// Galaxy
const parameters = {
  count: 100000,
  size: 0.01,
  radius: 5,
  branches: 3
}

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {
  // Destroy old galaxy
  if (points !== null) {
    geometry.dispose()
    material.dispose()
    scene.remove(points)
  }
  console.log('generate galaxy');

  const vertices = new Float32Array(parameters.count * 3)
  geometry = new THREE.BufferGeometry()
  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
  points = new THREE.Points(geometry, material)

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3
    const radius = Math.random() * parameters.radius
    // The angles of a circle are measured in radians
    // 2piRadians will always equal a full circle in radians (see wikipedia for radians)
    // The circle is divided into the number of branches. For each i value, you will get a radian.
    // i.e if branches is 3, then you will get radians equalling 1/3, 1/6 and one whole circle
    const radian = (i % parameters.branches) / parameters.branches * Math.PI * 2

    vertices[i3 + 0] = radius
    vertices[i3 + 1] = 0
    vertices[i3 + 2] = 0
  }
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(vertices, 3)
    )

    scene.add(points)
    console.log(geometry.attributes.position);
}

generateGalaxy()

gui.add(parameters, 'count').min(100).max(1000000).step(100).name('Star count').onFinishChange(generateGalaxy)
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).name('Star size').onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(0.001).max(20).step(0.001).name('Galaxy Radius').onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).name('Galaxy Branches').onFinishChange(generateGalaxy)

// /**
//  * Test cube
//  */
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial()
// )
// scene.add(cube)

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
camera.position.x = 3
camera.position.y = 3
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