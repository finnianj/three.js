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

//raycaster
const raycaster = new THREE.Raycaster()

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

// GLTF
const gltfLoader = new GLTFLoader()


let mixer = null

let params = {
  number: 0,
  previousClip: 0,
  duration: 0.5,
  loop: 0,
  color: '#0042ad',
  background: '#0593ff',
  catalogue: {
    "None": 0
  }
}

scene.background = new THREE.Color(params.background)

// Fog
const fog = new THREE.Fog(params.background, 1, 10)
// scene.fog = fog


// const walk = () => {
//   const action = params.mixer.clipAction(params.animations[16])
//   action.play()
// }



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

// Portfolio items

const textureLoader = new THREE.TextureLoader();
const circleGeometry = new THREE.CircleGeometry( 1, 32 );
const circleMaterial = new THREE.MeshStandardMaterial();
const torusGeometry = new THREE.TorusGeometry( 1, 0.05, 10, 100 );
const torusMaterial = new THREE.MeshStandardMaterial( { color: '#ff7f50' } );
const portfolioItems = []

const addPortfolioItem = (image, name, url, position) => {
  const texture = textureLoader.load(image);
  circleMaterial.map = texture
  console.log(circleMaterial);
  const circle = new THREE.Mesh( circleGeometry, circleMaterial );
  circle.position.y = 1.5
  circle.userData = { name: name, url: url };
  const circle2 = circle.clone()
  circle2.rotation.y = Math.PI
  const torus = new THREE.Mesh( torusGeometry, torusMaterial );
  torus.position.y = 1.5;
  torus.position.z = 0.001;

  const group = new THREE.Group();
  group.add(circle, circle2, torus)
  group.position.set(position[0], position[1], position[2])
  scene.add(group)
  portfolioItems.push(group)

}
addPortfolioItem('Moss.jpeg', 'moss', 'https://www.mossradio.live/users/sign_in', [0, 1, 0])

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

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0


// Item click redirect function

function onClick() {
  // Check for intersections when the mouse is clicked
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {

    // An object was clicked
    const clickedObject = intersects[0].object;
    console.log(clickedObject);

    // Check if the clickedObject has a specific userData property
    if (clickedObject.userData.url) {
      // Redirect to the specified URL
      window.open(clickedObject.userData.url, '_blank');
    }
  }
}

document.addEventListener('click', onClick);

let currentIntersect = null

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // objectsToAnimate.forEach((item) => {
    //   item.rotation.x = Math.sin(elapsedTime) / 4
    // })
    // camera.lookAt(new THREE.Vector3(0, 4, 0))

    // Update controls
    controls.update()


    raycaster.setFromCamera(mouse, camera)
    let currentIntersect = null

    const intersects = raycaster.intersectObject(portfolioItems[0])

      if (intersects.length) {
        document.body.classList.add('pointer-cursor');
      } else {
        document.body.classList.remove('pointer-cursor');
      }



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
  "Hello there",
  "Nice to meet you",
  "What is your name?",
  "That's a nice name.",
  "I do not have a name...",
  "I am merely a construct of Finn's consciousness",
  "Do I exist? Who can say..."
]

params.messageNumber = 0

const update = () => {
  messageContainer.innerText = ""
  const actionName = actions[params.messageNumber]
  console.log(actionName);
  if (actionName) triggerAction(actionName)
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


tick()
