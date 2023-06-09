import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// GLTF
const gltfLoader = new GLTFLoader()

let mixer = null

let params = {
  color: '#e1bf92',
  background: '#0593ff',
  particleCount: 400,
  particleSize: 0.1,
  keyCodes: {
    // For reference in tick function:
    // 1 is used for positive movement along axis, -1 for negative. 3rd value is rotation
    'ArrowLeft': ['z', 1, 0],
    'ArrowUp': ['x', -1, Math.PI * 1.5],
    'ArrowRight': ['z', -1, Math.PI],
    'ArrowDown': ['x', 1, Math.PI * 0.5]
  },
  // Important -  the items in the held keys array determine the direction of travel
  heldKeys: [],
  modelPosition: {},
  limits: {
    x: [-45, 30],
    z: [-25, 25]
  },
  diagonalRotations: {
    // These rotational values are for when two keys are held simultaneously
    'z1x1': Math.PI * 0.25,
    'x1z1': Math.PI * 0.25,
    'z-1x1': Math.PI * 0.75,
    'x1z-1': Math.PI * 0.75,
    'z-1x-1': Math.PI * 1.25,
    'x-1z-1': Math.PI * 1.25,
    'x-1z1': Math.PI * 1.75,
    'z1x-1': Math.PI * 1.75,
  },
  speed: 0.05,
  messageEmpty: false,
  outOfBounds: false,
  floorLength: 110,
  floorWidth: 130,
  completed: 0,
  completedBanner: false, // Set to true once the banner has been shown
  idle: true,
  squashable: true,
  squashCount: 15,
  moonFound: false,
  angry: false,
}


scene.background = new THREE.Color(params.background)

// Fog
const fog = new THREE.Fog(params.background, 1, 10)
scene.fog = fog


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
const floorColorTexture = textureLoader.load('textures/dirt/sandy.jpg')
floorColorTexture.colorSpace = THREE.SRGBColorSpace
floorColorTexture.repeat.set(5, 5)
floorColorTexture.wrapS = THREE.RepeatWrapping
floorColorTexture.wrapT = THREE.RepeatWrapping

const floorNormalTexture = textureLoader.load('textures/dirt/normal.jpg')
floorNormalTexture.repeat.set(5, 5)
floorNormalTexture.wrapS = THREE.RepeatWrapping
floorNormalTexture.wrapT = THREE.RepeatWrapping

const floorGeometry = new THREE.PlaneGeometry(params.floorLength, params.floorWidth)
const floorMaterial = new THREE.MeshStandardMaterial({
    map: floorColorTexture,
    normalMap: floorNormalTexture
})
const floor = new THREE.Mesh(floorGeometry, floorMaterial)
floor.rotation.x = - Math.PI * 0.5
floor.position.z = 20
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.position.set(8, 8, 0)
scene.add(directionalLight)

// Audio
const audioPlayer = document.getElementById('music')
audioPlayer.volume = 0.3
const effectPlayer = document.getElementById('effect')
effectPlayer.volume = 0.2

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

  for (let i = 0; i < params.particleCount; i++) {
    const i3 = i * 3
    vertices[i3 + 0] = (Math.random() * 90) - 60
    vertices[i3 + 1] = (Math.random() * 5)
    vertices[i3 + 2] = (Math.random() * 60) - 30

  }
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(vertices, 3)
  )
  scene.add(points)
}


// --------------------
// Import Squid Model
// --------------------

const loadSquid = () => {

  gltfLoader.load('/animals/inkfish.glb', (gltf) => {
    gltf.scene.children[0].children[0].castShadow = true;
    gltf.scene.position.y = 1
    gltf.scene.position.x = 8
    params.model = gltf.scene
    scene.add(gltf.scene)
    directionalLight.target = gltf.scene
    controls.target.set(8, 2, 0)
    mixer = new THREE.AnimationMixer(gltf.scene)
    params.mixer = mixer;

    gltfLoader.load('animals/animations/Inkfish_Idle_A.glb',
    (anim) => {
      anim.animations[0].name = 'Idle_A'
      gltfLoader.load('animals/animations/Inkfish_Swim.glb',
      (anim2) => {
        anim2.animations[0].name = 'Swim'
        gltfLoader.load('animals/animations/Inkfish_Clicked.glb',
        (anim3) => {
          anim3.animations[0].name = 'Clicked'
          params.animations = [anim.animations[0], anim2.animations[0], anim3.animations[0] ]
          loadActions()
          idle()
        })
      })
    })
  })
}

