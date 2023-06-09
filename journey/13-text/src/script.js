import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import * as dat from 'lil-gui'
import gsap from 'gsap'

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
const matcapBlueTexture = textureLoader.load('/textures/matcaps/3.png')
const matcapGreenTexture = textureLoader.load('/textures/matcaps/blue.png')

/**
 * Fonts
 */
const fontLoader = new FontLoader()
// Loading the font requires a callback function
fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
  console.log(font);
  const textGeometry = new TextGeometry(
    'Wyvern Art Fund',
    {
      // if the key and value have the same name in js, you can just write it once:
      font,
      size: 0.5,
      height: 0.2,
      curveSegments: 5,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 4
    }
  )
  // // We need to center the geometry !Not the MESH, which by defualt is already centered!
  // // Complex way:
  // textGeometry.computeBoundingBox()
  // textGeometry.translate(
  //   - (textGeometry.boundingBox.max.x - 0.02) * 0.5,
  //   - (textGeometry.boundingBox.max.y - 0.02) * 0.5,
  //   - (textGeometry.boundingBox.max.z - 0.03) * 0.5
  //   )
  //   textGeometry.computeBoundingBox()
  //   console.log(textGeometry.boundingBox);

  // Simple way:
  textGeometry.center()

  const textMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapGreenTexture})

  const text = new THREE.Mesh(textGeometry, textMaterial)
  scene.add(text)
  gsap.to(text.rotation, { duration: 10, y: text.rotation.y + Math.PI * 2})


  console.time('donuts')

  const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45);
  const donutMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapBlueTexture })

  for (let i = 0; i < 100; i ++) {
    const donut = new THREE.Mesh(donutGeometry, donutMaterial)

    donut.position.x = (Math.random() - 0.5) * 10
    donut.position.y = (Math.random() - 0.5) * 10
    donut.position.z = (Math.random() - 0.5) * 10

    donut.rotation.x = Math.random() * Math.PI
    donut.rotation.y = Math.random() * Math.PI

    const scale = Math.random()
    donut.scale.x = scale
    donut.scale.y = scale
    donut.scale.z = scale
    scene.add(donut)
  }

  console.timeEnd('donuts')
})


/**
 * Axis Helper
 */
// const axesHelper = new THREE.AxesHelper()
// scene.add(axesHelper)

/**
 * Object
 */
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial()
)

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

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
