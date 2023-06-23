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
  color: '#e1bf92',
  background: '#0593ff',
  particleCount: 600,
  particleSize: 0.1,
  keyCodes: {
    // In tick function:
    // 1 is used for positive movement along axis, -1 for negative
    '37': ['z', 1, 0],
    '38': ['x', -1, Math.PI * 1.5],
    '39': ['z', -1, Math.PI],
    '40': ['x', 1, Math.PI * 0.5]
  },
  heldKeys: [],
  modelPosition: {},
  limits: {
    x: [-35, 12],
    z: [-20, 20]
  },
  diagonalRotations: {
    'z1x1': Math.PI * 0.25,
    'x1z1': Math.PI * 0.25,
    'z-1x1': Math.PI * 0.75,
    'x1z-1': Math.PI * 0.75,
    'z-1x-1': Math.PI * 1.25,
    'x-1z-1': Math.PI * 1.25,
    'x-1z1': Math.PI * 1.75,
    'z1x-1': Math.PI * 1.75,
  },
  messageEmpty: false,
  outOfBounds: false,
  floorLength: 100,
  floorWidth: 70,
  offset: 4
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
  new THREE.PlaneGeometry(params.floorLength, params.floorWidth),
  new THREE.MeshStandardMaterial({
      color: params.color,
      metalness: 0,
      roughness: 0.5
  })
)
floor.rotation.x = - Math.PI * 0.5
floor.position.x = -15
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

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight)
scene.add(directionalLightHelper)



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

  for (let i = 0; i < params.particleCount; i++) {
    const i3 = i * 3
    vertices[i3 + 0] = (Math.random() * 45) - 35
    vertices[i3 + 1] = (Math.random() * 5)
    vertices[i3 + 2] = (Math.random() * 40) - 20

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
  gltf.scene.position.x = 8
  params.model = gltf.scene
  scene.add(gltf.scene)
  controls.target.set(8, 2, 0)
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
  params.idle = false;
  clearTimeout(params.idleTimeout)
  params.mixer._actions.find(a => a._clip.name == 'Idle_A').stop()
  params.mixer._actions.find(a => a._clip.name == 'Swim').play()
}
const idle = () => {
  params.idle = true;
  params.mixer._actions.find(a => a._clip.name == 'Swim').stop()
  params.mixer._actions.find(a => a._clip.name == 'Idle_A').play()
  params.idleTimeout = setTimeout(() => {
    if (params.idle == true) {
      controls.maxAzimuthAngle = 'Infinity'
      controls.minAzimuthAngle = 'Infinity'
      controls.autoRotate = true
    }
  }, 15000);
  // console.log(params.mixer._actions[1]._clip.name);
  // console.log('idling');
  // console.log(params.mixer.existingAction('Idle A'));

  // params.mixer.existingAction('Swim').stop()
  // params.mixer.existingAction('Idle A').play()
}

// const doOnceThenIdle = (newAction) => {

//   const action = params.mixer.clipAction(newAction)
//   action.setLoop(THREE.LoopRepeat, 2)
//   action.setDuration(0.5)

//   // console.log(params.mixer);
//   // params.number = (params.animations.indexOf(newAction) + 1)

//   params.mixer._actions[0].stop()
//   action.play()

//   params.mixer.addEventListener( 'finished', function( e	) {
//     // console.log("Action finished. Uncaching...");
//     params.mixer.uncacheClip(newAction)
//     params.mixer._actions[0].play()
//     // console.log(params.mixer);
//   } )
// }




// // --------------------
// // Plants
// // --------------------

const plantsDirectory = '/models/Omabuarts/models/nature/3d/OBJ/'
const mtlLoader = new MTLLoader()
const objLoader = new OBJLoader()

const loadPlants = (path, number, maxScaleDifference, minScale, specifiedPosition = undefined) => {

  mtlLoader.load( `${plantsDirectory}${path}.mtl`, function (materials) {
    materials.preload();

    objLoader.setMaterials(materials).load(`${plantsDirectory}${path}.obj`, function (object) {

      let zArea= params.floorWidth;
      let xArea = params.floorLength;

      object.traverse( function ( child ) {
        if ( child.isMesh ) {
          child.castShadow = true;
          child.receiveShadow = true
        }
      } );


      // object.position.z = specifiedPosition ? specifiedPosition : Math.random() * zArea - (zArea / 2)

      // object.scale.set(0.2, 0.2, 0.2)
      // scene.add(object);


      // console.log("scale : " + scale);
      // console.log(specifiedPosition);

      for(let i = 1; i < number; i++) {

        let clone = object.clone()
        // let scale = maxScale
        let scale = (Math.random() * maxScaleDifference + minScale)
        clone.scale.set(scale, scale, scale)
        if (specifiedPosition == 'curve') {
          clone.position.z = Math.sin(i * 0.5) * 6
          clone.position.x = -i
          console.log(Math.sin(number / i));
        } else if (specifiedPosition) {
          clone.position.z = specifiedPosition
        } else {
          clone.position.z = Math.random() * zArea - (zArea / 2)
        }

        // clone.position.x = Math.random() * xArea - (xArea / 1.5)

        // // scale = Math.random() * scale + 0.3
        scene.add(clone)
      }
    });
  });
}