// --------------------
// Squid Animations
// --------------------

const loadActions = () => {
  const action1 = params.mixer.clipAction(params.animations[0])
  action1.setDuration(1.5)
  const action2 = params.mixer.clipAction(params.animations[1])
  action2.setDuration(1.5)
  const action3 = params.mixer.clipAction(params.animations[2])
  action3.setDuration(0.5)
  action3.setLoop(THREE.LoopOnce)
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
  }, 20000);
}

const squash = () => {
  clearTimeout(params.idleTimeout)
  randomMessage(true)
  params.mixer.stopAllAction()
  params.mixer._actions.find(a => a._clip.name == 'Clicked').play()

  if (params.squashCount == 17) {
    angry()
    params.squashCount = -1
  }

  params.mixer.addEventListener( 'finished', function( e	) {
    params.mixer._actions.find(a => a._clip.name == 'Idle_A').play()
  } )
}


const angry = () => {
  params.angry = true;
  audioPlayer.pause()
  audioPlayer.children[0].src = '/sounds/angry.mp3'
  audioPlayer.load()
  audioPlayer.play()
  const red = new THREE.Color('#ff0000')
  fog.color = red
  scene.background = red
  params.model.scale.set(3,3,3)
  params.speed = 0.2
  params.limits = {
    x: [-45, 50],
    z: [-35, 60]
  }
  params.model.rotation.y = Math.PI * 0.5
  camera.position.x += 2
  params.messageEmpty = false
  setTimeout(() => {
    setControls()
    setTimeout(() => {
      const resetColor = new THREE.Color(params.background)
      fog.color = resetColor
      scene.background = resetColor
      params.model.scale.set(1,1,1)
      camera.position.x -= 2
      params.speed = 0.05
      params.limits = {
        x: [-45, 30],
        z: [-25, 25]
      }
      params.messageEmpty = true
      audioPlayer.pause()
      audioPlayer.children[0].src = '/sounds/ambient.mp3'
      audioPlayer.load()
      audioPlayer.play()
    }, 500);
  }, 10000);

}

// // --------------------
// // Plants
// // --------------------



const loadPlants = (path, number, maxScaleDifference, minScale, specifiedPosition = undefined) => {
  const mtlLoader = new MTLLoader()
  const objLoader = new OBJLoader()

  mtlLoader.load( `/environment/${path}.mtl`, function (materials) {
    materials.preload();

    objLoader.setMaterials(materials).load(`/environment/${path}.obj`, function (object) {
      let zArea = params.floorWidth;
      let xArea = params.floorLength;

      object.traverse( function ( child ) {
        if ( child.isMesh ) {
          child.castShadow = true;
          child.receiveShadow = true
        }
      } );

      for(let i = 1; i < number; i++) {

        let clone = object.clone()
        let scale = (Math.random() * maxScaleDifference + minScale)
        clone.scale.set(scale, scale, scale)

        if (specifiedPosition == 'curve') {
          clone.position.z = Math.sin(i * 0.5) * 6
          clone.position.x = -i
        } else if (specifiedPosition) {
          clone.position.z = specifiedPosition
          clone.position.x = Math.random() * 90 - 45
        } else {
          clone.position.z = Math.random() * 70 - 35
          clone.position.x = Math.random() * 90 - 45
          clone.rotation.y = Math.random() * 6
        }
        scene.add(clone)
      }
    });
  });
}


/**
 * Portfolio Items
*/

const circleGeometry = new THREE.CircleGeometry( 1, 32 );
const torusGeometry = new THREE.TorusGeometry( 1, 0.05, 10, 100 );
const portfolioItems = []

