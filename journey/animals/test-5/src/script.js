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
  particleSize: 0.1,
  keyCodes: {
    '37': 'left',
    '38': 'up',
    '39':'right',
    '40':'down'
  },
  heldKeys: []
}

const speed = 0.05

scene.background = new THREE.Color(params.background)

// Fog
const fog = new THREE.Fog(params.background, 1, 10)
// scene.fog = fog


/**
 * Texture Loader
*/
const textureLoader = new THREE.TextureLoader()


/**
 * Sizes
*/
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
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
 * Raycaster
*/
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX / sizes.width * 2 - 1
  mouse.y = - (e.clientY / sizes.height) * 2 + 1
})

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





// --------------------
// Particles
// --------------------
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
  const particleTexture = textureLoader.load('/textures/particles/2.png')
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
  gltf.scene.position.x = 6
  params.model = gltf.scene
  scene.add(gltf.scene)
  mixer = new THREE.AnimationMixer(gltf.scene)
  params.mixer = mixer;

  gltfLoader.load('/models/Omabuarts/animals/animations/inkfish_animations.glb',
  (anim) => {
    params.animations = anim.animations;
    loadActions()
    idle()
  }
  )
})

// --------------------
// Squid Animations
// --------------------

const loadActions = () => {
  const action1 = params.mixer.clipAction(params.animations[8])
  action1.setDuration(1.5)
  const action2 = params.mixer.clipAction(params.animations[16])
  action2.setDuration(1.5)
}

const swim = () => {
  // console.log(params.mixer._actions[0]._clip.name);
  console.log(params.mixer);
  params.mixer._actions.find(a => a._clip.name == 'Idle_A').stop()
  params.mixer._actions.find(a => a._clip.name == 'Swim').play()
  // console.log(params.mixer.existingAction('Idle_A'));
  // params.mixer.existingAction('Swim').play()
}
const idle = () => {
  params.mixer._actions.find(a => a._clip.name == 'Swim').stop()
  params.mixer._actions.find(a => a._clip.name == 'Idle_A').play()
  // console.log(params.mixer._actions[1]._clip.name);
  // console.log('idling');
  // console.log(params.mixer.existingAction('Idle A'));

  // params.mixer.existingAction('Swim').stop()
  // params.mixer.existingAction('Idle A').play()
}