// path, number, max scale, min scale, specific position(z axis)
// loadPlants('Coral_C_03_LOD3', 10, 0.5, 0.2)
// // console.log('check out other anemone/rocks(?)');
loadPlants('Seaweed_A_01_LOD2', 50, 0.05, 0.2, "curve")


// loadPlants('Seaweed_A_02_LOD2', 5, 0.2, 30)
// loadPlants('Seaweed_A_03_LOD2', 5, 0.2, 30)
// loadPlants('Coral_D_03_LOD3', 100, 0.2)
// loadPlants('Coral_C_03_LOD3', 10, 1.5, params.floorWidth * 0.35)
// loadPlants('Coral_C_03_LOD3', 10, 1.5, -params.floorWidth * 0.35)
// loadPlants('Coral_C_03_LOD3', 10, 3, 30)
// loadPlants('Coral_C_03_LOD3', 10, 3.5, 30)

// loadPlants('Coral_A_03_LOD2', 10, 0.1)
// loadPlants('Coral_C_03_LOD3', 3, 1.6)
// loadPlants('Coral_B_03_LOD2', 5, 0.3)
// loadPlants('Coral_A_03_LOD2', 5, 1.5)
// loadPlants('Coral_A_03_LOD2', 5, 1.5)
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

const addPortfolioItem = (image, name, info, url, position, alpha = false) => {
  const circleMaterial = new THREE.MeshStandardMaterial();
  let texture = textureLoader.load(image);
  circleMaterial.map = texture
  if (alpha) {
    circleMaterial.alphaMap = textureLoader.load('alpha.png')
    circleMaterial.transparent = true;
  }
  const circle = new THREE.Mesh( circleGeometry, circleMaterial );
  circle.position.y = 1.5
  circle.userData = { name: name, url: url, info: info };
  const circle2 = circle.clone()
  circle2.rotation.y = Math.PI
  const torus = new THREE.Mesh( torusGeometry, torusMaterial );
  torus.position.y = 1.5;
  torus.position.z = 0.001;

  const group = new THREE.Group();
  group.add(circle, circle2, torus)
  group.position.set(position[0], position[1], position[2])
  group.rotation.y = Math.PI * 0.5
  portfolioItems.push(group)
}

// function onClick() {
//   // Check for intersections when the mouse is clicked
//   const intersects = raycaster.intersectObjects(portfolioItems, true);

//   if (intersects.length > 0) {

//     // An object was clicked
//     const clickedObject = intersects[0].object;
//     console.log(clickedObject);

//     // Check if the clickedObject has a specific userData property
//     if (clickedObject.userData.url) {
//       // Redirect to the specified URL
//       window.open(clickedObject.userData.url, '_blank');
//     }
//   }
// }

addPortfolioItem('Moss.jpeg', 'moss', '', 'https://www.mossradio.live/users/sign_in', [1, 1, 4])
addPortfolioItem('api.jpeg', 'api', 'My API!.. Built with Node.js and MongoDB.. Features several microservices, including a community music playlist', 'https://www.mossradio.live/users/sign_in', [-6, 1, -4])
addPortfolioItem('pomodoro.png', 'widgets', 'info about widgets', 'https://www.mossradio.live/users/sign_in', [-13, 1, 4], true)
addPortfolioItem('pomodoro.png', 'info', 'info about D3', 'https://www.mossradio.live/users/sign_in', [-20, 1, -4])
addPortfolioItem('pomodoro.png', 'info', 'info for certs skills about', 'https://www.mossradio.live/users/sign_in', [-27, 1, 4])
addPortfolioItem('pomodoro.png', 'info', 'info', 'https://www.mossradio.live/users/sign_in', [-35, 1, 4])
// console.log(portfolioItems);
portfolioItems.forEach(i => scene.add(i))
// document.addEventListener('click', onClick);



// testing area
// testing area
// testing area
// testing area
// testing area

// const info = document.getElementById('info')
// const showInfo = (item) => {
//   const text = infoHash[item.object.userData.name]
//   info.innerText = text
//   info.classList.add('show-info')
// }
// const hideInfo = (item) => {
//   info.classList.remove('show-info')
// }