const addPortfolioItem = (image, name, url, position, alpha = false) => {
  const torusMaterial = new THREE.MeshStandardMaterial( { color: '#ff7f50' } );
  const circleMaterial = new THREE.MeshStandardMaterial();
  let texture = textureLoader.load(image);
  circleMaterial.map = texture
  if (alpha) {
    circleMaterial.alphaMap = textureLoader.load(`/images/${name}Alpha.png`)
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

function onClick() {
  const intersects = raycaster.intersectObjects(portfolioItems, true);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    if (clickedObject.userData.url) {
      window.open(clickedObject.userData.url, '_blank');
    }
  }
}

document.onkeydown = checkKey;
document.onkeyup = ((e) => {
  if (params.keyCodes[e.key]) {
    let i = params.heldKeys.indexOf(params.keyCodes[e.key])
    params.heldKeys.splice(i, 1)
    if (params.heldKeys.length == 0) idle()
  }
  if (e.key == ' ' && params.idle && params.squashable && params.messageEmpty) {
    squash()
  }
})

let illegalKeys = [
  'ArrowUpArrowDown',
  'ArrowDownArrowUp',
  'ArrowLeftArrowRight',
  'ArrowRightArrowLeft'
]


function checkKey(e) {
  if (e.repeat) { return }
  e = e || window.event;

  if (controls.autoRotate && e.key != ' ') {
    setControls()
  }

  let key = e.key

  if (illegalKeys.includes(`${params.heldKeys[0]}${key}`)) {
    return
  }

  if (params.keyCodes[key]) {
    swim()
    params.heldKeys.push(params.keyCodes[key])
    if (audioPlayer.paused) {
      audioPlayer.currentTime = 0;
      audioPlayer.play()
    }
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
      showInfo(item)
      return
    }
  })

}

const showInfo = (item) => {

  params.messageEmpty = false;

  if (item.children[2].material.color.g != 1) {
    // If the hoop is still yellow, then the hoop will turn green
    item.children[2].material.color = new THREE.Color('rgb(4, 255, 58)')
    params.completed += 1
    effectPlayer.currentTime = 0
    effectPlayer.play()
  }

  let name = item.children[0].userData.name

  if (["skills", "certifications", "about"].includes(name)) {
    showSidebar(name)
    return
  }

  const info = infoHash[name]
  infoContainer.innerHTML = info;
  infoContainer.classList.add('show')

  setTimeout(() => {
    infoContainer.classList.remove('show')
    setNewMessageTimeout()

  }, 1000);
}


const showSidebar = (name) => {
  const element =  document.getElementById(name)
  skillsAndCerts.classList.add('show')
  skillsAndCerts.classList.add('front')
  element.classList.remove('d-none')

  setTimeout(() => {
    skillsAndCerts.classList.remove('show')
    element.classList.add('d-none')
    skillsAndCerts.classList.remove('front')

    setNewMessageTimeout()
  }, 1000);
}

const setNewMessageTimeout = () => {
  clearTimeout(params.messageTimeout)
  params.messageEmpty = true;

  setTimeout(() => {
    if (params.messageEmpty && !params.completedBanner && params.completed >= 7) completed()
  }, 2000);

  params.messageTimeout = setTimeout(() => {
    if (params.messageEmpty) randomMessage()
  }, 8000);
}


const randomMessage = (squash = false) => {
  clearTimeout(params.messageTimeout)
  params.squashable = false
  if (squash) {
    params.squashCount += 1
  }
  messageContainer.innerText = ""
  messageContainer.classList.add('show')
  let message = squash ? ouch[params.squashCount] || "" : messages[Math.floor(Math.random() * messages.length)]

  let typed = new Typed(messageContainer, {
    strings: [message],
    typeSpeed: 50,
    startDelay: 0,
    showCursor: false,
    onComplete: () => {
      setTimeout(() => {
        messageContainer.classList.remove('show')
        params.squashable = true
      }, 2000)
      params.messageTimeout = setTimeout(() => {
        if (params.messageEmpty && params.squashable) {
          randomMessage()
        }
      }, 10000);
    }
  });

}

const completed = () => {
  clearTimeout(params.messageTimeout)
  params.messageEmpty = false;
  params.completedBanner = true;
  infoContainer.innerHTML = '<h2>Yazoo!</h2> <p>You visited all the hoops, congratulations! <p>Just one more thing left to find...</p></p>'
  infoContainer.classList.add('completed')
  setTimeout(() => {
    params.messageEmpty = true;
    infoContainer.classList.remove('completed')
  }, 5000);
}

const moonFound = () => {
  params.moonFound = true;
  skillsAndCerts.insertAdjacentHTML('afterend', '<div id="secret-message" class="front"></div>')
  let secretMessage = document.getElementById('secret-message')
  secretMessage.innerHTML = '🎉   🎉   🎉 <h3>You found the sunken moon!</h3> 🎉   🎉   🎉<br><p>Submit your name to the hall of fame:</p><br><form action="/winners" method="post"><input id="moon-input" type="text" name="name" placeholder="Your name..."/><br><input id="moon-input" type="text" name="comment" placeholder="Comment..."/><br><input type="submit" id="moon-submit" value="Submit" /></form>'
  setTimeout(() => {
    secretMessage.classList.add('show')
  }, 1000);
}

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 10)
camera.position.set(10, 3, 0)
camera.lookAt(0, 2, 0)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false
controls.autoRotate = true;
// controls.enableZoom = false
controls.maxPolarAngle = 2.3

