import * as THREE from 'three'

const cursor = {
  x:0,
  y:0
}

window.addEventListener('mousemove', (event) => {
  // cursor.x = event.clientX
  // cursor.y = event.clientY
  // we want to convert our values so that they have an amplitude of 1.
  // i.e lowest possible value is 0, highest is 1
  cursor.x = event.clientX / sizes.width - 0.5
  cursor.y = -(event.clientY / sizes.height - 0.5)
  // You can also add -0.5 if you want to more clearly define the values to the left/right/above/below of the center
})

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Sizes
const sizes = {
    width: 800,
    height: 600
}

// Scene
const scene = new THREE.Scene()

// Object
const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1, 5, 5, 5),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
)
scene.add(mesh)

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
// const aspectRatio = sizes.width / sizes.height
// If you use an orthographic camera, then the render will be squashed on the y axis, so you need to implement the aspect ratio.
// const camera = new THREE.OrthographicCamera(
//   -1 * aspectRatio,
//    1 * aspectRatio,
//   1, -1, 0.1, 100
//   )
// camera.position.x = 2
// camera.position.y = 2
camera.position.z = 3
camera.lookAt(mesh.position)
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)

// Animate
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    // mesh.rotation.y = elapsedTime;

    // Update camera
    // camera.position.x = cursor.x * 10
    // camera.position.y = cursor.y * 10
    camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3
    camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3
    camera.position.y = cursor.y * 3
    camera.lookAt(mesh.position)

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
