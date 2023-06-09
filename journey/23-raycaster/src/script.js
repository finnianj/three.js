import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

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
 * Objects
 */
const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object1.position.x = - 2

const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)

const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object3.position.x = 2

scene.add(object1, object2, object3)

// Raycaster

const raycaster = new THREE.Raycaster()
// const rayOrigin = new THREE.Vector3(-3, 0, 0)
// const rayDirection = new THREE.Vector3(10, 0, 0)
// rayDirection.normalize()
// raycaster.set(rayOrigin, rayDirection)

// const intersect1 = raycaster.intersectObject(object1)
// const intersectMany = raycaster.intersectObjects([object1, object2, object3])

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Mouse

const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX / sizes.width * 2 - 1
  mouse.y = - (e.clientY / sizes.height) * 2 + 1
})

// window.addEventListener('click', () => {
//   if (currentIntersect) {
//     console.log('sphere click');
//     if (currentIntersect.object == object1) {
//       console.log('clicked on object 1');
//     } else if (currentIntersect.object == object2) {
//       console.log('clicked on object 2');
//     } else {
//       console.log('clicked on object 3');
//     }
//   }
// })

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

// GLTF
let model = null
const loader = new GLTFLoader()
loader.load('./models/Duck/glTF-Binary/Duck.glb', (gltf) => {
  gltf.scene.position.y = - 1.2
  model = gltf.scene
  scene.add(model)
})

// Lights
const ambientLight = new THREE.AmbientLight('#ffffff', 0.3)
scene.add(ambientLight)
const directionalLight = new THREE.DirectionalLight('#ffffff', 0.7)
directionalLight.position.set(1, 2, 3)
scene.add(directionalLight)


/**
 * Animate
 */
const clock = new THREE.Clock()

let currentIntersect = null

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // // Cast a ray
    // const rayOrigin = new THREE.Vector3(-3, 0, 0)
    // const rayDirection = new THREE.Vector3(1, 0, 0)
    // rayDirection.normalize()
    // raycaster.set(rayOrigin, rayDirection)

    raycaster.setFromCamera(mouse, camera)

    // const objects = [object1, object2, object3]

    let currentIntersect = null
    // console.log(intersects.length);

    // for(const object of objects) {
      //   object.material.color.set('#ff0000')
      // }
      // for(const intersect of intersects) {
        //   intersect.object.material.color.set('#0000ff')
        // }
    if (model) {
      const intersects = raycaster.intersectObject(model)

      if (intersects.length) {
        model.scale.set(1.2, 1.2, 1.2)
      } else {
        model.scale.set(1, 1, 1)
      }
    }

    // Move objects
    object1.position.y = Math.sin(elapsedTime * 0.5) * 1.5
    object2.position.y = Math.sin(elapsedTime * 0.7) * 1.5
    object3.position.y = Math.sin(elapsedTime * 0.2) * 1.5

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