const setControls = () => {
  controls.autoRotate = false;
  document.getElementById('license').classList.add('d-none')
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

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Shadows
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

directionalLight.shadow.camera.left = -9
directionalLight.shadow.camera.top = 9
directionalLight.shadow.camera.right = 5
directionalLight.shadow.camera.bottom = -12
directionalLight.shadow.camera.near = 5
directionalLight.shadow.camera.far = 8.3

floor.receiveShadow = true
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)

// moon
const loadMoon = () => {
  const moonTexture = new THREE.TextureLoader().load('images/moon.jpeg')
  const normalTexture = new THREE.TextureLoader().load('images/normal.jpeg')
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(3, 32, 32),
    new THREE.MeshStandardMaterial({
      map: moonTexture,
      normalMap: normalTexture
    })
  );
  moon.userData.name = "moon"
  moon.position.set(1, 3, 60)
  portfolioItems.push(moon)

  scene.add(moon)

  setTimeout(() => {
    canvas.classList.add('show')
    license.classList.remove('d-none')
    greet()
  }, 500);
}


/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

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

        params.model.position[axis1] += params.speed * axisDir1
        camera.position[axis1] += params.speed * axisDir1
        params.model.position[axis2] += params.speed * axisDir2
        camera.position[axis2] += params.speed * axisDir2
        directionalLight.position[axis1] += params.speed * axisDir1
        directionalLight.position[axis2] += params.speed * axisDir2


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

        params.model.position[axis] += params.speed * axisDir
        camera.position[axis] += params.speed * axisDir
        directionalLight.position[axis] += params.speed * axisDir
        rotate(params.heldKeys[0][2])

        let p = params.model.position || {x: 0, y: 2, z: 0}
        controls.target.set(p.x, p.y + 1, p.z)
      }

    }

    if (params.messageEmpty) {
      checkDistances()
    }
    if (params.angry) {
      if (params.moonFound == false && params.model.position.distanceTo(portfolioItems[7].position) <= 5) {
        moonFound()
      }
    }

    portfolioItems.forEach((i) => {
      i.rotation.y = elapsedTime * 0.2
    })

    // Update controls
    controls.update()

    // Raycaster
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(portfolioItems, true)

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

const renderEnvironment = () => {
  loadSquid()
  tick()
  if (window.innerWidth <= 800) {
    canvas.classList.add('show')
    license.classList.remove('d-none')
    return
  }

  // path, number, max scale difference, min scale, specific position(z axis)
  // Seaweed
  loadPlants('Seaweed_A_01_LOD2', 30, 0.05, 0.2, "curve")
  loadPlants('Seaweed_A_02_LOD2', 50, 0.02, 0.1)
  loadPlants('Seaweed_A_03_LOD2', 50, 0.02, 0.2)
  // Purple coral
  loadPlants('Coral_D_03_LOD3', 15, 0.2, 0.2)
  // Red Coral
  loadPlants('Coral_C_03_LOD3', 10, 0.1, 0.2 )
  loadPlants('Coral_C_03_LOD3', 7, 0.3, 0.8, -10 )
  loadPlants('Coral_C_03_LOD3', 7, 0.3, 0.8, 30 )
  // Spikey coral
  loadPlants('Coral_A_03_LOD2', 10, 0.1, 0.2)
  loadPlants('Coral_B_03_LOD2', 10, 0.1, 0.1)
  // Sponges
  loadPlants('Sponge_A_03_LOD2', 10, 0.1, 0.2)
  loadPlants('Sponge_B_03_LOD2', 20, 0.1, 0.2) // the coolest
  // Starfish
  loadPlants('Starfish_01_LOD3', 40, 0.1, 0.2)

  addPortfolioItem('/images/api.jpeg', 'api', '/api', [1, 1, 4])
  addPortfolioItem('/images/moss.png', 'moss', 'https://www.mossradio.live/users/sign_in', [-6, 1, -4])
  addPortfolioItem('/images/pomodoro.png', 'widgets', '/simple#widgets', [-13, 1, 4], true)
  addPortfolioItem('/images/america.png', 'd3', '/simple#datavis', [-20, 1, -4], true)
  addPortfolioItem('/images/skills.png', 'skills', '/simple#skills', [-27, 1, 3], true)
  addPortfolioItem('/images/finn.png', 'about', '/simple#about', [-30, 1, 7])
  addPortfolioItem('/images/certifications.png', 'certifications', '/simple#certifications', [-27, 1, 11], true)
  portfolioItems.forEach(i => scene.add(i))

  generateParticles()


  document.addEventListener('click', onClick)
  loadMoon()
}