const doOnceThenIdle = (newAction) => {

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




// --------------------
// Plants
// --------------------

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

// // console.log('check out other anemone/rocks(?)');
// loadPlants('Seaweed_A_01_LOD2', 5, 0.2, 30)
// loadPlants('Seaweed_A_02_LOD2', 5, 0.2, 30)
// loadPlants('Seaweed_A_03_LOD2', 5, 0.2, 30)
// loadPlants('Coral_D_03_LOD3', 1, 0.2, 50)
// loadPlants('Coral_C_03_LOD3', 1, 0.6, 50)
// loadPlants('Coral_B_03_LOD2', 1, 0.3, 50)
// loadPlants('Coral_A_03_LOD2', 1, 0.5, 50)
// loadPlants('Rock_A_01_LOD3', 20, 0.1, 30)
// // loadPlants('Sponge_A_02_LOD0', 1, 0.1, 5)
// // loadPlants('Sponge_A_03_LOD0', 1, 0.1, 5)
// // loadPlants('Sponge_B_01_LOD0', 6, 0.1, 20)
// // loadPlants('Sponge_B_02_LOD0', 6, 0.1, 20)
// loadPlants('Sponge_B_03_LOD2', 6, 0.1, 20) // the coolest
// loadPlants('Starfish_01_LOD3', 10, 0.1, 20)




/**
 * Portfolio Items
*/

const circleGeometry = new THREE.CircleGeometry( 1, 32 );
const torusGeometry = new THREE.TorusGeometry( 1, 0.05, 10, 100 );
const torusMaterial = new THREE.MeshStandardMaterial( { color: '#ff7f50' } );
const portfolioItems = []

const addPortfolioItem = (image, name, url, position, rotation, alpha = false) => {
  const circleMaterial = new THREE.MeshStandardMaterial();
  let texture = textureLoader.load(image);
  circleMaterial.map = texture
  if (alpha) {
    circleMaterial.alphaMap = textureLoader.load('alpha.png')
    circleMaterial.transparent = true;
  }
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
  group.rotation.y = rotation
  portfolioItems.push(group)
}

function onClick() {
  // Check for intersections when the mouse is clicked
  const intersects = raycaster.intersectObjects(portfolioItems, true);

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

addPortfolioItem('Moss.jpeg', 'moss', 'https://www.mossradio.live/users/sign_in', [0, 1, 5], 0)
addPortfolioItem('api.jpeg', 'api', 'https://www.mossradio.live/users/sign_in', [-5, 1, 0], (Math.PI * 0.5))
addPortfolioItem('pomodoro.png', 'widgets', 'https://www.mossradio.live/users/sign_in', [5, 1, 0], (Math.PI * 0.5), true)
addPortfolioItem('pomodoro.png', 'info', 'https://www.mossradio.live/users/sign_in', [0, 1, -5], 0)
console.log(portfolioItems);
portfolioItems.forEach(i => scene.add(i))
document.addEventListener('click', onClick);



// testing area
// testing area
// testing area
// testing area
// testing area
const infoHash = {
  'moss': 'This is Moss Radio',
  'api': 'This is my API',
  'widgets': 'These are some widgets',
  'info': 'This is a clock',
}
const info = document.getElementById('info')
const showInfo = (item) => {
  const text = infoHash[item.object.userData.name]
  info.innerText = text
  info.classList.add('show-info')
}
const hideInfo = (item) => {
  info.classList.remove('show-info')
}


document.onkeydown = checkKey;
document.onkeyup = ((e) => {
  if (params.keyCodes[e.keyCode]) {
    idle()
    console.log(params.heldKeys);
    let i = params.heldKeys.indexOf(params.keyCodes[e.keyCode])
    params.heldKeys.splice(i, 1)
  }
})

let illegalKeys = [
  '3739',
  '3937',
  '3840',
  '4038'
]


function checkKey(e) {
    if (e.repeat) { return }
    e = e || window.event;
    swim()

    //Double movement directions
    if (illegalKeys.includes(`${params.heldKeys[0]}${e.keyCode}`)) {
      console.log('illegal keypress');
      return
    }

    if (params.keyCodes[e.keyCode]) {
      params.heldKeys.push(params.keyCodes[e.keyCode])
    }

}


// testing area
// testing area
// testing area
// testing area
// testing area
/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(8, 2, 0)
camera.lookAt(0, 2, 0)
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.target.set(0, 1.5, 0)
// controls.enableDamping = true

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
let currentIntersect = null
let movementValue = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    if (params.heldKeys.length == 2) {
      switch (params.heldKeys.join('')) {
        case 'upleft':
        case 'leftup':
          params.model.position.z += speed
          camera.position.z += speed
          params.model.position.x -= speed
          camera.position.x -= speed
          params.model.rotation.y = Math.PI * 1.75
          console.log('upleft/leftup');
          break;
        case 'upright':
        case 'rightup':
          params.model.position.z -= speed
          camera.position.z -= speed
          params.model.position.x -= speed
          camera.position.x -= speed
          params.model.rotation.y = Math.PI * 1.25
          console.log('upright');
          break;
        case 'downleft':
        case 'leftdown':
          params.model.position.z += speed
          camera.position.z += speed
          params.model.position.x += speed
          camera.position.x += speed
          params.model.rotation.y = Math.PI * 0.25
          console.log('downleft');
          break;
        case 'downright':
        case 'rightdown':
          params.model.position.z -= speed
          camera.position.z -= speed
          params.model.position.x += speed
          camera.position.x += speed
          params.model.rotation.y = Math.PI * 0.75
          console.log('downright');
          break;
        default:
          break;
      }
    }

    if (params.heldKeys.length == 1) {
      // if (params.key == 'left') {
      //   params.model.rotation.y = - movementValue
      // } else if (params.key == 'right') {
      //   movementValue -= 0.01
      //   params.model.rotation.y = Math.PI - movementValue
      // }
      // camera.position.z = Math.sin(movementValue) * 8
      // camera.position.x = Math.cos(movementValue) * 8
      // params.model.position.z = Math.sin(movementValue) * 6
      // params.model.position.x = Math.cos(movementValue) * 6
      switch (params.heldKeys[0]) {
        case 'left':
          params.model.position.z += speed
          camera.position.z += speed
          params.model.rotation.y = 0
          break;
        case 'up':
          params.model.position.x -= speed
          camera.position.x -= speed
          params.model.rotation.y = Math.PI * 1.5
          break;
        case 'right':
          params.model.position.z -= speed
          camera.position.z -= speed
          params.model.rotation.y = Math.PI
          break;
        case 'down':
          params.model.position.x += speed
        camera.position.x += speed
        params.model.rotation.y = Math.PI * 0.5
          break;
      }

      let p = params.model.position
      camera.lookAt(p.x, 2, p.z)
    }



    // // Update controls
    // controls.update()

    // Raycaster
    raycaster.setFromCamera(mouse, camera)
    let currentIntersect = null
    const intersects = raycaster.intersectObjects(portfolioItems, true)

    if (intersects.length) {
      document.body.classList.add('pointer-cursor');
      showInfo(intersects[0])
    } else {
      document.body.classList.remove('pointer-cursor');
      hideInfo()
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