document.onkeydown = checkKey;
document.onkeyup = ((e) => {
  if (params.keyCodes[e.keyCode]) {
    let i = params.heldKeys.indexOf(params.keyCodes[e.keyCode])
    params.heldKeys.splice(i, 1)
    if (params.heldKeys.length == 0) idle()
  }
})

let illegalKeys = [
  '3739',
  '3937',
  '3840',
  '4038'
]


function checkKey(e) {
  if (controls.autoRotate) setControls()
  if (e.repeat) { return }
  e = e || window.event;
  swim()

  let key = e.keyCode

    //Double movement directions
    if (illegalKeys.includes(`${params.heldKeys[0]}${key}`)) {
      return
    }

    // check it's an arrow
    if (params.keyCodes[key]) {
      params.heldKeys.push(params.keyCodes[key])
      // controls.reset()
    }

}

const validateMove = (axis, posOrNeg) => {
  if (posOrNeg == -1) {
    if (camera.position[axis] > params.limits[axis][0]) {
      return true
    } else {
      outOfBounds()
      return false
    }
  } else if (posOrNeg == 1) {
    if (camera.position[axis] < params.limits[axis][1]) {
      return true
    } else {
      outOfBounds()
      return false
    }
  }
}

const outOfBounds = () => {
  if (params.outOfBounds == false) {
    params.outOfBounds = true;
    infoContainer.innerHTML = '<h2 style="text-align: center;">Out of bounds</h2>'
    infoContainer.classList.add('out-of-bounds')
    console.log('Out of bounds');
    setTimeout(() => {
      params.outOfBounds = false;
      infoContainer.classList.remove('out-of-bounds')
    }, 1000);
  }
}


const rotate = (targetRotation) => {
    let currentRotation = params.model.rotation.y
    let rotationDiff = (targetRotation - currentRotation) ;
    rotationDiff = ((rotationDiff + Math.PI) % (2 * Math.PI)) - Math.PI;
    if (rotationDiff > Math.PI) {
      rotationDiff -= 2 * Math.PI;
    } else if (rotationDiff < -Math.PI) {
      rotationDiff += 2 * Math.PI;
    }
    if (Math.abs(rotationDiff) > 0.1) {
      // Rotate the object by 0.1 in the appropriate direction
      const rotationIncrement = rotationDiff > 0 ? 0.1 : -0.1;
      params.model.rotation.y += rotationIncrement;
    }
}

const checkDistances = () => {
  portfolioItems.forEach((item)  => {
    if (params.model.position.distanceTo(item.position) < 2) {
      params.messageEmpty = false
      typeInfo(item)
      return
    }
  })
}

const typeInfo = (item) => {
  const info = infoHash[item.children[0].userData.name]
  infoContainer.innerHTML = info;
  infoContainer.classList.add('show')
  setTimeout(() => {
    infoContainer.classList.remove('show')
    params.messageEmpty = true;
    setTimeout(() => {
      if (params.messageEmpty == true) randomMessage()
    }, 5000);
  }, 5000);
}