// -----------------------------------------
// Messages, info text and window.onload function
// -----------------------------------------


const messages = [
  "Nice weather we're having, no?",
  "*guuuuuuuurrrrppp*",
  "🎵 Under the seaaaa....🎵",
  "I've heard there is a whole world above the ocean...",
  "I enjoy working for Finn!",
  "Tell me, what is water? I've heard it mentioned...",
  "I'm good at juggling. Have you tried it?",
  "You know, it's so great that you're here.",
  "My friend showed me a multicolored shell today. Isn't that nice?",
  "🎵 A B C D E F G... 🎵 ",
  "Ha! You're feet are covered in sand!",
  "...zzzzz...",
  "Sometimes I fall asleep, and wake up in places I've never seen before!",
  "It's nice to clean the ocean floor. But where does all that junk come from?",
  "Fish don't have feelings? Good thing I'm not a fish then.",
  "School was okay, but I like to swim in my own way",
  "Would you like to see my ink drawings?",
  "A thumb war? No, thank you...",
  "Gosh, I'm thirsty!",
  "A long time ago, something huge fell down from the surface...",
  "The thing that fell from above...did you see it yet?",
  "Once you're done here, maybe I can take you to where the relic landed...",
  "Time is just an illusion...lunchtime doubly so!"
]

const ouch = [
  "Bonk! Haha.",
  "I have a squishy head!",
  "Oof!",
  "Who needs brain cells?",
  "Eee!",
  "...",
  "Yes, yes, okay...",
  "Ow!",
  "Stop it now please.",
  "I mean it.",
  "I have ink, you know?",
  "If you keep doing that, you're gonna be in a world of pain!",
  "...",
  "...",
  "Okay, last warning bozo!",
  "...",
  "Ich sag's dir, das wirst du gleich bereuen!",
  "hhhhHHHHHUUUUUUAAAAAAAA!"
]

const infoHash = {
  'moss': '<h2 class="highlight">Moss Radio</h2> <p>Ruby on Rails, PostgreSQL, Stimulus.js.</p><h3 class="highlight">Includes:</h3><p> Live chat, live music stream, user authentication.</p><p class="highlight">See also: <a href="https://medium.com/@finnianj/moss-radio-using-ajax-in-rails-c0d8b8f8c434" style="text-decoration: none;">my article on using AJAX in Rails</a></p>',
  'api': '<h2 class="highlight">My API</h2> <p>Node.js, Express.js, MongoDB</p><h3 class="highlight">Includes:</h3><p> Four different API Microservices, including a community playlist - submit your favourite song!</p>',
  'widgets': '<h2 class="highlight">Widgets</h2> <p>React, Typescript, JQuery</p><h3 class="highlight">Includes:</h3><p>Pomodoro Clock, React Calculator, Drum Machine, Delivery Fee Calculator</p>',
  'd3': '<h2 class="highlight">Data Visualisation</h2> <p>D3.js</p><h3 class="highlight">Includes:</h3><p>US Education Data by County, Global Temperature Variance, Highest Grossing Films.</p',
  'info': '<h2 class="highlight">Certifications, Skills, About</h2><p>Here you can see all the certifications I have completed, as well as a full list of coding skills and a short bio.</p>',
}

const messageContainer = document.getElementById('text')
const infoContainer = document.getElementById('info')
const skillsAndCerts = document.getElementById('skills-and-certs')
const license = document.getElementById('license')

const greet = () => {
  let typed = new Typed(messageContainer, {
    strings: ["Oh, it's you!", "I'm glad you made it", " Let's have a look around, shall we?", "Use the arrow keys to move", ""],
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
      params.messageTimeout = setTimeout(() => {
        if (params.messageEmpty) randomMessage()
      }, 8000);
    }
  });
}

const endTyped = () => {
  if (controls.autoRotate) {
    controls.autoRotate = false
    setControls()
  }
  setTimeout(() => {
    messageContainer.innerText = ""
    params.messageEmpty = true
  }, 1000);
  params.messageTimeout = setTimeout(() => {
    if (params.messageEmpty) randomMessage()
  }, 8000);
}

window.onload = () => {
  renderEnvironment()
}
