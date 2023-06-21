import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Axes Helper
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

// GLTF
const gltfLoader = new GLTFLoader()

let mixer = null

let params = {
  color: '#0042ad',
  background: '#0593ff',
  particleCount: 600,
  particleSize: 0.1
}

scene.background = new THREE.Color(params.background)

// Fog
const fog = new THREE.Fog(params.background, 1, 10)
// scene.fog = fog


/**
 * Textures
*/
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/2.png')





// Particles

const generateParticles = () => {

  const vertices = new Float32Array(params.particleCount * 3)
  const geometry = new THREE.BufferGeometry()
  const material = new THREE.PointsMaterial({
    size: params.particleSize,
    sizeAttenuation: true,
    // depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: '#ffffff'
  })
  material.map = particleTexture
  material.transparent = true
  material.alphaMap = particleTexture

  const points = new THREE.Points(geometry, material)
  // console.log(points);

  for (let i = 0; i < params.count; i++) {
    const i3 = i * 3
    vertices[i3 + 0] = (Math.random() * 20) - 10
    vertices[i3 + 1] = (Math.random() * 20) - 10
    vertices[i3 + 2] = (Math.random() * 20) - 10

  }

  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(vertices, 3)
  )

  scene.add(points)
}
generateParticles()





// --------------------
// Import Squid Model
// --------------------

gltfLoader.load('/models/Omabuarts/animals/inkfish.glb', (gltf) => {
  gltf.scene.children[0].children[0].castShadow = true;
  gltf.scene.position.y = 1
  params.model = gltf.scene
  scene.add(gltf.scene)
  mixer = new THREE.AnimationMixer(gltf.scene)
  params.mixer = mixer;

  gltfLoader.load('/models/Omabuarts/animals/animations/inkfish_animations.glb',
  (anim) => {
    params.animations = anim.animations;
    walk()
  }
  )
})

// --------------------
// Squid Animations
// --------------------

const walk = () => {
  const action = params.mixer.clipAction(params.animations[16])
  action.setDuration(1.5)
  action.play()
}

const doOnceThenWalk = (newAction) => {

  const action = params.mixer.clipAction(newAction)
  action.setLoop(THREE.LoopRepeat, 2)
  action.setDuration(0.5)

  // console.log(params.mixer);
  // params.number = (params.animations.indexOf(newAction) + 1)

  params.mixer._actions[0].stop()
  action.play()

  params.mixer.addEventListener( 'finished', function( e	) {
    // console.log("Action finished. Uncaching...");
    params.mixer.uncacheClip(newAction)
    params.mixer._actions[0].play()
    // console.log(params.mixer);
  } )
}




/**
 * Plants
 */

const plantsDirectory = '/models/Omabuarts/models/nature/3d/OBJ/'
const mtlLoader = new MTLLoader()
const objLoader = new OBJLoader()

const loadPlants = (path, number, scale, area) => {

  mtlLoader.load( `${plantsDirectory}${path}.mtl`, function (materials) {
    materials.preload();

    objLoader.setMaterials(materials).load(`${plantsDirectory}${path}.obj`, function (object) {

      object.traverse( function ( child ) {
        if ( child.isMesh ) {
          child.castShadow = true;
          child.receiveShadow = true
        }
      } );

      object.scale.set(scale, scale, scale)
      scene.add(object);

      for(let i = 1; i < number; i++) {
        let clone = object.clone()
        clone.position.z = Math.random() * area - (area / 2)
        clone.position.x = Math.random() * area - (area / 2)
        scene.add(clone)
      }
    });
  });
}

// console.log('check out other anemone/rocks(?)');
// loadPlants('Seaweed_A_01_LOD3', 5, 0.2, 30)
// loadPlants('Seaweed_A_02_LOD3', 5, 0.2, 30)
// loadPlants('Seaweed_A_03_LOD3', 5, 0.2, 30)
// loadPlants('Coral_D_03_LOD3', 1, 0.2, 50)
// loadPlants('Coral_C_03_LOD3', 1, 0.6, 50)
// loadPlants('Coral_B_03_LOD3', 1, 0.3, 50)
// loadPlants('Coral_A_03_LOD3', 1, 0.5, 50)
// loadPlants('Rock_A_01_LOD3', 20, 0.1, 30)
// // loadPlants('Sponge_A_02_LOD0', 1, 0.1, 5)
// // loadPlants('Sponge_A_03_LOD0', 1, 0.1, 5)
// // loadPlants('Sponge_B_01_LOD0', 6, 0.1, 20)
// // loadPlants('Sponge_B_02_LOD0', 6, 0.1, 20)
// loadPlants('Sponge_B_03_LOD3', 6, 0.1, 20) // the coolest
// loadPlants('Starfish_01_LOD3', 10, 0.1, 20)




/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({
        color: params.color,
        metalness: 0,
        roughness: 0.5
    })
)
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)


/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
// directionalLight.shadow.camera.left = - 7
// directionalLight.shadow.camera.top = 7
// directionalLight.shadow.camera.right = 7
// directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

const dhelper = new THREE.DirectionalLightHelper(directionalLight)
// scene.add(dhelper)

const pointLight = new THREE.PointLight('#ffffff', 8, 3)
pointLight.position.y = 2
// scene.add(pointLight)

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
camera.position.set(5, 2, 5)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 1.5, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    // alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Shadows

renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

floor.receiveShadow = true
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 25
directionalLight.shadow.mapSize.set(1024, 1024)

pointLight.castShadow = true
pointLight.shadow.mapSize.width = 256
pointLight.shadow.mapSize.height = 256
pointLight.shadow.camera.far = 7

// console.log(directionalLight);

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


    if (params.model) {
      params.model.position.z = Math.sin(elapsedTime * 0.1) * 6
      params.model.position.x = Math.cos(elapsedTime * 0.1) * 6

      camera.position.z = Math.sin((elapsedTime + 1) * 0.1)  * 8
      camera.position.x = Math.cos((elapsedTime + 1) * 0.1) * 8
      params.model.rotation.y = elapsedTime * -0.1
    }



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


// -----------------------------------------
// -----------------------------------------
// -----------------------------------------
// -----------------------------------------
// -----------------------------------------
// -----------------------------------------
// -----------------------------------------

const actions = {
  3: "Jump",
  5: "Roll"
}

const triggerAction = (actionName) => {
  const newAction = params.animations.find((a) => a.name == actionName)
  doOnceThenWalk(newAction)
}

const messageContainer = document.getElementById('text')
const messages = [
  "Oh! \nIt's you...",
  "How are you?",
  "I am a squid",
  "Woooooo",
  "I do not really exist",
  "I am merely a construct of Finn's consciousness",
  "*guuuuuuuurrrrp*"
]

params.messageNumber = 0

const update = () => {
  messageContainer.innerText = ""
  const actionName = actions[params.messageNumber]
  console.log(actionName);
  if (actionName) triggerAction(actionName)
  console.log('typed should split by newline character');
  var typed = new Typed(messageContainer, {
    strings: [messages[params.messageNumber]],
    typeSpeed: 50,
  });
}

document.getElementById('next').addEventListener('click', () => {
  params.messageNumber += 1;
  update()
  // // messageContainer.classList.add('animate__fadeOut')
  // setTimeout(() => {
  //   messageContainer.innerText = messages[params.message]
  //   // messageContainer.classList.remove('animate__fadeOut')
  //   messageContainer.classList.add('animate__fadeIn')
  // }, 0);
})
document.getElementById('previous').addEventListener('click', () => {
  params.messageNumber -= 1;
  update()
})

window.onload = () => { messageContainer.innerText = messages[0] }

tick()
