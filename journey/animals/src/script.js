import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const objectsToAnimate = []

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// GLTF
const gltfLoader = new GLTFLoader()
// gltfLoader.load('/models/Duck/glTF/Duck.gltf',
//   (gltf) => {
//     console.log('success');
//     const duck = gltf.scene.children[0]
//     scene.add(duck)
//     objectsToAnimate.push(duck)
//   }
// )
// gltfLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf',
//   (gltf) => {
//     console.log('success');
//     const children = [...gltf.scene.children]
//     for (const item of children) {
//       console.log(item);
//       item.position.z = 2
//       item.rotation.y = Math.PI * 0.5
//       scene.add(item)
//       objectsToAnimate.push(item)
//     }
//   }
// )

let mixer = null

let params = {
  number: 0,
  previousClip: null
}

gltfLoader.load('/models/Omabuarts/models/sparrow.glb',
  (gltf) => {
    console.log('Model successfully loaded');
    console.log(gltf.scene);
    scene.add(gltf.scene)
    // objectsToAnimate.push(fox)
    mixer = new THREE.AnimationMixer(gltf.scene)
    params.mixer = mixer;

    gltfLoader.load('/models/Omabuarts/animations/sparrow_animations.glb',
    (anim) => {
        console.log(anim);
        console.log('Successfully loaded animation folder');
        params.animations = anim.animations;
        let catalogue = { None: 0 }
        for (let i = 0; i < anim.animations.length; i++) {
          catalogue[anim.animations[i].name] = i + 1;
        }
        console.log(catalogue);
        gui.add(params, 'number', catalogue).onFinishChange(playAction)
        // gui.add(params, 'number').min(0).max(params.animations.length - 1).step(1).onFinishChange(playAction)
      }
      )
  }
)

const playAction = () => {
  console.log(params.number);
  if (params.previousClip != null) {
    console.log('Uncaching previous clip from mixer...');
    params.mixer.stopAllAction()
    params.mixer.uncacheClip(params.animations[params.previousClip])
  }

  const action = params.mixer.clipAction(params.animations[params.number - 1])
  console.log('New clip animation assigned to mixer.');
  console.log(params.mixer);
  action.play()
  // Changing the value of params.previousClip so that it will delete the current animation on the next change
  params.previousClip = params.number - 1
}



/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

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
camera.position.set(2, 2, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // objectsToAnimate.forEach((item) => {
    //   item.rotation.x = Math.sin(elapsedTime) / 4
    // })

    // Update controls
    controls.update()

    // Update mixer
    if (mixer != null) {
      mixer.update(deltaTime)
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()