const randomMessage = () => {
  messageContainer.innerText = ""
  messageContainer.classList.add('show')
  params.messageEmpty = false;
  let typed = new Typed(messageContainer, {
    strings: [messages[Math.floor(Math.random() * messages.length)]],
    typeSpeed: 50,
    startDelay: 0,
    showCursor: false,
    onComplete: () => {
      setTimeout(() => {
        messageContainer.classList.remove('show')
        params.messageEmpty = true
      }, 2000)
      setTimeout(() => {
        if (params.messageEmpty == true) {
          randomMessage()
        }
      }, 10000);
    }
  });

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
camera.position.set(10, 3, 0)
camera.lookAt(0, 2, 0)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false
// controls.autoRotate = true;
controls.enableZoom = false
controls.maxPolarAngle = 2.3

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

// floor.receiveShadow = true
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 25
directionalLight.shadow.mapSize.set(1024, 1024)


/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0
let currentIntersect = null

const tick = () => {

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    if (params.heldKeys.length == 2) {
      let axis1 = params.heldKeys[0][0]
      let axis2 = params.heldKeys[1][0]

      let axisDir1 = params.heldKeys[0][1]
      let axisDir2 = params.heldKeys[1][1]

      if (validateMove(axis1, axisDir1) && validateMove(axis2, axisDir2)) {

        params.model.position[axis1] += speed * axisDir1
        camera.position[axis1] += speed * axisDir1
        params.model.position[axis2] += speed * axisDir2
        camera.position[axis2] += speed * axisDir2

        let i = `${axis1}${axisDir1}${axis2}${axisDir2}`
        rotate(params.diagonalRotations[i])

        let p = params.model.position || {x: 0, y: 2, z: 0}
        controls.target.set(p.x, p.y + 1, p.z)
      }

      let p = params.model.position
      controls.target.set(p.x, p.y + 1, p.z)
    }

    if (params.heldKeys.length == 1) {
      let axis = params.heldKeys[0][0]
      let axisDir = params.heldKeys[0][1]

      if (validateMove(axis, axisDir)) {

        params.model.position[axis] += speed * axisDir
        camera.position[axis] += speed * axisDir
        rotate(params.heldKeys[0][2])

        let p = params.model.position || {x: 0, y: 2, z: 0}
        controls.target.set(p.x, p.y + 1, p.z)
      }

    }

    if (params.messageEmpty) {
      checkDistances()
    }



    // Update controls

    controls.update()

    // // Raycaster
    // raycaster.setFromCamera(mouse, camera)
    // let currentIntersect = null
    // const intersects = raycaster.intersectObjects(portfolioItems, true)

    // if (intersects.length) {
    //   document.body.classList.add('pointer-cursor');
    //   showInfo(intersects[0])
    // } else {
    //   document.body.classList.remove('pointer-cursor');
    //   hideInfo()
    // }

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


const messages = [
  "Nice weather we're having, no?",
  "*guuuuuuuurrrrppp*",
  "🎵 Under the seaaaa....🎵",
  "I've heard there is a whole world above the ocean...",
  "I enjoy working for Finn! He tells me about the world beyond.",
  "Tell me, what is water? Finn always mentions it...",
  "Recently I've become very fond of juggling. Have you tried it?",
  "You know, it's so great that you're here.",
  "My friend showed me a multicolored shell today. Isn't that nice?",
  "🎵 A B C D E F G... 🎵 ",
  "Ha! You're feet are covered in sand!"
]

const infoHash = {
  'moss': '<h2 class="highlight">Moss Radio</h2> <p>Ruby on Rails, PostgreSQL, Stimulus.js.</p><h3 class="highlight">Features:</h3><p> Live chat, live music stream, and beautifully smooth front end.</p>',
  'api': '<h2 class="highlight">My API</h2> <p>Node.js, MongoDB, Express.js</p><h3 class="highlight">Features:</h3><p> 4 different API Microservices, including a community playlist - submit your favourite song!</p>',
  'widgets': '<h2 class="highlight">Widgets</h2><h3 class="highlight">Features:</h3><p>React, Typescript, JQuery</p><h3 class="highlight">Features:</h3><p>Some simple widgets I made while exploring front-end libraries</p>',
  'info': '<h2 class="highlight">Certifications, Skills, About.</h2><p>Here you can see all the certifications I have completed, as well as a full list of coding skills and a short bio.</p>',
}

const triggerAction = (actionName) => {
  const newAction = params.animations.find((a) => a.name == actionName)
  doOnceThenWalk(newAction)
}

const messageContainer = document.getElementById('text')
const infoContainer = document.getElementById('info')


window.onload = () => {
  canvas.classList.add('show')

  let typed = new Typed(messageContainer, {
    strings: ["Oh, it's you!", "I'm glad you made it", " Let's have a look around, shall we?", " Use the arrow keys to move", ""],
    typeSpeed: 50,
    startDelay: 1000,
    backDelay: 1000,
    fadeOut: true,
    fadeOutDelay: 1000,
    showCursor: false,
    onStringTyped: () => {
      if (params.model.position.x != 8 || params.model.position.z != 0) {
        messageContainer.classList.remove('show')
        typed.stop()
        endTyped()
      }
    },
    preStringTyped: () => {
      if (params.model.position.x != 8 || params.model.position.z != 0) {
        messageContainer.classList.remove('show')
        typed.stop()
        endTyped()
      }
    },
    onComplete: () => {
      params.messageEmpty = true
      setControls()
      setTimeout(() => {
        if (params.messageEmpty == true) randomMessage()
      }, 8000);
    }
  });
}

const endTyped = () => {
  controls.autoRotate = false
  setControls()
  setTimeout(() => {
    messageContainer.innerText = ""
    params.messageEmpty = true
  }, 1000);
  setTimeout(() => {
    if (params.messageEmpty == true) randomMessage()
  }, 8000);
}

const setControls = () => {
  controls.autoRotate = false;
  canvas.classList.remove('show')
  let p = params.model.position
  setTimeout(() => {
    controls.target.set(p.x, p.y + 1, p.z)
    camera.position.set(p.x + 2, 3, p.z)
    controls.maxAzimuthAngle = 1.8
    controls.minAzimuthAngle = 1.2
    canvas.classList.add('show')
  }, 1000);

}

tick()
